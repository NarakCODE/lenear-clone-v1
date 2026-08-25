CREATE INDEX CONCURRENTLY idx_issue_cycle_id ON issue (cycle_id, position) WHERE cycle_id IS NOT NULL;
