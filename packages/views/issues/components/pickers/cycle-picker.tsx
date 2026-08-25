"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Repeat } from "lucide-react";
import { cycleListOptions } from "@multica/core/cycles";
import type { UpdateIssueRequest } from "@multica/core/types";
import { PropertyPicker, PickerItem } from "./property-picker";

export function CyclePicker({
  workspaceId,
  teamId,
  cycleId,
  onUpdate,
  trigger: customTrigger,
  triggerRender,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  align,
}: {
  workspaceId: string;
  teamId: string | null | undefined;
  cycleId: string | null | undefined;
  onUpdate: (updates: Partial<UpdateIssueRequest>) => void;
  trigger?: React.ReactNode;
  triggerRender?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  align?: "start" | "center" | "end";
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  const { data: cycles = [] } = useQuery(
    cycleListOptions(workspaceId, teamId || ""),
  );

  const selectedCycle = cycles.find((c) => c.id === cycleId);

  return (
    <PropertyPicker
      open={open}
      onOpenChange={setOpen}
      width="w-52"
      align={align}
      triggerRender={triggerRender}
      trigger={
        customTrigger ??
        (selectedCycle != null ? (
          <>
            <Repeat className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {selectedCycle.name || `Cycle ${selectedCycle.number}`}
            </span>
          </>
        ) : (
          <>
            <Repeat className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">No cycle</span>
          </>
        ))
      }
    >
      <PickerItem
        selected={!cycleId}
        onClick={() => {
          onUpdate({ cycle_id: null });
          setOpen(false);
        }}
      >
        <span className="text-muted-foreground">No cycle</span>
      </PickerItem>
      {cycles.map((c) => (
        <PickerItem
          key={c.id}
          selected={c.id === cycleId}
          onClick={() => {
            onUpdate({ cycle_id: c.id });
            setOpen(false);
          }}
        >
          <Repeat className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{c.name || `Cycle ${c.number}`}</span>
          <span className="ml-auto text-micro uppercase text-muted-foreground font-mono">
            {c.status}
          </span>
        </PickerItem>
      ))}
    </PropertyPicker>
  );
}
