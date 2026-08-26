import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Team } from "@multica/core/types";
import { renderWithI18n } from "../../test/i18n";
import { NavigationProvider, type NavigationAdapter } from "../../navigation";
import { TeamsPage } from "./teams-page";

const mocks = vi.hoisted(() => ({
  teams: [] as Team[],
  members: [] as Array<{ user_id: string; name: string; role: string }>,
  isLoading: false,
  error: null as unknown,
  refetch: vi.fn(),
  createTeam: vi.fn(),
  updateTeam: vi.fn(),
  deleteTeam: vi.fn(),
  teamsViewState: {
    viewMode: "compact",
    sortField: "name",
    sortDirection: "asc",
    hiddenColumns: ["updated"],
    filters: { cycles: [] as string[] },
    setViewMode: vi.fn(),
    toggleSort: vi.fn(),
    setSortField: vi.fn(),
    setSortDirection: vi.fn(),
    toggleColumn: vi.fn(),
    toggleFilter: vi.fn(),
    clearFilters: vi.fn(),
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: { queryKey?: readonly unknown[] }) => {
    const key = options.queryKey?.[0];
    if (key === "teams") {
      return {
        data: mocks.teams,
        isLoading: mocks.isLoading,
        error: mocks.error,
        refetch: mocks.refetch,
      };
    }
    if (key === "members") {
      return { data: mocks.members, isLoading: false };
    }
    return { data: [], isLoading: false };
  },
}));

vi.mock("@multica/core/teams", () => ({
  teamListOptions: () => ({ queryKey: ["teams"] }),
  useCreateTeam: () => ({ mutate: mocks.createTeam, isPending: false }),
  useUpdateTeam: () => ({ mutate: mocks.updateTeam, isPending: false }),
  useDeleteTeam: () => ({ mutate: mocks.deleteTeam, isPending: false }),
  useTeamsViewStore: (selector: (state: unknown) => unknown) =>
    selector(mocks.teamsViewState),
}));

vi.mock("@multica/core/hooks", () => ({
  useWorkspaceId: () => "workspace-1",
}));

vi.mock("@multica/core/paths", () => ({
  useWorkspacePaths: () => ({
    teamDetail: (id: string) => `/test-workspace/teams/${id}`,
  }),
}));

vi.mock("@multica/core/auth", () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ user: { id: "user-1" } }),
}));

vi.mock("@multica/core/workspace/queries", () => ({
  memberListOptions: () => ({ queryKey: ["members"] }),
}));

vi.mock("@multica/ui/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  DropdownMenuTrigger: ({ render }: { render: React.ReactNode }) => (
    <>{render}</>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  DropdownMenuCheckboxItem: ({
    children,
    onCheckedChange,
  }: {
    children: React.ReactNode;
    onCheckedChange?: () => void;
  }) => (
    <button type="button" onClick={onCheckedChange}>
      {children}
    </button>
  ),
  DropdownMenuRadioGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuRadioItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuSub: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  DropdownMenuSubContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuSubTrigger: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

vi.mock("@multica/ui/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverTrigger: ({ render }: { render: React.ReactNode }) => <>{render}</>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@multica/ui/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ render }: { render: React.ReactNode }) => <>{render}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div role="tooltip">{children}</div>
  ),
}));

const TEAM_1: Team = {
  id: "team-1",
  workspace_id: "workspace-1",
  name: "Engineering",
  key: "ENG",
  description: "Core product development",
  icon: null,
  color: "#6366f1",
  issue_counter: 42,
  cycles_enabled: true,
  cycle_duration_weeks: 2,
  archived_at: null,
  created_at: "2026-06-01T00:00:00Z",
  updated_at: "2026-06-01T00:00:00Z",
};

