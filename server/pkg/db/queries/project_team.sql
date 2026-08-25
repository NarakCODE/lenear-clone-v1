-- name: AddProjectTeam :exec
INSERT INTO project_team (project_id, team_id, workspace_id)
VALUES ($1, $2, $3)
ON CONFLICT (project_id, team_id) DO NOTHING;

-- name: RemoveProjectTeam :execrows
DELETE FROM project_team
WHERE project_id = $1 AND team_id = $2;

-- name: ListTeamsForProject :many
SELECT t.* FROM team t
JOIN project_team pt ON pt.team_id = t.id
WHERE pt.project_id = $1 AND t.archived_at IS NULL
ORDER BY t.name ASC;

-- name: ListProjectsForTeam :many
SELECT p.* FROM project p
JOIN project_team pt ON pt.project_id = p.id
WHERE pt.team_id = $1
ORDER BY p.created_at ASC;

-- name: ClearProjectTeams :exec
DELETE FROM project_team WHERE project_id = $1;
