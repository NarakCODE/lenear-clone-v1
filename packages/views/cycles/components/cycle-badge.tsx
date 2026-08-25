"use client";

import { Repeat } from "lucide-react";
import { cn } from "@multica/ui/lib/utils";
import type { Cycle } from "@multica/core/types";

export function CycleBadge({
  cycle,
  className,
}: {
  cycle: Cycle;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-caption font-medium bg-muted text-foreground",
        className,
      )}
    >
      <Repeat className="size-3 text-muted-foreground" />
      <span>{cycle.name || `Cycle ${cycle.number}`}</span>
    </span>
  );
}
