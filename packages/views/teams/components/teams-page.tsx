"use client";

import { useMemo, useState, type MouseEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Filter,
  LayoutGrid,
  Plus,
  Repeat,
  Rows3,
  Search,
  Users,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  teamListOptions,
  useTeamsViewStore,
  TEAM_DEFAULT_HIDDEN_COLUMNS,
  type TeamColumnKey,
  type TeamListFilters,
  type TeamSortField,
  type TeamViewMode,
} from "@multica/core/teams";
import { useWorkspaceId } from "@multica/core/hooks";
import { useWorkspacePaths } from "@multica/core/paths";
import { useAuthStore } from "@multica/core/auth";
import { memberListOptions } from "@multica/core/workspace/queries";
import type { MemberWithUser, Team } from "@multica/core/types";
import { Button } from "@multica/ui/components/ui/button";
import { Checkbox } from "@multica/ui/components/ui/checkbox";
import { Input } from "@multica/ui/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@multica/ui/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@multica/ui/components/ui/popover";
import { Switch } from "@multica/ui/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@multica/ui/components/ui/tooltip";
import {
  ListGrid,
  ListGridCell,
  ListGridHeader,
  ListGridHeaderCell,
  ListGridRow,
  LIST_GRID_BOTTOM_CLEARANCE,
  type ListGridSortDirection,
} from "@multica/ui/components/ui/list-grid";
import { Skeleton } from "@multica/ui/components/ui/skeleton";
import { cn } from "@multica/ui/lib/utils";
import { AppLink, useRowLink } from "../../navigation";
import {
  CollectionPageHeader,
  CollectionPageHeaderAction,
  CollectionPageState,
} from "../../layout/collection-page";
import { PAGE_GUTTER, PAGE_TOOLBAR } from "../../layout/page-header";
import { FILTER_ITEM_CLASS, HoverCheck } from "../../common/hover-check";
import { matchesPinyin } from "../../editor/extensions/pinyin-match";
import { useT, useTimeAgo } from "../../i18n";
import { CreateTeamDialog } from "./create-team-dialog";
import { TeamRowActions } from "./team-row-actions";
import { TeamBatchToolbar } from "./team-batch-toolbar";

const COLUMN_WIDTHS: Record<TeamColumnKey, number> = {
  lead: 160,
  members: 120,
  key: 96,
  cycles: 128,
  issues: 88,
  created: 104,
  updated: 104,
};

// Fixed tracks: edges 12+12, checkbox 16, name min 220, kebab 28 = 288,
// plus the gaps between wide template tracks.
const FIXED_TRACKS_WIDTH = 288 + 7 * 12;

const GRID_COLS =
  "grid-cols-[0.75rem_1rem_minmax(120px,1fr)_var(--tmc-issues-mobile)_1.75rem_0.75rem] " +
  "@2xl:grid-cols-[0.75rem_1rem_minmax(220px,1fr)_var(--tmc-key)_var(--tmc-cycles)_var(--tmc-issues)_var(--tmc-created)_var(--tmc-updated)_1.75rem_0.75rem]";

const stopRowNavigation = (e: MouseEvent) => e.stopPropagation();

function columnTrackVars(
  isVisible: (key: TeamColumnKey) => boolean,
): React.CSSProperties {
  const width = (key: TeamColumnKey) =>
    isVisible(key) ? `${COLUMN_WIDTHS[key]}px` : "0px";
  const minWidth =
    FIXED_TRACKS_WIDTH +
    (Object.keys(COLUMN_WIDTHS) as TeamColumnKey[]).reduce(
      (sum, key) => sum + (isVisible(key) ? COLUMN_WIDTHS[key] : 0),
      0,
    );
  return {
    "--tmc-issues-mobile": isVisible("issues") ? "64px" : "0px",
    "--tmc-key": width("key"),
    "--tmc-cycles": width("cycles"),
    "--tmc-issues": width("issues"),
    "--tmc-created": width("created"),
    "--tmc-updated": width("updated"),
    "--tmc-minw": `${minWidth}px`,
  } as React.CSSProperties;
}

const SORT_FIELDS: TeamSortField[] = [
  "name",
  "key",
  "issues",
  "created",
  "updated",
];
const COLUMN_KEYS: TeamColumnKey[] = [
  "key",
  "cycles",
  "issues",
  "created",
  "updated",
];

