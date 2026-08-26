// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import type { Team, TeamMember } from "@multica/core/types";
import { renderWithI18n } from "../../test/i18n";
import { NavigationProvider, type NavigationAdapter } from "../../navigation";
import { TeamProfileCard } from "./team-profile-card";

const mocks = vi.hoisted(() => ({
  teams: [] as Team[],
  members: [] as TeamMember[],
  isLoading: false,
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: { queryKey?: readonly unknown[] }) => {
    const key = options.queryKey?.[2];
    if (key === "members") {
      return { data: mocks.members, isLoading: false };
    }
    const rootKey = options.queryKey?.[0];
    if (rootKey === "teams") {
      return { data: mocks.teams, isLoading: mocks.isLoading };
    }
    return { data: undefined, isLoading: false };
  },
}));

vi.mock("@multica/core/teams", () => ({
  teamListOptions: () => ({ queryKey: ["teams", "ws-1", "list"] }),
  teamMembersOptions: () => ({ queryKey: ["teams", "ws-1", "members"] }),
}));

vi.mock("@multica/core/hooks", () => ({
  useWorkspaceId: () => "ws-1",
}));

vi.mock("@multica/core/paths", () => ({
  useWorkspacePaths: () => ({
    teamDetail: (id: string) => `/test-workspace/teams/${id}`,
    memberDetail: (id: string) => `/test-workspace/members/${id}`,
  }),
}));

vi.mock("../../common/actor-avatar", () => ({
  ActorAvatar: ({ actorId }: { actorId: string }) => (
    <span data-testid={`avatar-${actorId}`} />
  ),
}));

const TEAM_FIXTURE: Team = {
  id: "team-1",
  workspace_id: "ws-1",
  name: "Backend Core",
  key: "BE",
  description: "Core backend services and API infrastructure",
  icon: null,
  color: "#10b981",
  issue_counter: 50,
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
    pathname: "/test-workspace/teams",
    searchParams: new URLSearchParams(),
    getShareableUrl: (p) => p,
    ...overrides,
  };
}

beforeEach(() => {
  mocks.teams = [TEAM_FIXTURE];
  mocks.members = [MEMBER_FIXTURE];
  mocks.isLoading = false;
});

describe("TeamProfileCard", () => {
  it("renders team name, key, description, and members preview", () => {
    renderWithI18n(
      <NavigationProvider value={makeAdapter()}>
        <TeamProfileCard teamId="team-1" />
      </NavigationProvider>,
    );

    expect(screen.getByText("Backend Core")).toBeInTheDocument();
    expect(screen.getByText("BE")).toBeInTheDocument();
    expect(screen.getByText("Core backend services and API infrastructure")).toBeInTheDocument();
    expect(screen.getByText("Alice Developer")).toBeInTheDocument();
    expect(screen.getByText("Lead")).toBeInTheDocument();
  });

  it("renders unavailable state when team is not found", () => {
    mocks.teams = [];
    renderWithI18n(
      <NavigationProvider value={makeAdapter()}>
        <TeamProfileCard teamId="unknown-team" />
      </NavigationProvider>,
    );

    expect(screen.getByText("Team unavailable")).toBeInTheDocument();
  });
});
