package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/multica-ai/multica/server/internal/util"
	db "github.com/multica-ai/multica/server/pkg/db/generated"
	"github.com/multica-ai/multica/server/pkg/protocol"
)

type TeamResponse struct {
	ID                 string  `json:"id"`
	WorkspaceID        string  `json:"workspace_id"`
	Name               string  `json:"name"`
	Key                string  `json:"key"`
	Description        string  `json:"description"`
	Icon               *string `json:"icon"`
	Color              *string `json:"color"`
	IssueCounter       int32   `json:"issue_counter"`
	CyclesEnabled      bool    `json:"cycles_enabled"`
	CycleDurationWeeks int32   `json:"cycle_duration_weeks"`
	ArchivedAt         *string `json:"archived_at"`
	CreatedAt          string  `json:"created_at"`
	UpdatedAt          string  `json:"updated_at"`
	MemberCount        int     `json:"member_count,omitempty"`
}

type TeamMemberResponse struct {
	ID            string  `json:"id"`
	WorkspaceID   string  `json:"workspace_id"`
	TeamID        string  `json:"team_id"`
	UserID        string  `json:"user_id"`
	Role          string  `json:"role"`
	UserName      string  `json:"user_name"`
	UserEmail     string  `json:"user_email"`
	UserAvatarURL *string `json:"user_avatar_url"`
	CreatedAt     string  `json:"created_at"`
}

func teamToResponse(t db.Team) TeamResponse {
	var archivedAt *string
	if t.ArchivedAt.Valid {
		s := timestampToString(t.ArchivedAt)
		archivedAt = &s
	}
	return TeamResponse{
		ID:                 uuidToString(t.ID),
		WorkspaceID:        uuidToString(t.WorkspaceID),
		Name:               t.Name,
		Key:                t.Key,
		Description:        t.Description,
		Icon:               textToPtr(t.Icon),
		Color:              textToPtr(t.Color),
		IssueCounter:       t.IssueCounter,
		CyclesEnabled:      t.CyclesEnabled,
		CycleDurationWeeks: t.CycleDurationWeeks,
		ArchivedAt:         archivedAt,
		CreatedAt:          timestampToString(t.CreatedAt),
		UpdatedAt:          timestampToString(t.UpdatedAt),
	}
}

type CreateTeamRequest struct {
	Name               string  `json:"name"`
	Key                string  `json:"key"`
	Description        *string `json:"description"`
	Icon               *string `json:"icon"`
	Color              *string `json:"color"`
	CyclesEnabled      *bool   `json:"cycles_enabled"`
	CycleDurationWeeks *int32  `json:"cycle_duration_weeks"`
}

type UpdateTeamRequest struct {
	Name               *string `json:"name"`
	Key                *string `json:"key"`
	Description        *string `json:"description"`
	Icon               *string `json:"icon"`
	Color              *string `json:"color"`
	CyclesEnabled      *bool   `json:"cycles_enabled"`
	CycleDurationWeeks *int32  `json:"cycle_duration_weeks"`
}

type AddTeamMemberRequest struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
}

type UpdateTeamMemberRoleRequest struct {
	Role string `json:"role"`
}

func (h *Handler) ListTeams(w http.ResponseWriter, r *http.Request) {
	workspaceID := h.resolveWorkspaceID(r)
	wsUUID, ok := parseUUIDOrBadRequest(w, workspaceID, "workspace_id")
	if !ok {
		return
	}

	teams, err := h.Queries.ListTeams(r.Context(), wsUUID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list teams")
		return
	}

	res := make([]TeamResponse, len(teams))
	for i, t := range teams {
		res[i] = teamToResponse(t)
	}

	writeJSON(w, http.StatusOK, res)
}

func (h *Handler) CreateTeam(w http.ResponseWriter, r *http.Request) {
	workspaceID := h.resolveWorkspaceID(r)
	wsUUID, ok := parseUUIDOrBadRequest(w, workspaceID, "workspace_id")
	if !ok {
		return
	}

	var req CreateTeamRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}

	key := strings.ToUpper(strings.TrimSpace(req.Key))
	if key == "" {
		writeError(w, http.StatusBadRequest, "key is required")
		return
	}

	desc := ""
	if req.Description != nil {
		desc = *req.Description
	}

	cyclesEnabled := true
	if req.CyclesEnabled != nil {
		cyclesEnabled = *req.CyclesEnabled
	}

	cycleDuration := int32(2)
	if req.CycleDurationWeeks != nil && *req.CycleDurationWeeks >= 1 && *req.CycleDurationWeeks <= 8 {
		cycleDuration = *req.CycleDurationWeeks
	}

	team, err := h.Queries.CreateTeam(r.Context(), db.CreateTeamParams{
		WorkspaceID:        wsUUID,
		Name:               name,
		Key:                key,
		Description:        desc,
		Icon:               ptrToText(req.Icon),
		Color:              ptrToText(req.Color),
		CyclesEnabled:      cyclesEnabled,
		CycleDurationWeeks: cycleDuration,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create team: "+err.Error())
		return
	}

	// Add the current user as team lead
	userID := requestUserID(r)
	if userUUID, err := util.ParseUUID(userID); err == nil {
		_, _ = h.Queries.AddTeamMember(r.Context(), db.AddTeamMemberParams{
			WorkspaceID: wsUUID,
			TeamID:      team.ID,
			UserID:      userUUID,
			Role:        "lead",
		})
	}

	h.publish(protocol.EventTeamCreated, workspaceID, "member", userID, teamToResponse(team))

	writeJSON(w, http.StatusCreated, teamToResponse(team))
}

