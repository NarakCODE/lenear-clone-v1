package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/multica-ai/multica/server/pkg/db/generated"
	"github.com/multica-ai/multica/server/pkg/protocol"
)

type CycleResponse struct {
	ID                string   `json:"id"`
	WorkspaceID       string   `json:"workspace_id"`
	TeamID            string   `json:"team_id"`
	Number            int32    `json:"number"`
	Name              string   `json:"name"`
	Description       string   `json:"description"`
	StartDate         string   `json:"start_date"`
	EndDate           string   `json:"end_date"`
	CompletedAt       *string  `json:"completed_at"`
	Status            string   `json:"status"`
	AutoArchiveAt     *string  `json:"auto_archive_at"`
	CreatedAt         string   `json:"created_at"`
	UpdatedAt         string   `json:"updated_at"`
	TotalIssues       *int     `json:"total_issues,omitempty"`
	CompletedIssues   *int     `json:"completed_issues,omitempty"`
	TotalEstimate     *float64 `json:"total_estimate,omitempty"`
	CompletedEstimate *float64 `json:"completed_estimate,omitempty"`
}

func cycleToResponse(c db.Cycle) CycleResponse {
	var completedAt *string
	if c.CompletedAt.Valid {
		s := timestampToString(c.CompletedAt)
		completedAt = &s
	}
	var autoArchiveAt *string
	if c.AutoArchiveAt.Valid {
		s := timestampToString(c.AutoArchiveAt)
		autoArchiveAt = &s
	}
	return CycleResponse{
		ID:            uuidToString(c.ID),
		WorkspaceID:   uuidToString(c.WorkspaceID),
		TeamID:        uuidToString(c.TeamID),
		Number:        c.Number,
		Name:          c.Name,
		Description:   c.Description,
		StartDate:     timestampToString(c.StartDate),
		EndDate:       timestampToString(c.EndDate),
		CompletedAt:   completedAt,
		Status:        c.Status,
		AutoArchiveAt: autoArchiveAt,
		CreatedAt:     timestampToString(c.CreatedAt),
		UpdatedAt:     timestampToString(c.UpdatedAt),
	}
}

type CreateCycleRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	StartDate   string  `json:"start_date"`
	EndDate     string  `json:"end_date"`
	Status      *string `json:"status"`
}

type UpdateCycleRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	StartDate   *string `json:"start_date"`
	EndDate     *string `json:"end_date"`
	Status      *string `json:"status"`
	CompletedAt *string `json:"completed_at"`
}

func (h *Handler) ListCycles(w http.ResponseWriter, r *http.Request) {
	teamID := chi.URLParam(r, "teamId")
	tUUID, ok := parseUUIDOrBadRequest(w, teamID, "team_id")
	if !ok {
		return
	}

	cycles, err := h.Queries.ListCyclesByTeam(r.Context(), tUUID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list cycles")
		return
	}

	res := make([]CycleResponse, len(cycles))
	for i, c := range cycles {
		res[i] = cycleToResponse(c)
	}

	writeJSON(w, http.StatusOK, res)
}

func (h *Handler) GetCurrentCycle(w http.ResponseWriter, r *http.Request) {
	teamID := chi.URLParam(r, "teamId")
	tUUID, ok := parseUUIDOrBadRequest(w, teamID, "team_id")
	if !ok {
		return
	}

	cycle, err := h.Queries.GetCurrentCycleForTeam(r.Context(), tUUID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeJSON(w, http.StatusOK, nil)
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to get current cycle")
		return
	}

	res := cycleToResponse(cycle)

	// Attach stats
	stats, err := h.Queries.GetCycleStats(r.Context(), pgtype.UUID{Bytes: cycle.ID.Bytes, Valid: true})
	if err == nil {
		ti := int(stats.TotalIssues)
		ci := int(stats.CompletedIssues)
		te := stats.TotalEstimate
		ce := stats.CompletedEstimate
		res.TotalIssues = &ti
		res.CompletedIssues = &ci
		res.TotalEstimate = &te
		res.CompletedEstimate = &ce
	}

	writeJSON(w, http.StatusOK, res)
}

func (h *Handler) CreateCycle(w http.ResponseWriter, r *http.Request) {
	workspaceID := h.resolveWorkspaceID(r)
	wsUUID, ok := parseUUIDOrBadRequest(w, workspaceID, "workspace_id")
	if !ok {
		return
	}

	teamID := chi.URLParam(r, "teamId")
	tUUID, ok := parseUUIDOrBadRequest(w, teamID, "team_id")
	if !ok {
		return
	}

	var req CreateCycleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	startDate, err := time.Parse(time.RFC3339, req.StartDate)
	if err != nil {
		startDate, err = time.Parse("2006-01-02", req.StartDate)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid start_date format")
			return
		}
	}

	endDate, err := time.Parse(time.RFC3339, req.EndDate)
	if err != nil {
		endDate, err = time.Parse("2006-01-02", req.EndDate)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid end_date format")
			return
		}
	}

	if !endDate.After(startDate) {
		writeError(w, http.StatusBadRequest, "end_date must be after start_date")
		return
	}

	maxNumber, err := h.Queries.GetMaxCycleNumber(r.Context(), tUUID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get cycle number")
		return
	}
	nextNumber := maxNumber + 1

	name := ""
	if req.Name != nil && *req.Name != "" {
		name = *req.Name
	}

	desc := ""
	if req.Description != nil {
		desc = *req.Description
	}

	status := "upcoming"
	if req.Status != nil && (*req.Status == "current" || *req.Status == "previous") {
		status = *req.Status
	}

	cycle, err := h.Queries.CreateCycle(r.Context(), db.CreateCycleParams{
		WorkspaceID: wsUUID,
		TeamID:      tUUID,
		Number:      nextNumber,
		Name:        name,
		Description: desc,
		StartDate:   pgtype.Timestamptz{Time: startDate, Valid: true},
		EndDate:     pgtype.Timestamptz{Time: endDate, Valid: true},
		Status:      status,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create cycle: "+err.Error())
		return
	}

	userID := requestUserID(r)
	h.publish(protocol.EventCycleCreated, workspaceID, "member", userID, cycleToResponse(cycle))

	writeJSON(w, http.StatusCreated, cycleToResponse(cycle))
}

