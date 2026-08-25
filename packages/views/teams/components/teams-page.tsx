"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users, ArrowRight } from "lucide-react";
import { teamListOptions } from "@multica/core/teams";
import { useWorkspaceId } from "@multica/core/hooks";
import { useWorkspacePaths } from "@multica/core/paths";
import { Button } from "@multica/ui/components/ui/button";
import { AppLink } from "../../navigation/app-link";
import { CreateTeamDialog } from "./create-team-dialog";

export function TeamsPage({
  workspaceId: propWsId,
}: {
  workspaceId?: string;
  workspaceSlug?: string;
} = {}) {
  const contextWsId = useWorkspaceId();
  const paths = useWorkspacePaths();
  const workspaceId = propWsId || contextWsId;
  const [createOpen, setCreateOpen] = useState(false);
  const { data: teams = [], isLoading } = useQuery(
    teamListOptions(workspaceId),
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <div className="border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-title font-semibold tracking-tight">Teams</h1>
          <p className="text-body text-muted-foreground">
            Organize work, cycles, and issues across functional teams.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1.5">
          <Plus className="size-4" />
          <span>New Team</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 rounded-lg border border-border/50 bg-card p-5 animate-pulse"
              />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border/60 rounded-xl p-8 max-w-md mx-auto">
            <Users className="size-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-title-sm font-medium mb-1">No teams yet</h3>
            <p className="text-caption text-muted-foreground mb-4">
              Create your first team to manage scoped issues, cycles, and issue identifiers.
            </p>
            <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1.5">
              <Plus className="size-4" />
              <span>Create Team</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <AppLink
                key={team.id}
                href={paths.teamDetail(team.id)}
                className="group flex flex-col justify-between rounded-lg border border-border/60 bg-card p-5 hover:border-border hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="size-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: team.color || "#6366f1" }}
                      />
                      <span className="font-semibold text-body group-hover:text-primary transition-colors">
                        {team.name}
                      </span>
                    </div>
                    <span className="font-mono text-caption px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {team.key}
                    </span>
                  </div>
                  {team.description && (
                    <p className="text-caption text-muted-foreground line-clamp-2 mt-1">
                      {team.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-caption text-muted-foreground">
                  <span>{team.issue_counter} issues</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-foreground">
                    View Team <ArrowRight className="size-3" />
                  </span>
                </div>
              </AppLink>
            ))}
          </div>
        )}
      </div>

      <CreateTeamDialog
        workspaceId={workspaceId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