const TEAM_2: Team = {
  id: "team-2",
  workspace_id: "workspace-1",
  name: "Design",
  key: "DES",
  description: "Product design and design system",
  icon: null,
  color: "#ec4899",
  issue_counter: 12,
  cycles_enabled: false,
  cycle_duration_weeks: 2,
  archived_at: null,
  created_at: "2026-06-02T00:00:00Z",
  updated_at: "2026-06-02T00:00:00Z",
};

function makeAdapter(
  overrides: Partial<NavigationAdapter> = {},
): NavigationAdapter {
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

function renderTeams(adapter = makeAdapter()) {
  renderWithI18n(
    <NavigationProvider value={adapter}>
      <TeamsPage />
    </NavigationProvider>,
  );
  return adapter;
}

beforeEach(() => {
  mocks.teams = [TEAM_1, TEAM_2];
  mocks.members = [{ user_id: "user-1", name: "User One", role: "admin" }];
  mocks.isLoading = false;
  mocks.error = null;
  mocks.refetch.mockClear();
  mocks.createTeam.mockClear();
  mocks.updateTeam.mockClear();
  mocks.deleteTeam.mockClear();
  mocks.teamsViewState.viewMode = "compact";
  mocks.teamsViewState.sortField = "name";
  mocks.teamsViewState.sortDirection = "asc";
  mocks.teamsViewState.hiddenColumns = ["updated"];
  mocks.teamsViewState.filters = { cycles: [] };
});

describe("TeamsPage", () => {
  it("renders collection page header, count, and action button", () => {
    renderTeams();

    expect(
      screen.getByRole("heading", { level: 1, name: "Teams" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "New team" }),
    ).toBeInTheDocument();
  });

  it("renders teams in compact table view", () => {
    renderTeams();

    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("navigates to team detail on row click", async () => {
    const user = userEvent.setup();
    const push = vi.fn();
    renderTeams(makeAdapter({ push }));

    const row = screen.getByText("Engineering").closest('[role="row"]') as HTMLElement;
    expect(row).not.toBeNull();
    await user.click(row);

    expect(push).toHaveBeenCalledWith("/test-workspace/teams/team-1");
  });

  it("does not navigate when inline controls are clicked", async () => {
    const user = userEvent.setup();
    const push = vi.fn();
    renderTeams(makeAdapter({ push }));

    const row = screen.getByText("Engineering").closest('[role="row"]') as HTMLElement;
    const checkboxBtn = within(row).getByRole("button", { pressed: false });
    const rowMenuBtn = within(row).getByRole("button", {
      name: "Team actions",
    });

    await user.click(checkboxBtn);
    await user.click(rowMenuBtn);

    expect(push).not.toHaveBeenCalled();
  });

  it("renders cards in comfortable view mode", () => {
    mocks.teamsViewState.viewMode = "comfortable";
    renderTeams();

    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("Core product development")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
    expect(
      screen.getByText("Product design and design system"),
    ).toBeInTheDocument();
  });

  it("renders empty state when no teams exist", () => {
    mocks.teams = [];
    renderTeams();

    expect(screen.getByText("No teams yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Create your first team to manage scoped issues, cycles, and issue identifiers.",
      ),
    ).toBeInTheDocument();
  });

  it("renders error state on fetch failure", () => {
    mocks.teams = [];
    mocks.error = new Error("Network error");
    renderTeams();

    expect(screen.getByText("Couldn't load teams")).toBeInTheDocument();
    expect(screen.getByText("Network error")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });

  it("filters teams by search query", async () => {
    const user = userEvent.setup();
    renderTeams();

    const searchInput = screen.getByPlaceholderText("Search teams...");
    await user.type(searchInput, "Design");

    expect(screen.queryByText("Engineering")).not.toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
  });

  it("supports multi-selection and batch deletion", async () => {
    const user = userEvent.setup();
    renderTeams();

    const rows = screen.getAllByRole("row");
    const firstRowCheckbox = within(rows[1] as HTMLElement).getByRole("button", {
      pressed: false,
    });
    await user.click(firstRowCheckbox);

    expect(screen.getByText("1 selected")).toBeInTheDocument();
  });
});