function countActiveFilters(f: TeamListFilters): number {
  let c = 0;
  if (f.cycles.length) c++;
  return c;
}

function TeamAvatar({
  team,
  size = "lg",
}: {
  team: Team;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}) {
  const initials = team.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const px =
    size === "2xl" ? 64 : size === "xl" ? 40 : size === "lg" ? 32 : size === "md" ? 24 : 16;

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-2xs"
      style={{
        width: px,
        height: px,
        backgroundColor: team.color || "#6366f1",
        fontSize: px * 0.42,
      }}
    >
      <span>{initials}</span>
    </div>
  );
}

function CheckboxCell({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <ListGridCell className="justify-center px-0">
      <button
        type="button"
        aria-pressed={checked}
        onClick={(e) => {
          stopRowNavigation(e);
          onToggle();
        }}
        onAuxClick={stopRowNavigation}
        className={`-m-1.5 flex items-center p-1.5 ${
          checked
            ? ""
            : "opacity-0 transition-opacity group-hover/row:opacity-100"
        }`}
      >
        <Checkbox
          checked={checked}
          tabIndex={-1}
          className="pointer-events-none"
        />
      </button>
    </ListGridCell>
  );
}

// Two-line identity cell matching squads/agents list style
function NameCell({ team }: { team: Team }) {
  return (
    <ListGridCell className="gap-3">
      <TeamAvatar team={team} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="block min-w-0 truncate text-body font-medium">
            {team.name}
          </span>
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-micro text-muted-foreground @2xl:hidden">
            {team.key}
          </span>
        </div>
        {team.description ? (
          <span className="block min-w-0 truncate text-caption text-muted-foreground">
            {team.description}
          </span>
        ) : null}
      </div>
    </ListGridCell>
  );
}

function TeamTableRow({
  team,
  workspaceId,
  canDelete,
  isColVisible,
  selected,
  onToggleSelect,
  rowHref,
  rowLink,
}: {
  team: Team;
  workspaceId: string;
  canDelete: boolean;
  isColVisible: (key: TeamColumnKey) => boolean;
  selected: boolean;
  onToggleSelect: () => void;
  rowHref: string;
  rowLink: ReturnType<typeof useRowLink>;
}) {
  const { t } = useT("teams");
  const timeAgo = useTimeAgo();

  return (
    <ListGridRow
      className={`cursor-pointer ${selected ? "bg-accent/30" : ""}`}
      {...rowLink(rowHref, team.name)}
    >
      <CheckboxCell checked={selected} onToggle={onToggleSelect} />
      <NameCell team={team} />

      {/* Key */}
      {isColVisible("key") ? (
        <ListGridCell className="hidden @2xl:flex">
          <span className="font-mono text-caption text-muted-foreground">
            {team.key}
          </span>
        </ListGridCell>
      ) : (
        <ListGridCell className="hidden px-0 @2xl:flex" />
      )}

      {/* Cycles */}
      {isColVisible("cycles") ? (
        <ListGridCell className="hidden @2xl:flex">
          {team.cycles_enabled ? (
            <span className="inline-flex items-center gap-1.5 text-caption text-foreground">
              <Repeat className="size-3 text-primary" />
              <span>
                {t(($) => $.cycles.enabled, {
                  weeks: team.cycle_duration_weeks || 2,
                })}
              </span>
            </span>
          ) : (
            <span className="text-caption text-muted-foreground">
              {t(($) => $.cycles.disabled)}
            </span>
          )}
        </ListGridCell>
      ) : (
        <ListGridCell className="hidden px-0 @2xl:flex" />
      )}

      {/* Issues */}
      {isColVisible("issues") ? (
        <ListGridCell className="justify-end font-mono text-caption tabular-nums text-muted-foreground">
          {team.issue_counter}
        </ListGridCell>
      ) : (
        <ListGridCell className="hidden px-0 @2xl:flex" />
      )}

      {/* Created */}
      {isColVisible("created") ? (
        <ListGridCell className="hidden whitespace-nowrap text-caption tabular-nums text-muted-foreground @2xl:flex">
          {timeAgo(team.created_at)}
        </ListGridCell>
      ) : (
        <ListGridCell className="hidden px-0 @2xl:flex" />
      )}

      {/* Updated */}
      {isColVisible("updated") ? (
        <ListGridCell className="hidden whitespace-nowrap text-caption tabular-nums text-muted-foreground @2xl:flex">
          {timeAgo(team.updated_at)}
        </ListGridCell>
      ) : (
        <ListGridCell className="hidden px-0 @2xl:flex" />
      )}

      {/* Kebab Action */}
      <ListGridCell className="justify-end px-0">
        <span
          onClick={stopRowNavigation}
          onAuxClick={stopRowNavigation}
          className="flex items-center"
        >
          <TeamRowActions
            team={team}
            workspaceId={workspaceId}
            canDelete={canDelete}
          />
        </span>
      </ListGridCell>
    </ListGridRow>
  );
}

