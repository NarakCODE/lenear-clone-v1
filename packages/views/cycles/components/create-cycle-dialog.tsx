"use client";

import { useState } from "react";
import { useCreateCycle } from "@multica/core/cycles";
import { Button } from "@multica/ui/components/ui/button";
import { Input } from "@multica/ui/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@multica/ui/components/ui/dialog";
import { useT } from "../../i18n";

export function CreateCycleDialog({
  workspaceId,
  teamId,
  open,
  onOpenChange,
  onSuccess,
}: {
  workspaceId: string;
  teamId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const { t } = useT("common");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]!,
  );
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0]!;
  });

  const createCycle = useCreateCycle(workspaceId, teamId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    createCycle.mutate(
      {
        name: name.trim() || undefined,
        description: description.trim() || undefined,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
      },
      {
        onSuccess: () => {
          setName("");
          setDescription("");
          onOpenChange(false);
          onSuccess?.();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t(($) => $.cycles.new_dialog)}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="cycle-name" className="text-caption font-medium">
                {t(($) => $.cycles.name_label)}
              </label>
              <Input
                id="cycle-name"
                placeholder={t(($) => $.cycles.name_placeholder)}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="cycle-desc" className="text-caption font-medium">
                {t(($) => $.cycles.description_label)}
              </label>
              <Input
                id="cycle-desc"
                placeholder={t(($) => $.cycles.description_placeholder)}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="start-date" className="text-caption font-medium">
                  {t(($) => $.cycles.start_date)}
                </label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="end-date" className="text-caption font-medium">
                  {t(($) => $.cycles.end_date)}
                </label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t(($) => $.cycles.cancel)}
            </Button>
            <Button type="submit" disabled={createCycle.isPending}>
              {createCycle.isPending
                ? t(($) => $.cycles.creating)
                : t(($) => $.cycles.create)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
