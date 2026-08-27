"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  teamDetailOptions,
  teamMembersOptions,
  useAddTeamMember,
  useRemoveTeamMember,
  useUpdateTeam,
  useDeleteTeam,
  useUpdateTeamMemberRole,
} from "@multica/core/teams";
import { cycleListOptions, currentCycleOptions } from "@multica/core/cycles";
import { useAuthStore } from "@multica/core/auth";
import { useCurrentWorkspace, useWorkspacePaths } from "@multica/core/paths";
import { useWorkspaceId } from "@multica/core/hooks";
import { isImeComposing } from "@multica/core/utils";
import { getShortcut, shortcutMatchesEvent } from "@multica/core/shortcuts";
import { memberListOptions } from "@multica/core/workspace/queries";
import { useNavigation, AppLink } from "../../navigation";
import { BreadcrumbHeader } from "../../layout/breadcrumb-header";
import { PageHeader } from "../../layout/page-header";
import {
  ArrowUpRight,
  ChevronDown,
  Crown,
  LayoutGrid,
  Loader2,
  Pencil,
  Plus,
  Repeat,
  Save,
  Settings,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@multica/ui/components/ui/button";
import { Input } from "@multica/ui/components/ui/input";
import { Label } from "@multica/ui/components/ui/label";
import { Switch } from "@multica/ui/components/ui/switch";
import { Skeleton } from "@multica/ui/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@multica/ui/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@multica/ui/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@multica/ui/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@multica/ui/components/ui/alert-dialog";
import { ActorAvatar } from "../../common/actor-avatar";
import {
  PickerItem,
  PickerSection,
  PickerEmpty,
} from "../../issues/components/pickers/property-picker";
import { toast } from "sonner";
import type { Team, TeamMember, TeamMemberRole, MemberWithUser } from "@multica/core/types";
import { useT, useTimeAgo } from "../../i18n";
import { matchesPinyin } from "../../editor/extensions/pinyin-match";

const COLOR_PRESETS = [
  "#6366f1",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
];

export function TeamDetailPage({
  workspaceId: propWsId,
  teamId: propTeamId,
}: {
  workspaceId?: string;
  workspaceSlug?: string;
  teamId?: string;
} = {}) {
  const { t } = useT("teams");
  const workspace = useCurrentWorkspace();
  const contextWsId = useWorkspaceId();
  const wsId = propWsId || contextWsId || workspace?.id || "";
  const p = useWorkspacePaths();
  const { pathname, push } = useNavigation();
  const teamId = propTeamId || pathname.split("/").pop() || "";

  const { data: team, isLoading: teamLoading } = useQuery({
    ...teamDetailOptions(wsId, teamId),
    enabled: Boolean(wsId && teamId),
  });

  const { data: members = [] } = useQuery({
    ...teamMembersOptions(wsId, teamId),
    enabled: Boolean(wsId && teamId),
  });

  const { data: cycles = [] } = useQuery({
    ...cycleListOptions(wsId, teamId),
    enabled: Boolean(wsId && teamId),
  });

  const { data: currentCycle } = useQuery({
    ...currentCycleOptions(wsId, teamId),
    enabled: Boolean(wsId && teamId),
  });

  const { data: wsMembers = [] } = useQuery(memberListOptions(wsId));

  const currentUser = useAuthStore((s) => s.user);
  const myRole = useMemo(() => {
    if (!currentUser) return null;
    return wsMembers.find((m: MemberWithUser) => m.user_id === currentUser.id)?.role ?? null;
  }, [wsMembers, currentUser]);

  const isWorkspaceAdmin = myRole === "owner" || myRole === "admin";
  const canManage = isWorkspaceAdmin;

  const [showAddMember, setShowAddMember] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateTeamMut = useUpdateTeam(wsId);
  const deleteTeamMut = useDeleteTeam(wsId);
  const addMemberMut = useAddTeamMember(wsId, teamId);
  const removeMemberMut = useRemoveTeamMember(wsId, teamId);
  const updateRoleMut = useUpdateTeamMemberRole(wsId, teamId);

  const handleDeleteTeam = () => {
    deleteTeamMut.mutate(teamId, {
      onSuccess: () => {
        toast.success(t(($) => $.page.toast_team_deleted));
        push(p.teams());
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : String(err));
      },
    });
  };

  if (teamLoading || !team) {
    if (!teamLoading && !team) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center p-8 py-16 text-center">
          <h2 className="mb-2 text-title-sm font-semibold">{t(($) => $.profile_card.unavailable)}</h2>
          <AppLink href={p.teams()} className="text-body text-primary hover:underline">
            {t(($) => $.page.title)}
          </AppLink>
        </div>
      );
    }
    return <TeamDetailSkeleton />;
  }

  const availableMembers = wsMembers.filter(
    (m: MemberWithUser) => !members.some((tm) => tm.user_id === m.user_id),
  );

  const initials = team.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <BreadcrumbHeader
        segments={[{ href: p.teams(), label: t(($) => $.page.title) }]}
        leaf={
          <>
            <TeamHeaderAvatar team={team} initials={initials} />
            <h1 className="truncate text-body font-medium text-foreground">{team.name}</h1>
          </>
        }
        actions={
          canManage ? (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="mr-1 size-3.5" />
              {t(($) => $.inspector.delete_button)}
            </Button>
          ) : null
        }
      />

      {/* Two-column grid mirrors squad-detail-page: left inspector (identity +
          properties + metadata), right pane with tabs (Overview | Cycles | Members | Settings).
          Mobile collapses to stacked single column. */}
      <div className="flex flex-1 min-h-0 flex-col gap-3 overflow-y-auto p-3 md:grid md:grid-cols-[280px_minmax(0,1fr)] md:gap-4 md:overflow-hidden md:p-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <TeamDetailInspector
          team={team}
          memberCount={members.length}
          canManage={canManage}
          onUpdateName={async (name) => {
            await updateTeamMut.mutateAsync({ id: team.id, data: { name } });
          }}
          onUpdateDescription={async (description) => {
            await updateTeamMut.mutateAsync({ id: team.id, data: { description } });
          }}
          onUpdateColor={async (color) => {
            await updateTeamMut.mutateAsync({ id: team.id, data: { color } });
          }}
        />

        <TeamOverviewPane
          team={team}
          members={members}
          cycles={cycles}
          currentCycle={currentCycle}
          canManage={canManage}
          onAddMemberClick={() => setShowAddMember(true)}
          onRemoveMember={(userId) => {
            removeMemberMut.mutate(userId, {
              onSuccess: () => toast.success("Member removed"),
              onError: (err) =>
                toast.error(err instanceof Error ? err.message : "Failed to remove member"),
            });
          }}
          onUpdateRole={(userId, role) => {
            updateRoleMut.mutate(
              { userId, data: { role } },
              {
                onSuccess: () => toast.success("Role updated"),
                onError: (err) =>
                  toast.error(err instanceof Error ? err.message : "Failed to update role"),
              },
            );
          }}
          onSaveSettings={async (data) => {
            await updateTeamMut.mutateAsync({ id: team.id, data });
            toast.success(t(($) => $.settings_tab.saved_toast));
          }}
        />
      </div>

      {showAddMember && (
        <AddMemberDialog
          availableMembers={availableMembers}
          onClose={() => setShowAddMember(false)}
          onSubmit={async (input) => {
            await addMemberMut.mutateAsync({
              user_id: input.userId,
              role: input.role,
            });
            toast.success("Member added");
          }}
        />
      )}

      {confirmDelete && (
        <AlertDialog
          open
          onOpenChange={(v) => {
            if (!v && !deleteTeamMut.isPending) setConfirmDelete(false);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t(($) => $.delete_dialog.title)}</AlertDialogTitle>
              <AlertDialogDescription>
                {t(($) => $.delete_dialog.description)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteTeamMut.isPending}>
                {t(($) => $.delete_dialog.cancel)}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTeam}
                disabled={deleteTeamMut.isPending}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {deleteTeamMut.isPending
                  ? t(($) => $.delete_dialog.deleting)
                  : t(($) => $.delete_dialog.confirm)}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

function TeamDetailSkeleton() {
  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <PageHeader>
        <Skeleton className="h-5 w-48" />
      </PageHeader>
      <div className="flex flex-1 min-h-0 flex-col gap-3 overflow-y-auto p-3 md:grid md:grid-cols-[280px_minmax(0,1fr)] md:gap-4 md:overflow-hidden md:p-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 rounded-lg border p-5">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-lg border p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamHeaderAvatar({ team, initials }: { team: Team; initials: string }) {
  return (
    <div
      className="flex size-4 shrink-0 items-center justify-center rounded-full text-micro font-semibold text-white"
      style={{ backgroundColor: team.color || "#6366f1" }}
    >
      {initials.slice(0, 1)}
    </div>
  );
}

function TeamAvatarControl({
  team,
  canManage,
  onUpdateColor,
}: {
  team: Team;
  canManage: boolean;
  onUpdateColor: (color: string) => Promise<void>;
}) {
  const { t } = useT("teams");
  const initials = team.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (!canManage) {
    return (
      <div
        className="flex size-16 shrink-0 items-center justify-center rounded-full text-title font-bold text-white shadow-xs"
        style={{ backgroundColor: team.color || "#6366f1" }}
      >
        {initials}
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="group relative flex size-16 shrink-0 items-center justify-center rounded-full text-title font-bold text-white shadow-xs transition-transform hover:scale-105"
            style={{ backgroundColor: team.color || "#6366f1" }}
          >
            {initials}
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
              <Pencil className="size-4 text-white" />
            </span>
          </button>
        }
      />
      <PopoverContent align="start" className="w-56 p-3">
        <p className="mb-2 text-caption font-medium">
          {t(($) => $.edit_dialog.color_label)}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              className={`size-8 rounded-full border-2 transition-transform hover:scale-110 ${
                (team.color || "#6366f1") === c
                  ? "border-foreground scale-110"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
              onClick={() => void onUpdateColor(c)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TeamNameEditor({
  value,
  onSave,
}: {
  value: string;
  onSave: (next: string) => Promise<void>;
}) {
  const { t } = useT("teams");
  return (
    <InlineEditPopover
      value={value}
      onSave={onSave}
      title={t(($) => $.name_editor.title)}
      placeholder={t(($) => $.name_editor.placeholder)}
      validate={(v) => (v.trim().length > 0 ? null : "Name is required")}
    >
      {(triggerProps) => (
        <button
          type="button"
          {...triggerProps}
          className="group -mx-1 inline-flex items-center gap-1.5 self-start rounded px-1 text-left text-title font-semibold leading-tight transition-colors hover:bg-accent/50"
        >
          <span>{value}</span>
          <Pencil className="size-3.5 shrink-0 text-transparent transition-colors group-hover:text-muted-foreground" />
        </button>
      )}
    </InlineEditPopover>
  );
}

function InlineEditPopover({
  value,
  onSave,
  title,
  placeholder,
  validate,
  children,
}: {
  value: string;
  onSave: (next: string) => Promise<void>;
  title: string;
  placeholder?: string;
  validate?: (v: string) => string | null;
  children: (triggerProps: { onClick: (e: React.MouseEvent) => void }) => ReactNode;
}) {
  const { t } = useT("teams");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setError(null);
    }
  }, [open, value]);

  const commit = async () => {
    const err = validate?.(draft) ?? null;
    if (err) {
      setError(err);
      return;
    }
    if (draft.trim() === value.trim()) {
      setOpen(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(draft.trim());
      setOpen(false);
      toast.success(t(($) => $.page.toast_team_updated));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={children({ onClick: () => setOpen(true) }) as React.ReactElement}
      />
      <PopoverContent align="start" className="w-72 p-3">
        <div className="space-y-2">
          <p className="text-caption font-medium">{title}</p>
          <Input
            autoFocus
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                return;
              }
              if (isImeComposing(e)) return;
              if (e.key === "Enter") {
                e.preventDefault();
                void commit();
              }
            }}
            className="h-8"
          />
          {error && <p className="text-caption text-destructive">{error}</p>}
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={saving}>
              {t(($) => $.name_editor.cancel)}
            </Button>
            <Button size="sm" onClick={() => void commit()} disabled={saving || draft === value}>
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : t(($) => $.name_editor.save)}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TeamDescriptionEditor({
  value,
  onSave,
}: {
  value: string;
  onSave: (next: string) => Promise<void>;
}) {
  const { t } = useT("teams");
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group -mx-1 inline-flex items-start gap-1.5 self-start rounded px-1 text-left text-caption leading-relaxed transition-colors hover:bg-accent/50"
      >
        {value ? (
          <span className="text-muted-foreground">{value}</span>
        ) : (
          <span className="italic text-muted-foreground">
            {t(($) => $.description_dialog.placeholder_empty)}
          </span>
        )}
        <Pencil className="mt-0.5 size-3 shrink-0 text-transparent transition-colors group-hover:text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          {open && (
            <TeamDescriptionEditorBody
              initialValue={value}
              onSave={onSave}
              onClose={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function TeamDescriptionEditorBody({
  initialValue,
  onSave,
  onClose,
}: {
  initialValue: string;
  onSave: (next: string) => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useT("teams");
  const [draft, setDraft] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const dirty = draft !== initialValue;

  const commit = async () => {
    if (savingRef.current) return;
    if (!dirty) {
      onClose();
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      await onSave(draft.trim());
      onClose();
      toast.success(t(($) => $.page.toast_team_updated));
    } catch {
      // error handled by caller
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t(($) => $.description_dialog.title)}</DialogTitle>
      </DialogHeader>
      <textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={t(($) => $.description_dialog.placeholder)}
        rows={6}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onClose();
            return;
          }
          if (e.defaultPrevented || e.repeat || isImeComposing(e)) return;
          if (shortcutMatchesEvent(getShortcut("send"), e.nativeEvent)) {
            e.preventDefault();
            void commit();
          }
        }}
        className="w-full resize-none rounded-md border bg-transparent px-3 py-2 text-body outline-none focus-visible:border-input"
      />
      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
          {t(($) => $.description_dialog.cancel)}
        </Button>
        <Button size="sm" onClick={() => void commit()} disabled={saving || !dirty}>
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : t(($) => $.description_dialog.save)}
        </Button>
      </DialogFooter>
    </>
  );
}

function TeamDetailInspector({
  team,
  memberCount,
  canManage,
  onUpdateName,
  onUpdateDescription,
  onUpdateColor,
}: {
  team: Team;
  memberCount: number;
  canManage: boolean;
  onUpdateName: (next: string) => Promise<void>;
  onUpdateDescription: (next: string) => Promise<void>;
  onUpdateColor: (next: string) => Promise<void>;
}) {
  const { t } = useT("teams");
  const timeAgo = useTimeAgo();

  return (
    <aside className="flex w-full flex-col rounded-lg border bg-background md:h-full md:min-h-0 md:overflow-y-auto">
      {/* Identity */}
      <div className="flex flex-col gap-3 border-b px-5 pb-5 pt-5">
        <TeamAvatarControl
          team={team}
          canManage={canManage}
          onUpdateColor={onUpdateColor}
        />
        <div className="flex flex-col gap-1">
          {canManage ? (
            <>
              <TeamNameEditor value={team.name} onSave={onUpdateName} />
              <TeamDescriptionEditor
                value={team.description || ""}
                onSave={onUpdateDescription}
              />
            </>
          ) : (
            <>
              <span className="text-title font-semibold leading-tight">{team.name}</span>
              {team.description ? (
                <span className="text-caption leading-relaxed text-muted-foreground">
                  {team.description}
                </span>
              ) : (
                <span className="text-caption italic leading-relaxed text-muted-foreground">
                  {t(($) => $.description_dialog.placeholder_empty)}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Details Section */}
      <div className="border-b px-5 py-4">
        <div className="mb-1 -mx-2 px-2 text-micro font-medium uppercase tracking-wider text-muted-foreground">
          {t(($) => $.inspector.details_section)}
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
          <InspectorRow label={t(($) => $.table.key)}>
            <span className="font-mono text-caption text-foreground">{team.key}</span>
          </InspectorRow>
          <InspectorRow label={t(($) => $.table.cycles)}>
            {team.cycles_enabled ? (
              <span className="inline-flex items-center gap-1 text-caption text-primary">
                <Repeat className="size-3" />
                <span>
                  {t(($) => $.cycles.enabled, {
                    weeks: team.cycle_duration_weeks || 2,
                  })}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">{t(($) => $.cycles.disabled)}</span>
            )}
          </InspectorRow>
          <InspectorRow label={t(($) => $.table.issues)}>
            <span className="tabular-nums text-muted-foreground">{team.issue_counter}</span>
          </InspectorRow>
          <InspectorRow label={t(($) => $.table.members)}>
            <span className="tabular-nums text-muted-foreground">{memberCount}</span>
          </InspectorRow>
          <InspectorRow label={t(($) => $.table.created)}>
            <span className="text-muted-foreground">{timeAgo(team.created_at)}</span>
          </InspectorRow>
          <InspectorRow label={t(($) => $.table.updated)}>
            <span className="text-muted-foreground">{timeAgo(team.updated_at)}</span>
          </InspectorRow>
        </div>
      </div>
    </aside>
  );
}

function InspectorRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <div className="px-2 py-1 text-caption text-muted-foreground">{label}</div>
      <div className="min-w-0 px-2 py-1 text-caption">{children}</div>
    </>
  );
}

type TeamDetailTab = "overview" | "cycles" | "members" | "settings";

function TeamOverviewPane({
  team,
  members,
  cycles,
  currentCycle,
  canManage,
  onAddMemberClick,
  onRemoveMember,
  onUpdateRole,
  onSaveSettings,
}: {
  team: Team;
  members: TeamMember[];
  cycles: Array<{
    id: string;
    number: number;
    name?: string;
    status: string;
    start_date: string;
    end_date: string;
    total_issues?: number;
    completed_issues?: number;
  }>;
  currentCycle: {
    number: number;
    name?: string;
    start_date: string;
    end_date: string;
    total_issues?: number;
    completed_issues?: number;
  } | null | undefined;
  canManage: boolean;
  onAddMemberClick: () => void;
  onRemoveMember: (userId: string) => void;
  onUpdateRole: (userId: string, role: TeamMemberRole) => void;
  onSaveSettings: (data: {
    name?: string;
    key?: string;
    description?: string;
    color?: string;
    cycles_enabled?: boolean;
    cycle_duration_weeks?: number;
  }) => Promise<void>;
}) {
  const { t } = useT("teams");
  const [activeTab, setActiveTab] = useState<TeamDetailTab>("overview");
  const [activeDirty, setActiveDirty] = useState(false);
  const [pendingTab, setPendingTab] = useState<TeamDetailTab | null>(null);

  const teamDetailTabs: { id: TeamDetailTab; label: string; icon: typeof LayoutGrid; count?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "cycles", label: "Cycles", icon: Repeat, count: cycles.length },
    { id: "members", label: "Members", icon: Users, count: members.length },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const requestTabChange = (next: TeamDetailTab) => {
    if (next === activeTab) return;
    if (activeDirty) {
      setPendingTab(next);
      return;
    }
    setActiveTab(next);
  };

  const commitTabChange = () => {
    if (pendingTab) {
      setActiveTab(pendingTab);
      setActiveDirty(false);
      setPendingTab(null);
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col overflow-hidden rounded-lg border bg-background md:h-full md:min-h-0">
      <div className="flex shrink-0 items-center gap-0 overflow-x-auto border-b px-2 md:px-4">
        {teamDetailTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => requestTabChange(tab.id)}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-caption font-medium transition-colors ${
              activeTab === tab.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="size-3.5" />
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span className="tabular-nums text-caption text-muted-foreground">
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === "overview" && (
          <div className="flex h-full flex-col p-4 md:p-6">
            <TeamOverviewTab
              team={team}
              membersCount={members.length}
              cycles={cycles}
              currentCycle={currentCycle}
            />
          </div>
        )}

        {activeTab === "cycles" && (
          <div className="flex h-full flex-col p-4 md:p-6">
            <TeamCyclesTab cycles={cycles} />
          </div>
        )}

        {activeTab === "members" && (
          <div className="flex h-full flex-col p-4 md:p-6">
            <TeamMembersTab
              members={members}
              canManage={canManage}
              onAddMemberClick={onAddMemberClick}
              onRemoveMember={onRemoveMember}
              onUpdateRole={onUpdateRole}
            />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="flex h-full flex-col p-4 md:p-6">
            <TeamSettingsTab
              team={team}
              canManage={canManage}
              onSave={onSaveSettings}
              onDirtyChange={setActiveDirty}
            />
          </div>
        )}
      </div>

      {pendingTab !== null && (
        <AlertDialog
          open
          onOpenChange={(v) => {
            if (!v) setPendingTab(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t(($) => $.discard_changes_dialog.title)}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t(($) => $.discard_changes_dialog.description)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {t(($) => $.discard_changes_dialog.keep_editing)}
              </AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={commitTabChange}>
                {t(($) => $.discard_changes_dialog.discard_button)}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

function TeamOverviewTab({
  team,
  membersCount,
  cycles,
  currentCycle,
}: {
  team: Team;
  membersCount: number;
  cycles: Array<{ status: string }>;
  currentCycle: {
    number: number;
    name?: string;
    start_date: string;
    end_date: string;
    total_issues?: number;
    completed_issues?: number;
  } | null | undefined;
}) {
  const { t } = useT("teams");
  const completedCyclesCount = cycles.filter((c) => c.status === "previous").length;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Current Cycle Banner */}
      <div className="rounded-lg border border-border/70 bg-card p-5 shadow-2xs">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="size-4 text-primary" />
            <h3 className="text-body font-medium text-foreground">
              {t(($) => $.overview_tab.active_cycle)}
            </h3>
          </div>
          {currentCycle && (
            <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-caption text-primary">
              {t(($) => $.overview_tab.cycle_number, { number: currentCycle.number })}
            </span>
          )}
        </div>
        {currentCycle ? (
          <div>
            <h4 className="mb-1 text-title-sm font-semibold">
              {currentCycle.name || `Cycle ${currentCycle.number}`}
            </h4>
            <p className="mb-4 text-caption text-muted-foreground">
              {new Date(currentCycle.start_date).toLocaleDateString()} –{" "}
              {new Date(currentCycle.end_date).toLocaleDateString()}
            </p>
            <div className="flex items-center gap-6 border-t border-border/40 pt-3 text-caption text-muted-foreground">
              <span>
                <strong className="font-semibold text-foreground">
                  {currentCycle.total_issues ?? 0}
                </strong>{" "}
                {t(($) => $.overview_tab.issues)}
              </span>
              <span>
                <strong className="font-semibold text-foreground">
                  {currentCycle.completed_issues ?? 0}
                </strong>{" "}
                {t(($) => $.overview_tab.completed)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-caption text-muted-foreground">
            {t(($) => $.overview_tab.no_active_cycle)}
          </p>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <div className="mb-1 text-caption text-muted-foreground">
            {t(($) => $.overview_tab.total_issues)}
          </div>
          <div className="text-display-sm font-bold tabular-nums">{team.issue_counter}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <div className="mb-1 text-caption text-muted-foreground">
            {t(($) => $.overview_tab.team_members)}
          </div>
          <div className="text-display-sm font-bold tabular-nums">{membersCount}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <div className="mb-1 text-caption text-muted-foreground">
            {t(($) => $.overview_tab.cycles_completed)}
          </div>
          <div className="text-display-sm font-bold tabular-nums">{completedCyclesCount}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <div className="mb-1 text-caption text-muted-foreground">
            {t(($) => $.overview_tab.cycle_duration)}
          </div>
          <div className="text-display-sm font-bold tabular-nums">
            {`${team.cycle_duration_weeks || 2}w`}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamCyclesTab({
  cycles,
}: {
  cycles: Array<{
    id: string;
    number: number;
    name?: string;
    status: string;
    start_date: string;
    end_date: string;
  }>;
}) {
  const { t } = useT("teams");

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h3 className="text-body font-medium">{t(($) => $.cycles_tab.title)}</h3>
      </div>

      {cycles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 p-8 text-center">
          <Repeat className="mx-auto mb-2 size-8 text-faint-foreground" />
          <p className="text-caption text-muted-foreground">{t(($) => $.cycles_tab.no_cycles)}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cycles.map((cycle) => (
            <div
              key={cycle.id}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-4 transition-colors hover:border-border"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-body font-semibold">
                    {cycle.name || `Cycle ${cycle.number}`}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-micro font-semibold uppercase tracking-wider ${
                      cycle.status === "current"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : cycle.status === "upcoming"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {cycle.status}
                  </span>
                </div>
                <p className="mt-0.5 text-caption text-muted-foreground">
                  {new Date(cycle.start_date).toLocaleDateString()} –{" "}
                  {new Date(cycle.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamMembersTab({
  members,
  canManage,
  onAddMemberClick,
  onRemoveMember,
  onUpdateRole,
}: {
  members: TeamMember[];
  canManage: boolean;
  onAddMemberClick: () => void;
  onRemoveMember: (userId: string) => void;
  onUpdateRole: (userId: string, role: TeamMemberRole) => void;
}) {
  const { t } = useT("teams");
  const p = useWorkspacePaths();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-body font-medium">{t(($) => $.members_tab.section_title)}</h3>
          <p className="mt-0.5 text-caption text-muted-foreground">
            {t(($) => $.members_tab.section_count, { count: members.length })}
          </p>
        </div>
        {canManage && (
          <Button size="sm" variant="outline" onClick={onAddMemberClick}>
            <Plus className="mr-1.5 size-3.5" />
            {t(($) => $.members_tab.add_member_button)}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {members.map((m) => {
          const isLead = m.role === "lead";
          return (
            <div key={m.id || m.user_id} className="group flex items-start gap-3 rounded-lg border p-3">
              <ActorAvatar
                actorType="member"
                actorId={m.user_id}
                size="lg"
                className="shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-body font-medium">
                    {m.user_name || m.user_email || m.user_id.slice(0, 8)}
                  </span>
                  {isLead ? (
                    <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-caption text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <Crown className="size-3" />
                      {t(($) => $.members_tab.lead_chip)}
                    </span>
                  ) : (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-caption text-muted-foreground capitalize">
                      {m.role || "member"}
                    </span>
                  )}
                </div>
                {m.user_email && (
                  <div className="mt-0.5 text-caption text-muted-foreground">{m.user_email}</div>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <AppLink
                        href={p.memberDetail(m.user_id)}
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        aria-label={t(($) => $.members_tab.view_member_tooltip)}
                      >
                        <ArrowUpRight className="size-3.5" />
                      </AppLink>
                    }
                  />
                  <TooltipContent>
                    {t(($) => $.members_tab.view_member_tooltip)}
                  </TooltipContent>
                </Tooltip>

                {canManage && !isLead && (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          size="sm"
                          variant="ghost"
                          className="size-8 p-0 text-muted-foreground hover:text-amber-600"
                          onClick={() => onUpdateRole(m.user_id, "lead")}
                          aria-label={t(($) => $.members_tab.make_lead_tooltip)}
                        >
                          <Crown className="size-3.5" />
                        </Button>
                      }
                    />
                    <TooltipContent>
                      {t(($) => $.members_tab.make_lead_tooltip)}
                    </TooltipContent>
                  </Tooltip>
                )}

                {canManage && (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          size="sm"
                          variant="ghost"
                          className="size-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => onRemoveMember(m.user_id)}
                          aria-label={t(($) => $.members_tab.remove_member_tooltip)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      }
                    />
                    <TooltipContent>
                      {t(($) => $.members_tab.remove_member_tooltip)}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddMemberDialog({
  availableMembers,
  onClose,
  onSubmit,
}: {
  availableMembers: MemberWithUser[];
  onClose: () => void;
  onSubmit: (input: { userId: string; role?: TeamMemberRole }) => Promise<void>;
}) {
  const { t } = useT("teams");
  const [selectedUser, setSelectedUser] = useState<MemberWithUser | null>(null);
  const [role, setRole] = useState<TeamMemberRole>("member");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerFilter, setPickerFilter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const query = pickerFilter.trim().toLowerCase();
  const filteredMembers = availableMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      matchesPinyin(m.name, query),
  );

  const canSubmit = Boolean(selectedUser) && !submitting;

  const handleSubmit = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await onSubmit({ userId: selectedUser.user_id, role });
      onClose();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t(($) => $.add_member_dialog.title)}</DialogTitle>
          <DialogDescription>{t(($) => $.add_member_dialog.description)}</DialogDescription>
        </DialogHeader>

        <div className="min-w-0 space-y-4">
          <div>
            <Label className="text-caption text-muted-foreground">
              {t(($) => $.add_member_dialog.label_member)}
            </Label>
            <Popover
              open={pickerOpen}
              onOpenChange={(v) => {
                setPickerOpen(v);
                if (!v) setPickerFilter("");
              }}
            >
              <PopoverTrigger className="mt-1 flex w-full min-w-0 items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-left text-body transition-colors hover:bg-muted">
                {selectedUser ? (
                  <ActorAvatar actorType="member" actorId={selectedUser.user_id} size="sm" />
                ) : (
                  <UserPlus className="size-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {selectedUser?.name ?? t(($) => $.add_member_dialog.select_placeholder)}
                  </div>
                  {selectedUser && (
                    <div className="truncate text-caption text-muted-foreground">
                      {selectedUser.email}
                    </div>
                  )}
                </div>
                <ChevronDown
                  className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                    pickerOpen ? "rotate-180" : ""
                  }`}
                />
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[var(--anchor-width)] p-0">
                <div className="border-b px-2 py-1.5">
                  <input
                    autoFocus
                    type="text"
                    value={pickerFilter}
                    onChange={(e) => setPickerFilter(e.target.value)}
                    placeholder={t(($) => $.add_member_dialog.search_placeholder)}
                    className="w-full bg-transparent text-body placeholder:text-muted-foreground outline-none"
                  />
                </div>
                <div className="max-h-72 overflow-y-auto p-1">
                  {filteredMembers.length > 0 ? (
                    <PickerSection label="Members">
                      {filteredMembers.map((m) => (
                        <PickerItem
                          key={m.user_id}
                          selected={selectedUser?.user_id === m.user_id}
                          onClick={() => {
                            setSelectedUser(m);
                            setPickerOpen(false);
                            setPickerFilter("");
                          }}
                        >
                          <ActorAvatar actorType="member" actorId={m.user_id} size="sm" />
                          <span>{m.name}</span>
                        </PickerItem>
                      ))}
                    </PickerSection>
                  ) : (
                    <PickerEmpty />
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-caption text-muted-foreground">
              {t(($) => $.add_member_dialog.label_role)}
            </Label>
            <div className="mt-1.5 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={role === "member" ? "default" : "outline"}
                className={role === "member" ? "bg-primary text-primary-foreground" : ""}
                onClick={() => setRole("member")}
              >
                {t(($) => $.members_tab.member_chip)}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={role === "lead" ? "default" : "outline"}
                className={role === "lead" ? "bg-primary text-primary-foreground" : ""}
                onClick={() => setRole("lead")}
              >
                <Crown className="mr-1 size-3.5" />
                {t(($) => $.members_tab.lead_chip)}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            {t(($) => $.add_member_dialog.cancel)}
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={!canSubmit}>
            {submitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              t(($) => $.add_member_dialog.add)
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TeamSettingsTab({
  team,
  canManage,
  onSave,
  onDirtyChange,
}: {
  team: Team;
  canManage: boolean;
  onSave: (data: {
    name?: string;
    key?: string;
    description?: string;
    color?: string;
    cycles_enabled?: boolean;
    cycle_duration_weeks?: number;
  }) => Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const { t } = useT("teams");
  const [name, setName] = useState(team.name);
  const [key, setKey] = useState(team.key);
  const [description, setDescription] = useState(team.description || "");
  const [color, setColor] = useState(team.color || "#6366f1");
  const [cyclesEnabled, setCyclesEnabled] = useState(team.cycles_enabled ?? true);
  const [cycleDurationWeeks, setCycleDurationWeeks] = useState(team.cycle_duration_weeks || 2);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(team.name);
    setKey(team.key);
    setDescription(team.description || "");
    setColor(team.color || "#6366f1");
    setCyclesEnabled(team.cycles_enabled ?? true);
    setCycleDurationWeeks(team.cycle_duration_weeks || 2);
  }, [team]);

  const isDirty =
    name !== team.name ||
    key !== team.key ||
    description !== (team.description || "") ||
    color !== (team.color || "#6366f1") ||
    cyclesEnabled !== (team.cycles_enabled ?? true) ||
    cycleDurationWeeks !== (team.cycle_duration_weeks || 2);

  useEffect(() => {
    onDirtyChange?.(canManage && isDirty);
  }, [canManage, isDirty, onDirtyChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim() || undefined,
        color,
        cycles_enabled: cyclesEnabled,
        cycle_duration_weeks: cycleDurationWeeks,
      });
    } catch {
      // toast handled by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label className="text-caption font-medium">
            {t(($) => $.settings_tab.name_label)}
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canManage || saving}
            required
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-caption font-medium">
            {t(($) => $.settings_tab.key_label)}
          </Label>
          <Input
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            disabled={!canManage || saving}
            maxLength={10}
            required
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-caption font-medium">
            {t(($) => $.settings_tab.description_label)}
          </Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!canManage || saving}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-caption font-medium">
            {t(($) => $.settings_tab.color_label)}
          </Label>
          <div className="flex items-center gap-2">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                disabled={!canManage || saving}
                className={`size-6 rounded-full border-2 transition-transform ${
                  color === c
                    ? "border-foreground scale-110"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label className="text-body font-medium">
              {t(($) => $.settings_tab.cycles_label)}
            </Label>
            <p className="text-caption text-muted-foreground">
              {t(($) => $.settings_tab.cycles_hint)}
            </p>
          </div>
          <Switch
            checked={cyclesEnabled}
            onCheckedChange={setCyclesEnabled}
            disabled={!canManage || saving}
          />
        </div>

        {cyclesEnabled && (
          <div className="grid gap-1.5">
            <Label className="text-caption font-medium">
              {t(($) => $.settings_tab.duration_label)}
            </Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={cycleDurationWeeks}
              onChange={(e) => setCycleDurationWeeks(parseInt(e.target.value, 10) || 2)}
              disabled={!canManage || saving}
            />
          </div>
        )}
      </div>

      {canManage && (
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="submit" size="sm" disabled={!isDirty || saving}>
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5 mr-1" />
            )}
            {t(($) => $.settings_tab.save_button)}
          </Button>
        </div>
      )}
    </form>
  );
}
