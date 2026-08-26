"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { Team } from "@multica/core/types";
import { useDeleteTeam } from "@multica/core/teams";
import { Button } from "@multica/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@multica/ui/components/ui/dialog";
import { useT } from "../../i18n";

export function TeamBatchToolbar({
  rows,
  workspaceId,
  canDelete,
  onClear,
}: {
  rows: Team[];
  workspaceId: string;
  canDelete: boolean;
  onClear: () => void;
}) {
  const { t } = useT("teams");
  const deleteTeam = useDeleteTeam(workspaceId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (rows.length === 0) return null;

  const handleDeleteBatch = () => {
    for (const team of rows) {
      deleteTeam.mutate(team.id);
    }
    toast.success(t(($) => $.page.toast_team_deleted));
    setConfirmDelete(false);
    onClear();
  };

  return (
    <>
      <div className="absolute bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-lg border bg-background px-2 py-1.5 shadow-lg max-md:above-chat-launcher">
        <div className="mr-1 flex items-center gap-1.5 border-r pl-1 pr-2">
          <span className="text-body font-medium">
            {t(($) => $.page.selected, { count: rows.length })}
          </span>
          <button
            type="button"
            aria-label={t(($) => $.page.clear_selection)}
            onClick={onClear}
            className="rounded p-0.5 transition-colors hover:bg-accent"
          >
            <X className="size-3.5 text-muted-foreground" />
          </button>
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="mr-1 size-3.5" />
            {t(($) => $.page.delete)}
          </Button>
        )}
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t(($) => $.delete_dialog.batch_title, { count: rows.length })}
            </DialogTitle>
            <DialogDescription>
              {t(($) => $.delete_dialog.batch_description)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmDelete(false)}
            >
              {t(($) => $.delete_dialog.cancel)}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteBatch}
            >
              {t(($) => $.delete_dialog.confirm)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
