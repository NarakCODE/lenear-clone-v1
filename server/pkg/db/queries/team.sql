-- name: CreateTeam :one
INSERT INTO team (workspace_id, name, key, description, icon, color, cycles_enabled, cycle_duration_weeks)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: GetTeam :one
SELECT * FROM team WHERE id = $1;

-- name: GetTeamInWorkspace :one
SELECT * FROM team WHERE id = $1 AND workspace_id = $2;

-- name: GetTeamByKey :one
SELECT * FROM team WHERE workspace_id = $1 AND lower(key) = lower($2) AND archived_at IS NULL;

-- name: ListTeams :many
SELECT * FROM team
WHERE workspace_id = $1 AND archived_at IS NULL
ORDER BY created_at ASC;

-- name: ListAllTeams :many
SELECT * FROM team
WHERE workspace_id = $1
ORDER BY created_at ASC;

-- name: UpdateTeam :one
UPDATE team SET
    name = COALESCE(sqlc.narg('name'), name),
    key = COALESCE(sqlc.narg('key'), key),
    description = COALESCE(sqlc.narg('description'), description),
    icon = COALESCE(sqlc.narg('icon'), icon),
    color = COALESCE(sqlc.narg('color'), color),
    cycles_enabled = COALESCE(sqlc.narg('cycles_enabled'), cycles_enabled),
    cycle_duration_weeks = COALESCE(sqlc.narg('cycle_duration_weeks'), cycle_duration_weeks),
    updated_at = now()
WHERE id = $1 AND workspace_id = $2
RETURNING *;

-- name: ArchiveTeam :one
UPDATE team SET archived_at = now(), updated_at = now()
WHERE id = $1 AND workspace_id = $2
RETURNING *;

-- name: DeleteTeam :exec
DELETE FROM team WHERE id = $1 AND workspace_id = $2;

-- name: IncrementTeamIssueCounter :one
UPDATE team SET issue_counter = issue_counter + 1, updated_at = now()
WHERE id = $1
RETURNING issue_counter;

-- name: AddTeamMember :one
INSERT INTO team_member (workspace_id, team_id, user_id, role)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: RemoveTeamMember :execrows
DELETE FROM team_member
WHERE team_id = $1 AND user_id = $2;

-- name: ListTeamMembers :many
SELECT tm.*, u.name AS user_name, u.email AS user_email, u.avatar_url AS user_avatar_url
FROM team_member tm
JOIN "user" u ON u.id = tm.user_id
WHERE tm.team_id = $1
ORDER BY tm.created_at ASC;

-- name: GetTeamMember :one
SELECT * FROM team_member WHERE team_id = $1 AND user_id = $2;

-- name: UpdateTeamMemberRole :one
UPDATE team_member SET role = $3, updated_at = now()
WHERE team_id = $1 AND user_id = $2
RETURNING *;

-- name: IsTeamMember :one
SELECT EXISTS(
    SELECT 1 FROM team_member
    WHERE team_id = $1 AND user_id = $2
) AS is_member;

-- name: ListTeamsForUser :many
SELECT t.* FROM team t
JOIN team_member tm ON tm.team_id = t.id
WHERE t.workspace_id = $1 AND tm.user_id = $2 AND t.archived_at IS NULL
ORDER BY t.created_at ASC;
