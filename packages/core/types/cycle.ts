export type CycleStatus = "upcoming" | "current" | "previous";

export interface Cycle {
  id: string;
  workspace_id: string;
  team_id: string;
  number: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  completed_at: string | null;
  status: CycleStatus;
  auto_archive_at: string | null;
  created_at: string;
  updated_at: string;
  total_issues?: number;
  completed_issues?: number;
  total_estimate?: number;
  completed_estimate?: number;
}

export interface CycleProgress {
  total_issues: number;
  completed_issues: number;
  total_estimate: number;
  completed_estimate: number;
}

export interface CreateCycleRequest {
  name?: string;
  description?: string;
  start_date: string;
  end_date: string;
  status?: CycleStatus;
}

export interface UpdateCycleRequest {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: CycleStatus;
  completed_at?: string | null;
}
