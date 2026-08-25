CREATE INDEX CONCURRENTLY idx_issue_status_team ON issue_status (team_id, position) WHERE team_id IS NOT NULL;
