CREATE INDEX CONCURRENTLY idx_issue_team_id ON issue (team_id, position) WHERE team_id IS NOT NULL;
