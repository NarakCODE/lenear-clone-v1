CREATE UNIQUE INDEX CONCURRENTLY idx_team_member_team_user ON team_member (team_id, user_id);