func (h *Handler) GetCycle(w http.ResponseWriter, r *http.Request) {
	workspaceID := h.resolveWorkspaceID(r)
	wsUUID, ok := parseUUIDOrBadRequest(w, workspaceID, "workspace_id")
	if !ok {
		return
	}

	cycleID := chi.URLParam(r, "id")
	cUUID, ok := parseUUIDOrBadRequest(w, cycleID, "cycle_id")
	if !ok {
		return
	}

	cycle, err := h.Queries.GetCycleInWorkspace(r.Context(), db.GetCycleInWorkspaceParams{
		ID:          cUUID,
		WorkspaceID: wsUUID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "cycle not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to get cycle")
		return
	}

	res := cycleToResponse(cycle)
	stats, err := h.Queries.GetCycleStats(r.Context(), pgtype.UUID{Bytes: cycle.ID.Bytes, Valid: true})
	if err == nil {
		ti := int(stats.TotalIssues)
		ci := int(stats.CompletedIssues)
		te := stats.TotalEstimate
		ce := stats.CompletedEstimate
		res.TotalIssues = &ti
		res.CompletedIssues = &ci
		res.TotalEstimate = &te
		res.CompletedEstimate = &ce
	}

	writeJSON(w, http.StatusOK, res)
}

func (h *Handler) UpdateCycle(w http.ResponseWriter, r *http.Request) {
	workspaceID := h.resolveWorkspaceID(r)
	wsUUID, ok := parseUUIDOrBadRequest(w, workspaceID, "workspace_id")
	if !ok {
		return
	}

	cycleID := chi.URLParam(r, "id")
	cUUID, ok := parseUUIDOrBadRequest(w, cycleID, "cycle_id")
	if !ok {
		return
	}

	var req UpdateCycleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var startTimestamptz pgtype.Timestamptz
	if req.StartDate != nil {
		if t, err := time.Parse(time.RFC3339, *req.StartDate); err == nil {
			startTimestamptz = pgtype.Timestamptz{Time: t, Valid: true}
		}
	}

	var endTimestamptz pgtype.Timestamptz
	if req.EndDate != nil {
		if t, err := time.Parse(time.RFC3339, *req.EndDate); err == nil {
			endTimestamptz = pgtype.Timestamptz{Time: t, Valid: true}
		}
	}

	var completedTimestamptz pgtype.Timestamptz
	if req.CompletedAt != nil {
		if t, err := time.Parse(time.RFC3339, *req.CompletedAt); err == nil {
			completedTimestamptz = pgtype.Timestamptz{Time: t, Valid: true}
		}
	}

	cycle, err := h.Queries.UpdateCycle(r.Context(), db.UpdateCycleParams{
		ID:          cUUID,
		WorkspaceID: wsUUID,
		Name:        pgtypeTextFromPtr(req.Name),
		Description: pgtypeTextFromPtr(req.Description),
		StartDate:   startTimestamptz,
		EndDate:     endTimestamptz,
		Status:      pgtypeTextFromPtr(req.Status),
		CompletedAt: completedTimestamptz,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "cycle not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to update cycle")
		return
	}

	userID := requestUserID(r)
	h.publish(protocol.EventCycleUpdated, workspaceID, "member", userID, cycleToResponse(cycle))

	writeJSON(w, http.StatusOK, cycleToResponse(cycle))
}

func (h *Handler) DeleteCycle(w http.ResponseWriter, r *http.Request) {
	workspaceID := h.resolveWorkspaceID(r)
	wsUUID, ok := parseUUIDOrBadRequest(w, workspaceID, "workspace_id")
	if !ok {
		return
	}

	cycleID := chi.URLParam(r, "id")
	cUUID, ok := parseUUIDOrBadRequest(w, cycleID, "cycle_id")
	if !ok {
		return
	}

	err := h.Queries.DeleteCycle(r.Context(), db.DeleteCycleParams{
		ID:          cUUID,
		WorkspaceID: wsUUID,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete cycle")
		return
	}

	userID := requestUserID(r)
	h.publish(protocol.EventCycleDeleted, workspaceID, "member", userID, map[string]string{"id": cycleID})

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) GetCycleProgress(w http.ResponseWriter, r *http.Request) {
	cycleID := chi.URLParam(r, "id")
	cUUID, ok := parseUUIDOrBadRequest(w, cycleID, "cycle_id")
	if !ok {
		return
	}

	stats, err := h.Queries.GetCycleStats(r.Context(), pgtype.UUID{Bytes: cUUID.Bytes, Valid: true})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get cycle progress")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"total_issues":       stats.TotalIssues,
		"completed_issues":   stats.CompletedIssues,
		"total_estimate":     stats.TotalEstimate,
		"completed_estimate": stats.CompletedEstimate,
	})
}
