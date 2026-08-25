"use client";

import { cn } from "@multica/ui/lib/utils";
import type { Team } from "@multica/core/types";

export function TeamBadge({
  team,
  className,
}: {
  team: Team;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-caption font-medium bg-muted text-foreground",
        className,
      )}
    >
      <span
        className="size-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: team.color || "#6366f1" }}
      />
      <span>{team.name}</span>
      <span className="text-muted-foreground font-mono text-micro">
        {team.key}
      </span>
    </span>
  );
}
