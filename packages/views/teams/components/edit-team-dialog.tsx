"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Team } from "@multica/core/types";
import { useUpdateTeam } from "@multica/core/teams";
import { Button } from "@multica/ui/components/ui/button";
import { Input } from "@multica/ui/components/ui/input";
import { Switch } from "@multica/ui/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@multica/ui/components/ui/dialog";
import { useT } from "../../i18n";

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

export function EditTeamDialog({
  workspaceId,
  team,
  open,
  onOpenChange,
}: {
  workspaceId: string;
  team: Team | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useT("teams");
  const updateTeam = useUpdateTeam(workspaceId);

  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [cyclesEnabled, setCyclesEnabled] = useState(true);
  const [cycleDurationWeeks, setCycleDurationWeeks] = useState(2);

  useEffect(() => {
    if (team && open) {
      setName(team.name);
      setKey(team.key);
      setDescription(team.description || "");
      setColor(team.color || "#6366f1");
      setCyclesEnabled(team.cycles_enabled ?? true);
      setCycleDurationWeeks(team.cycle_duration_weeks || 2);
    }
  }, [team, open]);

  if (!team) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;

    updateTeam.mutate(
      {
        id: team.id,
        data: {
          name: name.trim(),
          key: key.trim().toUpperCase(),
          description: description.trim() || undefined,
          color: color || undefined,
          cycles_enabled: cyclesEnabled,
          cycle_duration_weeks: cycleDurationWeeks,
        },
      },
      {
        onSuccess: () => {
          toast.success(t(($) => $.page.toast_team_updated));
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : String(err));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t(($) => $.edit_dialog.title)}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <label
                htmlFor="edit-team-name"
                className="text-caption font-medium"
              >
                {t(($) => $.edit_dialog.name_label)}
              </label>
              <Input
                id="edit-team-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <label
                htmlFor="edit-team-key"
                className="text-caption font-medium"
              >
                {t(($) => $.edit_dialog.key_label)}
              </label>
              <Input
                id="edit-team-key"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                maxLength={10}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <label
                htmlFor="edit-team-desc"
                className="text-caption font-medium"
              >
                {t(($) => $.edit_dialog.description_label)}
              </label>
              <Input
                id="edit-team-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-caption font-medium">
                {t(($) => $.edit_dialog.color_label)}
              </label>
              <div className="flex items-center gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
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
                <label className="text-body font-medium">
                  {t(($) => $.edit_dialog.cycles_label)}
                </label>
                <p className="text-caption text-muted-foreground">
                  {t(($) => $.edit_dialog.cycles_hint)}
                </p>
              </div>
              <Switch
                checked={cyclesEnabled}
                onCheckedChange={setCyclesEnabled}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              {t(($) => $.edit_dialog.cancel)}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!name.trim() || !key.trim() || updateTeam.isPending}
            >
              {updateTeam.isPending
                ? t(($) => $.edit_dialog.saving)
                : t(($) => $.edit_dialog.save)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
