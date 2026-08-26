// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Team, TeamMember } from "@multica/core/types";
import { renderWithI18n } from "../../test/i18n";
import { NavigationProvider, type NavigationAdapter } from "../../navigation";
import { TeamDetailPage } from "./team-detail-page";

const mocks = vi.hoisted(() => ({
  team: null as Team | null,
  members: [] as TeamMember[],
  cycles: [] as Array<{ id: string; number: number; name?: string; status: string; start_date: string; end_date: string }>,
  currentCycle: null as { number: number; name?: string; start_date: string; end_date: string; total_issues?: number; completed_issues?: number } | null,
  wsMembers: [] as Array<{ user_id: string; name: string; email: string; role: string }>,
  isLoading: false,
  updateTeam: vi.fn(),
  deleteTeam: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
  updateRole: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: { queryKey?: readonly unknown[]; enabled?: boolean }) => {
    const key = options.queryKey?.[2];
    if (key === "detail") {
      return { data: mocks.team, isLoading: mocks.isLoading };
    }
    if (key === "members") {
      return { data: mocks.members, isLoading: false };
    }
    const rootKey = options.queryKey?.[0];
    if (rootKey === "cycles") {
      return { data: mocks.cycles, isLoading: false };
    }
    if (rootKey === "current-cycle") {
      return { data: mocks.currentCycle, isLoading: false };
    }
    if (rootKey === "members") {
      return { data: mocks.wsMembers, isLoading: false };
    }
    return { data: undefined, isLoading: false };
  },
  useMutation: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock("@multica/core/teams", () => ({
  teamDetailOptions: () => ({ queryKey: ["teams", "ws-1", "detail"] }),
  teamMembersOptions: () => ({ queryKey: ["teams", "ws-1", "members"] }),
  teamKeys: {
    list: () => ["teams", "ws-1", "list"],
    detail: () => ["teams", "ws-1", "detail"],
    members: () => ["teams", "ws-1", "members"],
  },
  useCreateTeam: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateTeam: () => ({ mutate: mocks.updateTeam, mutateAsync: mocks.updateTeam, isPending: false }),
  useDeleteTeam: () => ({ mutate: mocks.deleteTeam, isPending: false }),
  useAddTeamMember: () => ({ mutate: mocks.addMember, mutateAsync: mocks.addMember, isPending: false }),
  useRemoveTeamMember: () => ({ mutate: mocks.removeMember, isPending: false }),
  useUpdateTeamMemberRole: () => ({ mutate: mocks.updateRole, isPending: false }),
}));

vi.mock("@multica/core/cycles", () => ({
  cycleListOptions: () => ({ queryKey: ["cycles"] }),
  currentCycleOptions: () => ({ queryKey: ["current-cycle"] }),
}));

vi.mock("@multica/core/hooks", () => ({
  useWorkspaceId: () => "ws-1",
}));

vi.mock("@multica/core/paths", () => ({
  useCurrentWorkspace: () => ({ id: "ws-1", slug: "test-workspace" }),
  useWorkspacePaths: () => ({
    teams: () => "/test-workspace/teams",
    teamDetail: (id: string) => `/test-workspace/teams/${id}`,
    memberDetail: (id: string) => `/test-workspace/members/${id}`,
  }),
}));

vi.mock("@multica/core/auth", () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ user: { id: "user-1" } }),
}));

vi.mock("@multica/core/workspace/queries", () => ({
  memberListOptions: () => ({ queryKey: ["members"] }),
}));

vi.mock("../../common/actor-avatar", () => ({
  ActorAvatar: ({ actorId }: { actorId: string }) => (
    <span data-testid={`avatar-${actorId}`} />
  ),
}));

const TEAM_FIXTURE: Team = {
  id: "team-1",
  workspace_id: "ws-1",
  name: "Frontend Platform",
  key: "FE",
  description: "Core frontend architecture and design system",
  icon: null,
  color: "#3b82f6",
  issue_counter: 28,
  cycles_enabled: true,
  cycle_duration_weeks: 2,
  archived_at: null,
  created_at: "2026-06-01T00:00:00Z",
  updated_at: "2026-06-01T00:00:00Z",
};

