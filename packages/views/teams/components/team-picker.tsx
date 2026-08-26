"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Users } from "lucide-react";
import { teamListOptions } from "@multica/core/teams";
import { cn } from "@multica/ui/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@multica/ui/components/ui/dropdown-menu";
import { useT } from "../../i18n";

export function TeamPicker({
  workspaceId,
  selectedTeamId,
  onSelectTeam,
  triggerClassName,
  align = "start",
}: {
  workspaceId: string;
  selectedTeamId: string | null;
  onSelectTeam: (teamId: string | null) => void;
  triggerClassName?: string;
  align?: "start" | "end" | "center";
}) {
  const { t } = useT("teams");
  const { data: teams = [] } = useQuery(teamListOptions(workspaceId));
  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-2 py-1 text-caption font-medium hover:bg-accent/60 transition-colors cursor-pointer border border-border/50",
              triggerClassName,
            )}
          >
            {selectedTeam ? (
              <>
                <span
                  className="size-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedTeam.color || "#6366f1" }}
                />
                <span className="truncate max-w-[120px]">
                  {selectedTeam.name}
                </span>
              </>
            ) : (
              <>
                <Users className="size-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{t(($) => $.page.no_team)}</span>
              </>
            )}
            <ChevronsUpDown className="size-3 text-muted-foreground ml-auto" />
          </button>
        }
      />
      <DropdownMenuContent align={align} className="w-52">
        <DropdownMenuItem onClick={() => onSelectTeam(null)}>
          <span className="text-muted-foreground">{t(($) => $.page.no_team)}</span>
          {!selectedTeamId && <Check className="ml-auto size-3.5" />}
        </DropdownMenuItem>
        {teams.map((team) => (
          <DropdownMenuItem
            key={team.id}
            onClick={() => onSelectTeam(team.id)}
            className="flex items-center gap-2"
          >
            <span
              className="size-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: team.color || "#6366f1" }}
            />
            <span className="truncate">{team.name}</span>
            <span className="text-muted-foreground font-mono text-micro ml-1">
              {team.key}
            </span>
            {team.id === selectedTeamId && (
              <Check className="ml-auto size-3.5" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
