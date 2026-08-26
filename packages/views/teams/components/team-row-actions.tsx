"use client";

import { useState } from "react";
import {
  Copy,
  ExternalLink,
  Link,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { Team } from "@multica/core/types";
import { useDeleteTeam } from "@multica/core/teams";
import { useWorkspacePaths } from "@multica/core/paths";
import { Button } from "@multica/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@multica/ui/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@multica/ui/components/ui/dropdown-menu";
import { useIntentNavigate } from "../../navigation";
import { useT } from "../../i18n";
import { EditTeamDialog } from "./edit-team-dialog";

export function TeamRowActions({
  team,
  workspaceId,
  canDelete,
}: {
  team: Team;
  workspaceId: string;
  canDelete: boolean;
}) {
  const { t } = useT("teams");
  const { t: tCommon } = useT("common");
  const wsPaths = useWorkspacePaths();
  const intentNavigate = useIntentNavigate();
  const deleteTeam = useDeleteTeam(workspaceId);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(team.key);
    toast.success(t(($) => $.page.toast_key_copied));
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${wsPaths.teamDetail(team.id)}`;
    navigator.clipboard.writeText(url);
    toast.success(t(($) => $.page.toast_link_copied));
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label={t(($) => $.page.row_menu)}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground group-hover/row:opacity-100 data-popup-open:bg-accent data-popup-open:opacity-100 data-popup-open:text-accent-foreground"
            >
              <MoreHorizontal className="size-4" />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() =>
              intentNavigate(
                wsPaths.teamDetail(team.id),
                "foreground-tab",
                team.name,
              )
            }
          >
            <ExternalLink className="size-3.5" />
            {tCommon(($) => $.navigation.open_in_new_tab)}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyKey}>
            <Copy className="size-3.5" />
            {t(($) => $.page.copy_key)}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink}>
            <Link className="size-3.5" />
            {t(($) => $.page.copy_link)}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="size-3.5" />
            {t(($) => $.page.edit)}
          </DropdownMenuItem>
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-3.5" />
                {t(($) => $.page.delete)}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditTeamDialog
        workspaceId={workspaceId}
        team={team}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t(($) => $.delete_dialog.title)}</DialogTitle>
            <DialogDescription>
              {t(($) => $.delete_dialog.description)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(false)}
            >
              {t(($) => $.delete_dialog.cancel)}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleteTeam.isPending}
              onClick={() => {
                deleteTeam.mutate(team.id, {
                  onSuccess: () => {
                    toast.success(t(($) => $.page.toast_team_deleted));
                    setDeleteOpen(false);
                  },
                  onError: (err) => {
                    toast.error(
                      err instanceof Error ? err.message : String(err),
                    );
                  },
                });
              }}
            >
              {t(($) => $.delete_dialog.confirm)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
