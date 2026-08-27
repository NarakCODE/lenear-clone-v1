"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, Search, Eye, Lock, Globe, Trash2 } from "lucide-react";
import { issueViewListOptions, useDeleteIssueView } from "@multica/core/issue-views";
import { useWorkspaceId } from "@multica/core/hooks";
import { useWorkspacePaths } from "@multica/core/paths";
import { Button } from "@multica/ui/components/ui/button";
import { Input } from "@multica/ui/components/ui/input";
import { useT } from "../../i18n";
import { AppLink } from "../../navigation/app-link";

export function ViewsPage({
  workspaceId: propWsId,
}: {
  workspaceId?: string;
  workspaceSlug?: string;
} = {}) {
  const contextWsId = useWorkspaceId();
  const paths = useWorkspacePaths();
  const { t } = useT("common");
  const workspaceId = propWsId || contextWsId;

  const [search, setSearch] = useState("");
  const deleteView = useDeleteIssueView(workspaceId);

  const { data: views = [], isLoading } = useQuery(
    issueViewListOptions(workspaceId, { scope_type: "workspace" }),
  );

  const filteredViews = views.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <div className="border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-title font-semibold tracking-tight">
            {t(($) => $.issue_views.title)}
          </h1>
          <p className="text-body text-muted-foreground">
            {t(($) => $.issue_views.description)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder={t(($) => $.issue_views.filter_placeholder)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-caption h-8"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-lg border border-border/50 bg-card p-5 animate-pulse"
              />
            ))}
          </div>
        ) : filteredViews.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border/60 rounded-xl p-8 max-w-md mx-auto">
            <LayoutGrid className="size-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-title-sm font-medium mb-1">
              {search
                ? t(($) => $.issue_views.no_matches)
                : t(($) => $.issue_views.empty)}
            </h3>
            <p className="text-caption text-muted-foreground mb-4">
              {search
                ? t(($) => $.issue_views.try_different)
                : t(($) => $.issue_views.save_hint)}
            </p>
            <AppLink href={paths.issues()}>
              <Button size="sm" className="gap-1.5">
                <Eye className="size-4" />
                <span>{t(($) => $.issue_views.go_to_issues)}</span>
              </Button>
            </AppLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredViews.map((v) => (
              <div
                key={v.id}
                className="group flex flex-col justify-between rounded-lg border border-border/60 bg-card p-5 hover:border-border hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <AppLink
                      href={`${paths.issues()}?view=${v.id}`}
                      className="font-semibold text-body hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <LayoutGrid className="size-4 text-primary" />
                      <span>{v.name}</span>
                    </AppLink>
                    <span className="flex items-center gap-1 text-micro text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {v.visibility === "workspace" ? (
                        <>
                          <Globe className="size-3" />
                          {t(($) => $.issue_views.workspace)}
                        </>
                      ) : (
                        <>
                          <Lock className="size-3" />
                          {t(($) => $.issue_views.private)}
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-caption text-muted-foreground">
                    {t(($) => $.issue_views.created, {
                      date: new Date(v.created_at).toLocaleDateString(),
                    })}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                  <AppLink
                    href={`${paths.issues()}?view=${v.id}`}
                    className="text-caption text-primary hover:underline font-medium"
                  >
                    {t(($) => $.issue_views.open)}
                  </AppLink>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => deleteView.mutate(v.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
