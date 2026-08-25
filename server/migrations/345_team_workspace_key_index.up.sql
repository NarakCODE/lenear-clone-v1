CREATE UNIQUE INDEX CONCURRENTLY idx_team_workspace_key ON team (workspace_id, lower(key)) WHERE archived_at IS NULL;