const MEMBER_FIXTURE: TeamMember = {
  id: "tm-1",
  workspace_id: "ws-1",
  team_id: "team-1",
  user_id: "user-1",
  role: "lead",
  user_name: "Alice Developer",
  user_email: "alice@example.com",
  user_avatar_url: null,
  created_at: "2026-06-01T00:00:00Z",
};

function makeAdapter(overrides: Partial<NavigationAdapter> = {}): NavigationAdapter {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    pathname: "/test-workspace/teams/team-1",
    searchParams: new URLSearchParams(),
    getShareableUrl: (p) => p,
    ...overrides,
  };
}

function renderTeamDetail(adapter = makeAdapter()) {
  renderWithI18n(
    <NavigationProvider value={adapter}>
      <TeamDetailPage teamId="team-1" />
    </NavigationProvider>,
  );
  return adapter;
}

beforeEach(() => {
  mocks.team = TEAM_FIXTURE;
  mocks.members = [MEMBER_FIXTURE];
  mocks.cycles = [
    {
      id: "cycle-1",
      number: 14,
      name: "Q3 Sprint 2",
      status: "current",
      start_date: "2026-08-01T00:00:00Z",
      end_date: "2026-08-15T00:00:00Z",
    },
  ];
  mocks.currentCycle = {
    number: 14,
    name: "Q3 Sprint 2",
    start_date: "2026-08-01T00:00:00Z",
    end_date: "2026-08-15T00:00:00Z",
    total_issues: 15,
    completed_issues: 10,
  };
  mocks.wsMembers = [
    { user_id: "user-1", name: "Alice Developer", email: "alice@example.com", role: "admin" },
    { user_id: "user-2", name: "Bob Engineer", email: "bob@example.com", role: "member" },
  ];
  mocks.isLoading = false;
  mocks.updateTeam.mockClear();
  mocks.deleteTeam.mockClear();
  mocks.addMember.mockClear();
  mocks.removeMember.mockClear();
  mocks.updateRole.mockClear();
});

describe("TeamDetailPage", () => {
  it("renders breadcrumb header with team name and avatar", () => {
    renderTeamDetail();

    expect(screen.getByRole("heading", { level: 1, name: "Frontend Platform" })).toBeInTheDocument();
    expect(screen.getByText("FE")).toBeInTheDocument();
  });

  it("renders inspector details and overview stats", () => {
    renderTeamDetail();

    expect(screen.getByText("Core frontend architecture and design system")).toBeInTheDocument();
    expect(screen.getByText("Active Cycle")).toBeInTheDocument();
    expect(screen.getByText("Q3 Sprint 2")).toBeInTheDocument();
    expect(screen.getAllByText("28").length).toBeGreaterThanOrEqual(1);
  });

  it("switches to members tab and displays team members", async () => {
    const user = userEvent.setup();
    renderTeamDetail();

    const membersTabBtn = screen.getByRole("button", { name: /Members/i });
    await user.click(membersTabBtn);

    expect(screen.getByText("Alice Developer")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("switches to cycles tab and shows cycle list", async () => {
    const user = userEvent.setup();
    renderTeamDetail();

    const cyclesTabBtn = screen.getByRole("button", { name: /Cycles/i });
    await user.click(cyclesTabBtn);

    expect(screen.getByText("Team Cycles")).toBeInTheDocument();
    expect(screen.getByText("Q3 Sprint 2")).toBeInTheDocument();
  });

  it("switches to settings tab and renders team form", async () => {
    const user = userEvent.setup();
    renderTeamDetail();

    const settingsTabBtn = screen.getByRole("button", { name: /Settings/i });
    await user.click(settingsTabBtn);

    expect(screen.getByDisplayValue("Frontend Platform")).toBeInTheDocument();
    expect(screen.getByDisplayValue("FE")).toBeInTheDocument();
  });
});
