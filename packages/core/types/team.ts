export type TeamMemberRole = "lead" | "member";

export interface TeamMember {
  id: string;
  workspace_id: string;
  team_id: string;
  user_id: string;
  role: TeamMemberRole;
  user_name: string;
  user_email: string;
  user_avatar_url: string | null;
  created_at: string;
}

export interface Team {
  id: string;
  workspace_id: string;
  name: string;
  key: string;
  description: string;
  icon: string | null;
  color: string | null;
  issue_counter: number;
  cycles_enabled: boolean;
  cycle_duration_weeks: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface CreateTeamRequest {
  name: string;
  key: string;
  description?: string;
  icon?: string;
  color?: string;
  cycles_enabled?: boolean;
  cycle_duration_weeks?: number;
}

export interface UpdateTeamRequest {
  name?: string;
  key?: string;
  description?: string;
  icon?: string;
  color?: string;
  cycles_enabled?: boolean;
  cycle_duration_weeks?: number;
}

export interface AddTeamMemberRequest {
  user_id: string;
  role?: TeamMemberRole;
}

export interface UpdateTeamMemberRoleRequest {
  role: TeamMemberRole;
}