function TeamTableHeader({
  sortField,
  sortDirection,
  onSort,
  isColVisible,
  allSelected,
  someSelected,
  onToggleAll,
}: {
  sortField: TeamSortField;
  sortDirection: ListGridSortDirection;
  onSort: (field: TeamSortField) => void;
  isColVisible: (key: TeamColumnKey) => boolean;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
}) {
  const { t } = useT("teams");
  const sorted = (field: TeamSortField) =>
    sortField === field ? sortDirection : false;
  const anySelected = allSelected || someSelected;

  return (
    <ListGridHeader>
      <div className="flex items-center justify-center">
        <button
          type="button"
          aria-pressed={allSelected}
          onClick={onToggleAll}
          className={`-m-1.5 flex items-center p-1.5 ${
            anySelected
              ? ""
              : "opacity-0 transition-opacity group-hover/header:opacity-100"
          }`}
        >
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            tabIndex={-1}
            className="pointer-events-none"
          />
        </button>
      </div>
      <ListGridHeaderCell sorted={sorted("name")} onSort={() => onSort("name")}>
        {t(($) => $.table.name)}
      </ListGridHeaderCell>
      {isColVisible("key") ? (
        <ListGridHeaderCell
          className="hidden @2xl:flex"
          sorted={sorted("key")}
          onSort={() => onSort("key")}
        >
          {t(($) => $.table.key)}
        </ListGridHeaderCell>
      ) : (
        <ListGridHeaderCell className="hidden px-0 @2xl:flex" />
      )}
      {isColVisible("cycles") ? (
        <ListGridHeaderCell className="hidden @2xl:flex">
          {t(($) => $.table.cycles)}
        </ListGridHeaderCell>
      ) : (
        <ListGridHeaderCell className="hidden px-0 @2xl:flex" />
      )}
      {isColVisible("issues") ? (
        <ListGridHeaderCell
          className="justify-end"
          align="right"
          sorted={sorted("issues")}
          onSort={() => onSort("issues")}
        >
          {t(($) => $.table.issues)}
        </ListGridHeaderCell>
      ) : (
        <ListGridHeaderCell className="hidden px-0 @2xl:flex" />
      )}
      {isColVisible("created") ? (
        <ListGridHeaderCell
          className="hidden @2xl:flex"
          sorted={sorted("created")}
          onSort={() => onSort("created")}
        >
          {t(($) => $.table.created)}
        </ListGridHeaderCell>
      ) : (
        <ListGridHeaderCell className="hidden px-0 @2xl:flex" />
      )}
      {isColVisible("updated") ? (
        <ListGridHeaderCell
          className="hidden @2xl:flex"
          sorted={sorted("updated")}
          onSort={() => onSort("updated")}
        >
          {t(($) => $.table.updated)}
        </ListGridHeaderCell>
      ) : (
        <ListGridHeaderCell className="hidden px-0 @2xl:flex" />
      )}
      <span aria-hidden="true" />
    </ListGridHeader>
  );
}

