"use client";

import { useState } from "react";
import { useCreateTeam } from "@multica/core/teams";
import { Button } from "@multica/ui/components/ui/button";
import { Input } from "@multica/ui/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@multica/ui/components/ui/dialog";

export function CreateTeamDialog({
  workspaceId,
  open,
  onOpenChange,
  onSuccess,
}: {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (teamId: string) => void;
}) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");

  const createTeam = useCreateTeam(workspaceId);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!key || key.length <= 3) {
      const generatedKey = val
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 4);
      setKey(generatedKey);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;

    createTeam.mutate(
      {
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim() || undefined,
        color: color || undefined,
      },
      {
        onSuccess: (team) => {
          setName("");
          setKey("");
          setDescription("");
          onOpenChange(false);
          onSuccess?.(team.id);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="team-name" className="text-caption font-medium">
                Team Name
              </label>
              <Input
                id="team-name"
                placeholder="e.g. Engineering, Product, Design"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="team-key" className="text-caption font-medium">
                Identifier Key (for issues e.g. ENG-1)
              </label>
              <Input
                id="team-key"
                placeholder="e.g. ENG, PROD, DES"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                maxLength={10}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="team-desc" className="text-caption font-medium">
                Description (optional)
              </label>
              <Input
                id="team-desc"
                placeholder="What this team works on"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-caption font-medium">Color</label>
              <div className="flex items-center gap-2">
                {[
                  "#6366f1",
                  "#3b82f6",
                  "#06b6d4",
                  "#10b981",
                  "#f59e0b",
                  "#ef4444",
                  "#ec4899",
                  "#8b5cf6",
                ].map((c) => (
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
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !key.trim() || createTeam.isPending}
            >
              {createTeam.isPending ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
