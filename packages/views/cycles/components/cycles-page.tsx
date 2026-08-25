"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Repeat } from "lucide-react";
import { teamListOptions } from "@multica/core/teams";
import { cycleListOptions } from "@multica/core/cycles";
import { useWorkspaceId } from "@multica/core/hooks";
import { Button } from "@multica/ui/components/ui/button";
import { CreateCycleDialog } from "./create-cycle-dialog";
import { CycleProgressCard } from "./cycle-progress-card";

export function CyclesPage({
  workspaceId: propWsId,
}: {
  workspaceId?: string;
  workspaceSlug?: string;
} = {}) {
  const contextWsId = useWorkspaceId();
  const workspaceId = propWsId || contextWsId;
  const { data: teams = [] } = useQuery(teamListOptions(workspaceId));
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    () => teams[0]?.id || "",
  );
  const [createOpen, setCreateOpen] = useState(false);

  const activeTeamId = selectedTeamId || teams[0]?.id || "";
  const { data: cycles = [], isLoading } = useQuery(
    cycleListOptions(workspaceId, activeTeamId),
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <div className="border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-title font-semibold tracking-tight">Cycles</h1>
          <p className="text-body text-muted-foreground">
            Timebox work into 1–4 week sprints with progress and burndown.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {teams.length > 0 && (
            <select
              value={activeTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="text-caption bg-card border border-border rounded px-3 py-1.5 font-medium"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.key})
                </option>
              ))}
            </select>
          )}

          {activeTeamId && (
            <Button
              onClick={() => setCreateOpen(true)}
              size="sm"
              className="gap-1.5"
            >
              <Plus className="size-4" />
              <span>New Cycle</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="space-y-4 max-w-3xl">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-28 rounded-lg border border-border/50 bg-card p-5 animate-pulse"
              />
            ))}
          </div>
        ) : !activeTeamId ? (
          <div className="text-center py-16 border border-dashed border-border/60 rounded-xl p-8 max-w-md mx-auto">
            <Repeat className="size-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-title-sm font-medium mb-1">Create a team first</h3>
            <p className="text-caption text-muted-foreground">
              Cycles are scoped to teams. Set up a team before scheduling cycles.
            </p>
          </div>
        ) : cycles.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border/60 rounded-xl p-8 max-w-md mx-auto">
            <Repeat className="size-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-title-sm font-medium mb-1">No cycles yet</h3>
            <p className="text-caption text-muted-foreground mb-4">
              Start your first cycle to group issues into focused sprints.
            </p>
            <Button
              onClick={() => setCreateOpen(true)}
              size="sm"
              className="gap-1.5"
            >
              <Plus className="size-4" />
              <span>Create Cycle</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {cycles.map((cycle) => (
              <CycleProgressCard
                key={cycle.id}
                workspaceId={workspaceId}
                cycle={cycle}
              />
            ))}
          </div>
        )}
      </div>

      {activeTeamId && (
        <CreateCycleDialog
          workspaceId={workspaceId}
          teamId={activeTeamId}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}
    </div>
  );
}