function TeamCard({
  team,
  workspaceId,
  canDelete,
}: {
  team: Team;
  workspaceId: string;
  canDelete: boolean;
}) {
  const { t } = useT("teams");
  const wsPaths = useWorkspacePaths();
  const timeAgo = useTimeAgo();

  return (
    <div className="group/card group/row flex flex-col justify-between rounded-lg border bg-card p-4 transition-all hover:border-border/80 hover:shadow-xs">
      <div>
        <div className="flex items-center justify-between gap-2">
          <AppLink
            href={wsPaths.teamDetail(team.id)}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <TeamAvatar team={team} size="lg" />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-body font-medium text-foreground transition-colors group-hover/card:text-primary">
                {team.name}
              </h3>
              <span className="font-mono text-micro text-muted-foreground">
                {team.key}
              </span>
            </div>
          </AppLink>
          <div className="flex shrink-0 items-center gap-1.5">
            <TeamRowActions
              team={team}
              workspaceId={workspaceId}
              canDelete={canDelete}
            />
          </div>
        </div>

        {team.description ? (
          <p className="mt-2 line-clamp-2 text-caption text-muted-foreground">
            {team.description}
          </p>
        ) : (
          <p className="mt-2 text-caption italic text-faint-foreground">—</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-3 text-caption text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="tabular-nums">
            {team.issue_counter} {t(($) => $.table.issues).toLowerCase()}
          </span>
          {team.cycles_enabled && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-primary">
                <Repeat className="size-3" />
                <span>
                  {t(($) => $.cycles.enabled, {
                    weeks: team.cycle_duration_weeks || 2,
                  })}
                </span>
              </span>
            </>
          )}
        </div>
        <span className="text-micro text-muted-foreground">
          {timeAgo(team.created_at)}
        </span>
      </div>
    </div>
  );
}

function LoadingState({ isCompact }: { isCompact: boolean }) {
  if (isCompact) {
    return (
      <div className="min-h-0 flex-1 overflow-auto @container">
        <ListGrid
          className={GRID_COLS}
          style={{
            ...columnTrackVars((key) => !TEAM_DEFAULT_HIDDEN_COLUMNS.includes(key)),
            paddingBottom: LIST_GRID_BOTTOM_CLEARANCE,
          }}
        >
          <ListGridHeader>
            <div className="flex items-center justify-center">
              <Skeleton className="size-4 rounded" />
            </div>
            <ListGridHeaderCell>
              <Skeleton className="h-3 w-12" />
            </ListGridHeaderCell>
            <ListGridHeaderCell className="hidden @2xl:flex">
              <Skeleton className="h-3 w-12" />
            </ListGridHeaderCell>
            <ListGridHeaderCell className="hidden @2xl:flex">
              <Skeleton className="h-3 w-12" />
            </ListGridHeaderCell>
            <ListGridHeaderCell className="hidden px-0 @2xl:flex" />
            <ListGridHeaderCell className="hidden px-0 @2xl:flex" />
            <span aria-hidden="true" />
          </ListGridHeader>
          {Array.from({ length: 5 }).map((_, i) => (
            <ListGridRow key={i} className="h-16 hover:bg-transparent">
              <ListGridCell className="justify-center px-0">
                <Skeleton className="size-4 rounded" />
              </ListGridCell>
              <ListGridCell className="gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32 max-w-full" />
                  <Skeleton className="h-3 w-48 max-w-full" />
                </div>
              </ListGridCell>
              <ListGridCell className="hidden @2xl:flex">
                <Skeleton className="h-3.5 w-12" />
              </ListGridCell>
              <ListGridCell className="hidden @2xl:flex">
                <Skeleton className="h-3.5 w-16" />
              </ListGridCell>
              <ListGridCell className="hidden px-0 @2xl:flex" />
              <ListGridCell className="hidden px-0 @2xl:flex" />
              <span aria-hidden="true" />
            </ListGridRow>
          ))}
        </ListGrid>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3",
        PAGE_GUTTER,
      )}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="size-3 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-3 w-3/4" />
          <div className="flex items-center justify-between border-t pt-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TeamsPage({
  workspaceId: propWsId,
}: {
  workspaceId?: string;
  workspaceSlug?: string;
} = {}) {
  const { t } = useT("teams");
  const contextWsId = useWorkspaceId();
  const wsPaths = useWorkspacePaths();
  const rowLink = useRowLink();
  const workspaceId = propWsId || contextWsId;
  const currentUser = useAuthStore((s) => s.user);

  const viewMode = useTeamsViewStore((s) => s.viewMode);
  const setViewMode = useTeamsViewStore((s) => s.setViewMode);
  const sortField = useTeamsViewStore((s) => s.sortField);
  const sortDirection = useTeamsViewStore((s) => s.sortDirection);
  const hiddenColumns = useTeamsViewStore((s) => s.hiddenColumns);
  const filters = useTeamsViewStore((s) => s.filters);
  const toggleSort = useTeamsViewStore((s) => s.toggleSort);
  const setSortField = useTeamsViewStore((s) => s.setSortField);
  const setSortDirection = useTeamsViewStore((s) => s.setSortDirection);
  const toggleColumn = useTeamsViewStore((s) => s.toggleColumn);
  const toggleFilter = useTeamsViewStore((s) => s.toggleFilter);
  const clearFilters = useTeamsViewStore((s) => s.clearFilters);

  const isCompact = viewMode === "compact";
  const isColVisible = (key: TeamColumnKey) => !hiddenColumns.includes(key);

  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    new Set(),
  );

  const {
    data: teams = [],
    isLoading,
    error: listError,
    refetch: refetchList,
  } = useQuery(teamListOptions(workspaceId));

  const { data: members = [] } = useQuery(memberListOptions(workspaceId));

  const isWorkspaceAdmin = useMemo(() => {
    if (!currentUser) return false;
    const me = members.find(
      (m: MemberWithUser) => m.user_id === currentUser.id,
    );
    return me?.role === "owner" || me?.role === "admin";
  }, [members, currentUser]);

  const toggleSelected = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const activeFilterCount = countActiveFilters(filters);
  const hasActiveFilters = activeFilterCount > 0;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = teams.filter((team) => {
      if (
        q &&
        !team.name.toLowerCase().includes(q) &&
        !team.key.toLowerCase().includes(q) &&
        !(team.description && team.description.toLowerCase().includes(q)) &&
        !matchesPinyin(team.name, q)
      ) {
        return false;
      }
      if (filters.cycles.length > 0) {
        const cycleState = team.cycles_enabled ? "enabled" : "disabled";
        if (!filters.cycles.includes(cycleState)) return false;
      }
      return true;
    });

    const dir = sortDirection === "asc" ? 1 : -1;
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortField === "name") {
        return a.name.localeCompare(b.name) * dir;
      }
      if (sortField === "key") {
        return a.key.localeCompare(b.key) * dir;
      }
      if (sortField === "issues") {
        return (a.issue_counter - b.issue_counter) * dir;
      }
      if (sortField === "updated") {
        return (Date.parse(a.updated_at) - Date.parse(b.updated_at)) * dir;
      }
      return (Date.parse(a.created_at) - Date.parse(b.created_at)) * dir;
    });

    return sorted;
  }, [teams, search, filters, sortField, sortDirection]);

  const selectedTeams = visible.filter((team) => selectedIds.has(team.id));
  const allSelected =
    visible.length > 0 && selectedTeams.length === visible.length;
  const someSelected = selectedTeams.length > 0 && !allSelected;
  const handleToggleAll = () =>
    setSelectedIds(
      allSelected ? new Set() : new Set(visible.map((t) => t.id)),
    );

  const sortLabel = (f: TeamSortField) =>
    f === "name"
      ? t(($) => $.table.name)
      : f === "key"
        ? t(($) => $.table.key)
        : f === "issues"
          ? t(($) => $.table.issues)
          : f === "updated"
            ? t(($) => $.table.updated)
            : t(($) => $.table.created);

  const columnLabel = (k: TeamColumnKey) =>
    k === "key"
      ? t(($) => $.table.key)
      : k === "cycles"
        ? t(($) => $.table.cycles)
        : k === "issues"
          ? t(($) => $.table.issues)
          : k === "updated"
            ? t(($) => $.table.updated)
            : t(($) => $.table.created);

  const showEmpty = !isLoading && !listError && teams.length === 0;

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-background">
      <CollectionPageHeader
        icon={Users}
        title={t(($) => $.page.title)}
        count={teams.length}
        actions={
          <CollectionPageHeaderAction
            icon={Plus}
            label={t(($) => $.page.new_team)}
            onClick={() => setCreateOpen(true)}
          />
        }
      />

      {listError ? (
        <CollectionPageState
          role="alert"
          tone="destructive"
          icon={Users}
          title={t(($) => $.page.list_error.title)}
          description={
            listError instanceof Error
              ? listError.message
              : t(($) => $.page.list_error.fallback)
          }
          actions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetchList()}
            >
              {t(($) => $.page.list_error.retry)}
            </Button>
          }
        />
      ) : showEmpty ? (
        <CollectionPageState
          icon={Users}
          title={t(($) => $.page.empty)}
          description={t(($) => $.page.empty_description)}
          actions={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 size-3.5" />
              {t(($) => $.page.create_first)}
            </Button>
          }
        />
      ) : (
        <>
          {/* Toolbar */}
          <div className={PAGE_TOOLBAR}>
            <div className="flex min-w-0 items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label={t(($) => $.page.search_placeholder)}
                  placeholder={t(($) => $.page.search_placeholder)}
                  className="h-8 w-56 pl-8 text-body"
                />
              </div>
              {(hasActiveFilters || search.trim().length > 0) && (
                <span
                  title={t(($) => $.toolbar.result_count_title)}
                  className="hidden shrink-0 text-caption tabular-nums text-muted-foreground md:inline"
                >
                  {visible.length} / {teams.length}
                </span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {/* Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant={hasActiveFilters ? "default" : "outline"}
                      size="sm"
                      className={
                        hasActiveFilters
                          ? "h-8 w-8 gap-1 bg-brand px-0 text-white hover:bg-brand/90 md:w-auto md:px-2.5"
                          : "h-8 w-8 gap-1 px-0 text-muted-foreground md:w-auto md:px-2.5"
                      }
                    >
                      <Filter className="size-3.5" />
                      {hasActiveFilters ? (
                        <>
                          <span className="hidden md:inline">
                            {t(($) => $.toolbar.filter_active_count, {
                              count: activeFilterCount,
                            })}
                          </span>
                          <span className="tabular-nums md:hidden">
                            {activeFilterCount}
                          </span>
                        </>
                      ) : (
                        <span className="hidden md:inline">
                          {t(($) => $.toolbar.filter_label)}
                        </span>
                      )}
                      {hasActiveFilters && (
                        <span
                          role="button"
                          tabIndex={-1}
                          aria-label={t(($) => $.toolbar.clear_filters)}
                          className="-mr-1 ml-0.5 hidden rounded-sm p-0.5 hover:bg-white/20 md:inline-flex"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            clearFilters();
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <X className="size-3" />
                        </span>
                      )}
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-auto">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <span className="flex-1">
                        {t(($) => $.toolbar.section_cycles)}
                      </span>
                      {filters.cycles.length > 0 && (
                        <span className="text-caption font-medium text-primary">
                          {filters.cycles.length}
                        </span>
                      )}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-auto min-w-44">
                      <DropdownMenuCheckboxItem
                        checked={filters.cycles.includes("enabled")}
                        onCheckedChange={() =>
                          toggleFilter("cycles", "enabled")
                        }
                        className={FILTER_ITEM_CLASS}
                      >
                        <HoverCheck
                          checked={filters.cycles.includes("enabled")}
                        />
                        {t(($) => $.toolbar.cycles_enabled)}
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={filters.cycles.includes("disabled")}
                        onCheckedChange={() =>
                          toggleFilter("cycles", "disabled")
                        }
                        className={FILTER_ITEM_CLASS}
                      >
                        <HoverCheck
                          checked={filters.cycles.includes("disabled")}
                        />
                        {t(($) => $.toolbar.cycles_disabled)}
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Display (sort + columns) */}
              <Popover>
                <Tooltip>
                  <PopoverTrigger
                    render={
                      <TooltipTrigger
                        render={
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 gap-1 px-0 text-muted-foreground md:w-auto md:px-2.5"
                          >
                            {sortDirection === "asc" ? (
                              <ArrowUp className="size-3.5" />
                            ) : (
                              <ArrowDown className="size-3.5" />
                            )}
                            <span className="hidden md:inline">
                              {sortLabel(sortField)}
                            </span>
                          </Button>
                        }
                      />
                    }
                  />
                  <TooltipContent side="bottom">
                    {t(($) => $.toolbar.display)}
                  </TooltipContent>
                </Tooltip>
                <PopoverContent align="end" className="w-64 p-0">
                  <div className="border-b px-3 py-2.5">
                    <span className="text-caption font-medium text-muted-foreground">
                      {t(($) => $.toolbar.sort_by)}
                    </span>
                    <div className="mt-2 flex items-center gap-1.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 justify-between text-caption"
                            >
                              {sortLabel(sortField)}
                              <ChevronDown className="size-3 text-muted-foreground" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="start" className="w-auto">
                          <DropdownMenuRadioGroup
                            value={sortField}
                            onValueChange={(v) =>
                              setSortField(v as TeamSortField)
                            }
                          >
                            {SORT_FIELDS.map((f) => (
                              <DropdownMenuRadioItem key={f} value={f}>
                                {sortLabel(f)}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() =>
                          setSortDirection(
                            sortDirection === "asc" ? "desc" : "asc",
                          )
                        }
                        title={
                          sortDirection === "asc"
                            ? t(($) => $.toolbar.direction_asc)
                            : t(($) => $.toolbar.direction_desc)
                        }
                      >
                        {sortDirection === "asc" ? (
                          <ArrowUp className="size-3.5" />
                        ) : (
                          <ArrowDown className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {isCompact && (
                    <div className="px-3 py-2.5">
                      <span className="text-caption font-medium text-muted-foreground">
                        {t(($) => $.toolbar.section_columns)}
                      </span>
                      <div className="mt-2 space-y-2">
                        {COLUMN_KEYS.map((key) => (
                          <label
                            key={key}
                            className="flex cursor-pointer items-center justify-between"
                          >
                            <span className="text-body">
                              {columnLabel(key)}
                            </span>
                            <Switch
                              size="sm"
                              checked={!hiddenColumns.includes(key)}
                              onCheckedChange={() => toggleColumn(key)}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* View selector (Table vs Cards) */}
              <DropdownMenu>
                <Tooltip>
                  <DropdownMenuTrigger
                    render={
                      <TooltipTrigger
                        render={
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 gap-1 px-0 text-muted-foreground md:w-auto md:px-2.5"
                          >
                            {isCompact ? (
                              <Rows3 className="size-3.5" />
                            ) : (
                              <LayoutGrid className="size-3.5" />
                            )}
                            <span className="hidden md:inline">
                              {isCompact
                                ? t(($) => $.page.view_table)
                                : t(($) => $.page.view_cards)}
                            </span>
                          </Button>
                        }
                      />
                    }
                  />
                  <TooltipContent side="bottom">
                    {t(($) => $.toolbar.view)}
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-auto">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      {t(($) => $.toolbar.view)}
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuRadioGroup
                    value={viewMode}
                    onValueChange={(v) => setViewMode(v as TeamViewMode)}
                  >
                    <DropdownMenuRadioItem value="compact">
                      <Rows3 className="size-3.5" />
                      {t(($) => $.page.view_table)}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="comfortable">
                      <LayoutGrid className="size-3.5" />
                      {t(($) => $.page.view_cards)}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Body */}
          {isLoading ? (
            <LoadingState isCompact={isCompact} />
          ) : visible.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-24 text-muted-foreground">
              <Search className="mb-3 size-10 opacity-30" />
              <p className="text-body">{t(($) => $.page.no_matches)}</p>
            </div>
          ) : isCompact ? (
            <div className="min-h-0 flex-1 overflow-auto @container">
              <ListGrid
                className={`${GRID_COLS} @2xl:min-w-[var(--tmc-minw)]`}
                style={{
                  ...columnTrackVars(isColVisible),
                  paddingBottom: LIST_GRID_BOTTOM_CLEARANCE,
                }}
              >
                <TeamTableHeader
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={toggleSort}
                  isColVisible={isColVisible}
                  allSelected={allSelected}
                  someSelected={someSelected}
                  onToggleAll={handleToggleAll}
                />
                {visible.map((team) => (
                  <TeamTableRow
                    key={team.id}
                    team={team}
                    workspaceId={workspaceId}
                    canDelete={isWorkspaceAdmin}
                    isColVisible={isColVisible}
                    selected={selectedIds.has(team.id)}
                    onToggleSelect={() => toggleSelected(team.id)}
                    rowHref={wsPaths.teamDetail(team.id)}
                    rowLink={rowLink}
                  />
                ))}
              </ListGrid>
            </div>
          ) : (
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto pt-4",
                PAGE_GUTTER,
              )}
            >
              <div
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                style={{ paddingBottom: LIST_GRID_BOTTOM_CLEARANCE }}
              >
                {visible.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    workspaceId={workspaceId}
                    canDelete={isWorkspaceAdmin}
                  />
                ))}
              </div>
            </div>
          )}

          <TeamBatchToolbar
            rows={selectedTeams}
            workspaceId={workspaceId}
            canDelete={isWorkspaceAdmin}
            onClear={() => setSelectedIds(new Set())}
          />
        </>
      )}

      <CreateTeamDialog
        workspaceId={workspaceId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
