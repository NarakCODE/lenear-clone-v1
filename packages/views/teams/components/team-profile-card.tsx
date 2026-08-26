"use client";

import { useQuery } from "@tanstack/react-query";
import { useWorkspaceId } from "@multica/core/hooks";
import { teamListOptions, teamMembersOptions } from "@multica/core/teams";
import { useWorkspacePaths } from "@multica/core/paths";
import { Skeleton } from "@multica/ui/components/ui/skeleton";
import type { TeamMember } from "@multica/core/types";
import { ActorAvatar } from "../../common/actor-avatar";
import { AppLink } from "../../navigation";
import { useT } from "../../i18n";

interface TeamProfileCardProps {
  teamId: string;
}

export function TeamProfileCard({ teamId }: TeamProfileCardProps) {
  const { t } = useT("teams");
  const wsId = useWorkspaceId();
  const p = useWorkspacePaths();
  const { data: teams = [], isLoading: teamsLoading } = useQuery(
    teamListOptions(wsId),
  );
  const { data: members = [] } = useQuery(teamMembersOptions(wsId, teamId));

  const team = teams.find((item) => item.id === teamId);

  if (teamsLoading && !team) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-caption text-muted-foreground">
        {t(($) => $.profile_card.unavailable)}
      </div>
    );
  }

  const isArchived = Boolean(team.archived_at);
  const initials = team.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="group flex flex-col gap-3 text-left">
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-xs"
          style={{ backgroundColor: team.color || "#6366f1" }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-body font-semibold">{team.name}</p>
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-micro text-muted-foreground">
              {team.key}
            </span>
            {isArchived && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-micro font-medium text-muted-foreground">
                {t(($) => $.profile_card.archived)}
              </span>
            )}
          </div>
        </div>
        {!isArchived && (
          <AppLink
            href={p.teamDetail(team.id)}
            className="mr-1 mt-0.5 shrink-0 text-caption font-normal text-brand opacity-0 transition-opacity group-hover:opacity-100"
          >
            {t(($) => $.profile_card.detail_link)}
          </AppLink>
        )}
      </div>

      {team.description && (
        <p className="line-clamp-2 text-caption text-muted-foreground">
          {team.description}
        </p>
      )}

      {members.length > 0 && (
        <TeamMembersList members={members} />
      )}
    </div>
  );
}

function TeamMembersList({ members }: { members: TeamMember[] }) {
  const { t } = useT("teams");
  const p = useWorkspacePaths();
  const visible = members.slice(0, 3);
  const overflow = Math.max(0, members.length - visible.length);

  return (
    <div className="flex flex-col gap-1.5 text-caption">
      <span className="text-muted-foreground">
        {t(($) => $.profile_card.members_section)}
        <span className="ml-1 tabular-nums">· {members.length}</span>
      </span>
      <div className="flex flex-col gap-0.5">
        {visible.map((m) => {
          const isLead = m.role === "lead";
          const href = p.memberDetail(m.user_id);

          return (
            <AppLink
              key={m.id || m.user_id}
              href={href}
              className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent/60"
            >
              <ActorAvatar
                actorType="member"
                actorId={m.user_id}
                size="sm"
                className="shrink-0"
              />
              <span className="min-w-0 flex-1 truncate font-medium">
                {m.user_name || m.user_email || m.user_id.slice(0, 8)}
              </span>
              {isLead && (
                <span className="max-w-[4rem] shrink-0 truncate rounded-md bg-amber-100 px-1 py-0.5 text-micro font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  {t(($) => $.members_tab.lead_chip)}
                </span>
              )}
            </AppLink>
          );
        })}
        {overflow > 0 && (
          <span className="px-2 py-0.5 text-muted-foreground">
            {t(($) => $.profile_card.more_members, { count: overflow })}
          </span>
        )}
      </div>
    </div>
  );
}