func (h *Handler) GetTeam(w http.ResponseWriter, r *http.Request) {
	workspaceID := h.resolveWorkspaceID(r)
	wsUUID, ok := parseUUIDOrBadRequest(w, workspaceID, "workspace_id")
	if !ok {
		return
	}

	teamID := chi.URLParam(r, "teamId")
	if teamID == "" {
		teamID = chi.URLParam(r, "id")
	}
	tUUID, ok := parseUUIDOrBadRequest(w, teamID, "team_id")
	if !ok {
		return
	}

	team, err := h.Queries.GetTeamInWorkspace(r.Context(), db.GetTeamInWorkspaceParams{
		ID:          tUUID,
		WorkspaceID: wsUUID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "team not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to get team")
		return
	}

	writeJSON(w, http.StatusOK, teamToResponse(team))
}

func (h *Handler) UpdateTeam(w http.ResponseWriter, r *http.Request) {
	workspaceID := h.resolveWorkspaceID(r)
	wsUUID, ok := parseUUIDOrBadRequest(w, workspaceID, "workspace_id")
	if !ok {
		return
	}

	teamID := chi.URLParam(r, "teamId")
	if teamID == "" {
		teamID = chi.URLParam(r, "id")
	}
	tUUID, ok := parseUUIDOrBadRequest(w, teamID, "team_id")
	if !ok {
		return
	}

	var req UpdateTeamRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var keyText pgtype.Text
	if req.Key != nil {
		keyText = pgtype.Text{String: strings.ToUpper(strings.TrimSpace(*req.Key)), Valid: true}
	}

	team, err := h.Queries.UpdateTeam(r.Context(), db.UpdateTeamParams{
		ID:                 tUUID,
		WorkspaceID:        wsUUID,
		Name:               pgtypeTextFromPtr(req.Name),
		Key:                keyText,
		Description:        pgtypeTextFromPtr(req.Description),
		Icon:               pgtypeTextFromPtr(req.Icon),
		Color:              pgtypeTextFromPtr(req.Color),
		CyclesEnabled:      pgtypeBoolFromPtr(req.CyclesEnabled),
		CycleDurationWeeks: pgtypeInt4FromPtr(req.CycleDurationWeeks),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "team not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to update team")
		return
	}

	userID := requestUserID(r)
	h.publish(protocol.EventTeamUpdated, workspaceID, "member", userID, teamToResponse(team))

	writeJSON(w, http.StatusOK, teamToResponse(team))
}

