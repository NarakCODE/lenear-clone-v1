-- name: CreateCycle :one
INSERT INTO cycle (workspace_id, team_id, number, name, description, start_date, end_date, status, auto_archive_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- name: GetCycle :one
SELECT * FROM cycle WHERE id = $1;

-- name: GetCycleInWorkspace :one
SELECT * FROM cycle WHERE id = $1 AND workspace_id = $2;

-- name: GetCycleByNumber :one
SELECT * FROM cycle WHERE team_id = $1 AND number = $2;

-- name: GetCurrentCycleForTeam :one
SELECT * FROM cycle
WHERE team_id = $1 AND status = 'current'
LIMIT 1;

-- name: ListCyclesByTeam :many
SELECT * FROM cycle
WHERE team_id = $1
ORDER BY number DESC;

-- name: GetMaxCycleNumber :one
SELECT COALESCE(MAX(number), 0)::int AS max_number
FROM cycle
WHERE team_id = $1;

-- name: UpdateCycle :one
UPDATE cycle SET
    name = COALESCE(sqlc.narg('name'), name),
    description = COALESCE(sqlc.narg('description'), description),
    start_date = COALESCE(sqlc.narg('start_date'), start_date),
    end_date = COALESCE(sqlc.narg('end_date'), end_date),
    status = COALESCE(sqlc.narg('status'), status),
    completed_at = COALESCE(sqlc.narg('completed_at'), completed_at),
    auto_archive_at = COALESCE(sqlc.narg('auto_archive_at'), auto_archive_at),
    updated_at = now()
WHERE id = $1 AND workspace_id = $2
RETURNING *;

-- name: DeleteCycle :exec
DELETE FROM cycle WHERE id = $1 AND workspace_id = $2;

-- name: GetCycleStats :one
SELECT
    COUNT(i.id)::int AS total_issues,
    COUNT(CASE WHEN i.status = 'done' THEN 1 END)::int AS completed_issues,
    COALESCE(SUM(i.estimate), 0)::float8 AS total_estimate,
    COALESCE(SUM(CASE WHEN i.status = 'done' THEN i.estimate ELSE 0 END), 0)::float8 AS completed_estimate
FROM issue i
WHERE i.cycle_id = $1;
