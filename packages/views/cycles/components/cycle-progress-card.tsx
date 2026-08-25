"use client";

import { useQuery } from "@tanstack/react-query";
import { cycleProgressOptions } from "@multica/core/cycles";
import type { Cycle } from "@multica/core/types";

export function CycleProgressCard({
  workspaceId,
  cycle,
}: {
  workspaceId: string;
  cycle: Cycle;
}) {
  const { data: progress } = useQuery(
    cycleProgressOptions(workspaceId, cycle.id),
  );

  const total = progress?.total_issues ?? cycle.total_issues ?? 0;
  const completed = progress?.completed_issues ?? cycle.completed_issues ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-lg border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-body">
          {cycle.name || `Cycle ${cycle.number}`}
        </h4>
        <span className="text-caption font-mono text-muted-foreground">{pct}%</span>
      </div>

      <div className="w-full bg-muted rounded-full h-2 mb-3 overflow-hidden">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-caption text-muted-foreground">
        <span>
          {completed} of {total} issues completed
        </span>
        <span>
          {new Date(cycle.start_date).toLocaleDateString()} –{" "}
          {new Date(cycle.end_date).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