func (h *Handler) ArchiveTeam(w http.ResponseWriter, r *http.Request) {
	workspaceID := h.resolveWorkspaceID(r)
	wsUUID, ok := parseUUIDOrBadRequest(w, workspaceID, "workspace_id")
	if !ok {
		return
	}

	teamID := chi.URLParam(r, "teamId")
	if teamID == "" {
		teamID = chi.URLParam(r, "id")
	}
	tUUID, ok := parseUUIDOrBadRequest(w, teamID, "team_id")
	if !ok {
		return
	}

	team, err := h.Queries.ArchiveTeam(r.Context(), db.ArchiveTeamParams{
		ID:          tUUID,
		WorkspaceID: wsUUID,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to archive team")
		return
	}

	userID := requestUserID(r)
	h.publish(protocol.EventTeamArchived, workspaceID, "member", userID, teamToResponse(team))

	writeJSON(w, http.StatusOK, teamToResponse(team))
}

func (h *Handler) DeleteTeam(w http.ResponseWriter, r *http.Request) {
	workspaceID := h.resolveWorkspaceID(r)
	wsUUID, ok := parseUUIDOrBadRequest(w, workspaceID, "workspace_id")
	if !ok {
		return
	}

	teamID := chi.URLParam(r, "teamId")
	if teamID == "" {
		teamID = chi.URLParam(r, "id")
	}
	tUUID, ok := parseUUIDOrBadRequest(w, teamID, "team_id")
	if !ok {
		return
	}

	err := h.Queries.DeleteTeam(r.Context(), db.DeleteTeamParams{
		ID:          tUUID,
		WorkspaceID: wsUUID,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete team")
		return
	}

	userID := requestUserID(r)
	h.publish(protocol.EventTeamDeleted, workspaceID, "member", userID, map[string]string{"id": teamID})

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) ListTeamMembers(w http.ResponseWriter, r *http.Request) {
	teamID := chi.URLParam(r, "teamId")
	if teamID == "" {
		teamID = chi.URLParam(r, "id")
	}
	tUUID, ok := parseUUIDOrBadRequest(w, teamID, "team_id")
	if !ok {
		return
	}

	members, err := h.Queries.ListTeamMembers(r.Context(), tUUID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list team members")
		return
	}

	res := make([]TeamMemberResponse, len(members))
	for i, m := range members {
		res[i] = TeamMemberResponse{
			ID:            uuidToString(m.ID),
			WorkspaceID:   uuidToString(m.WorkspaceID),
			TeamID:        uuidToString(m.TeamID),
			UserID:        uuidToString(m.UserID),
			Role:          m.Role,
			UserName:      m.UserName,
			UserEmail:     m.UserEmail,
			UserAvatarURL: textToPtr(m.UserAvatarUrl),
			CreatedAt:     timestampToString(m.CreatedAt),
		}
	}

	writeJSON(w, http.StatusOK, res)
}

func (h *Handler) AddTeamMember(w http.ResponseWriter, r *http.Request) {
	workspaceID := h.resolveWorkspaceID(r)
	wsUUID, ok := parseUUIDOrBadRequest(w, workspaceID, "workspace_id")
	if !ok {
		return
	}

	teamID := chi.URLParam(r, "teamId")
	if teamID == "" {
		teamID = chi.URLParam(r, "id")
	}
	tUUID, ok := parseUUIDOrBadRequest(w, teamID, "team_id")
	if !ok {
		return
	}

	var req AddTeamMemberRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	uUUID, ok := parseUUIDOrBadRequest(w, req.UserID, "user_id")
	if !ok {
		return
	}

	role := "member"
	if req.Role == "lead" {
		role = "lead"
	}

	member, err := h.Queries.AddTeamMember(r.Context(), db.AddTeamMemberParams{
		WorkspaceID: wsUUID,
		TeamID:      tUUID,
		UserID:      uUUID,
		Role:        role,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to add team member")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"id":      uuidToString(member.ID),
		"team_id": uuidToString(member.TeamID),
		"user_id": uuidToString(member.UserID),
		"role":    member.Role,
	})
}

func (h *Handler) UpdateTeamMemberRole(w http.ResponseWriter, r *http.Request) {
	teamID := chi.URLParam(r, "teamId")
	if teamID == "" {
		teamID = chi.URLParam(r, "id")
	}
	tUUID, ok := parseUUIDOrBadRequest(w, teamID, "team_id")
	if !ok {
		return
	}

	userID := chi.URLParam(r, "userId")
	uUUID, ok := parseUUIDOrBadRequest(w, userID, "user_id")
	if !ok {
		return
	}

	var req UpdateTeamMemberRoleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	member, err := h.Queries.UpdateTeamMemberRole(r.Context(), db.UpdateTeamMemberRoleParams{
		TeamID: tUUID,
		UserID: uUUID,
		Role:   req.Role,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update team member role")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"id":      uuidToString(member.ID),
		"team_id": uuidToString(member.TeamID),
		"user_id": uuidToString(member.UserID),
		"role":    member.Role,
	})
}

func (h *Handler) RemoveTeamMember(w http.ResponseWriter, r *http.Request) {
	teamID := chi.URLParam(r, "teamId")
	if teamID == "" {
		teamID = chi.URLParam(r, "id")
	}
	tUUID, ok := parseUUIDOrBadRequest(w, teamID, "team_id")
	if !ok {
		return
	}

	userID := chi.URLParam(r, "userId")
	uUUID, ok := parseUUIDOrBadRequest(w, userID, "user_id")
	if !ok {
		return
	}

	_, err := h.Queries.RemoveTeamMember(r.Context(), db.RemoveTeamMemberParams{
		TeamID: tUUID,
		UserID: uUUID,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to remove team member")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func pgtypeInt4FromPtr(p *int32) pgtype.Int4 {
	if p == nil {
		return pgtype.Int4{}
	}
	return pgtype.Int4{Int32: *p, Valid: true}
}
