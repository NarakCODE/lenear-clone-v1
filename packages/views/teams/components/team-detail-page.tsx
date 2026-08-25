"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  teamDetailOptions,
  teamMembersOptions,
  useAddTeamMember,
  useRemoveTeamMember,
  useUpdateTeam,
} from "@multica/core/teams";
import { cycleListOptions, currentCycleOptions } from "@multica/core/cycles";
import { useWorkspaceId } from "@multica/core/hooks";
import { useWorkspacePaths } from "@multica/core/paths";
import { Button } from "@multica/ui/components/ui/button";
import { Input } from "@multica/ui/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@multica/ui/components/ui/tabs";
import { AppLink } from "../../navigation/app-link";
import { Repeat, Trash2 } from "lucide-react";

export function TeamDetailPage({
  workspaceId: propWsId,
  teamId,
}: {
  workspaceId?: string;
  workspaceSlug?: string;
  teamId: string;
}) {
  const contextWsId = useWorkspaceId();
  const paths = useWorkspacePaths();
  const workspaceId = propWsId || contextWsId;
  const { data: team, isLoading: teamLoading } = useQuery(
    teamDetailOptions(workspaceId, teamId),
  );
  const { data: members = [] } = useQuery(
    teamMembersOptions(workspaceId, teamId),
  );
  const { data: cycles = [] } = useQuery(
    cycleListOptions(workspaceId, teamId),
  );
  const { data: currentCycle } = useQuery(
    currentCycleOptions(workspaceId, teamId),
  );

  const [activeTab, setActiveTab] = useState("overview");
  const [newUserId, setNewUserId] = useState("");

  const addMember = useAddTeamMember(workspaceId, teamId);
  const removeMember = useRemoveTeamMember(workspaceId, teamId);
  const updateTeam = useUpdateTeam(workspaceId);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim()) return;
    addMember.mutate(
      { user_id: newUserId.trim() },
      { onSuccess: () => setNewUserId("") },
    );
  };

  if (teamLoading) {
    return (
      <div className="flex-1 p-8 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-4" />
        <div className="h-4 w-96 bg-muted rounded" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex-1 p-8 text-center py-16">
        <h2 className="text-title-sm font-semibold mb-2">Team not found</h2>
        <AppLink
          href={paths.teams()}
          className="text-primary hover:underline text-body"
        >
          Back to Teams
        </AppLink>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      {/* Header */}
      <div className="border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="size-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: team.color || "#6366f1" }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-title font-semibold tracking-tight">
                {team.name}
              </h1>
              <span className="font-mono text-caption px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {team.key}
              </span>
            </div>
            {team.description && (
              <p className="text-caption text-muted-foreground mt-0.5">
                {team.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="border-b border-border/40 px-6 pt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cycles">Cycles ({cycles.length})</TabsTrigger>
              <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && (
            <div className="space-y-6 max-w-4xl">
              {/* Current Cycle Banner */}
              <div className="rounded-lg border border-border/60 bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Repeat className="size-4 text-primary" />
                    <h3 className="font-medium text-body">Active Cycle</h3>
                  </div>
                  {currentCycle && (
                    <span className="text-caption font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
                      Cycle {currentCycle.number}
                    </span>
                  )}
                </div>
                {currentCycle ? (
                  <div>
                    <h4 className="font-semibold text-title-sm mb-1">
                      {currentCycle.name || `Cycle ${currentCycle.number}`}
                    </h4>
                    <p className="text-caption text-muted-foreground mb-4">
                      {new Date(currentCycle.start_date).toLocaleDateString()} –{" "}
                      {new Date(currentCycle.end_date).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-6 text-caption text-muted-foreground pt-3 border-t border-border/40">
                      <span>
                        <strong className="text-foreground font-semibold">
                          {currentCycle.total_issues ?? 0}
                        </strong>{" "}
                        issues
                      </span>
                      <span>
                        <strong className="text-foreground font-semibold">
                          {currentCycle.completed_issues ?? 0}
                        </strong>{" "}
                        completed
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-caption text-muted-foreground">
                    No active cycle running for this team.
                  </p>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-lg border border-border/50 bg-card p-4">
                  <div className="text-caption text-muted-foreground mb-1">Total Issues</div>
                  <div className="text-display-sm font-bold">{team.issue_counter}</div>
                </div>
                <div className="rounded-lg border border-border/50 bg-card p-4">
                  <div className="text-caption text-muted-foreground mb-1">Team Members</div>
                  <div className="text-display-sm font-bold">{members.length}</div>
                </div>
                <div className="rounded-lg border border-border/50 bg-card p-4">
                  <div className="text-caption text-muted-foreground mb-1">Cycles Completed</div>
                  <div className="text-display-sm font-bold">
                    {cycles.filter((c) => c.status === "previous").length}
                  </div>
                </div>
                <div className="rounded-lg border border-border/50 bg-card p-4">
                  <div className="text-caption text-muted-foreground mb-1">Cycle Duration</div>
                  <div className="text-display-sm font-bold">
                    {team.cycle_duration_weeks}w
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "cycles" && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between">
                <h3 className="text-body font-medium">Team Cycles</h3>
              </div>
              {cycles.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border/60 rounded-lg p-6">
                  <Repeat className="size-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-caption text-muted-foreground">No cycles configured yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cycles.map((cycle) => (
                    <div
                      key={cycle.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card hover:border-border transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-body">
                            {cycle.name || `Cycle ${cycle.number}`}
                          </span>
                          <span
                            className={`text-micro uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                              cycle.status === "current"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : cycle.status === "upcoming"
                                  ? "bg-blue-500/10 text-blue-500"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {cycle.status}
                          </span>
                        </div>
                        <p className="text-caption text-muted-foreground mt-0.5">
                          {new Date(cycle.start_date).toLocaleDateString()} –{" "}
                          {new Date(cycle.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-6 max-w-2xl">
              <form onSubmit={handleAddMember} className="flex gap-2">
                <Input
                  placeholder="User ID to add to team"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={!newUserId.trim() || addMember.isPending}>
                  {addMember.isPending ? "Adding..." : "Add Member"}
                </Button>
              </form>

              <div className="space-y-2">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card"
                  >
                    <div>
                      <div className="font-medium text-body">{m.user_name}</div>
                      <div className="text-caption text-muted-foreground">{m.user_email}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-caption capitalize px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {m.role}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeMember.mutate(m.user_id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6 max-w-xl">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-caption font-medium">Team Name</label>
                  <Input
                    defaultValue={team.name}
                    onBlur={(e) => {
                      if (e.target.value !== team.name) {
                        updateTeam.mutate({ id: team.id, data: { name: e.target.value } });
                      }
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-caption font-medium">Identifier Key</label>
                  <Input
                    defaultValue={team.key}
                    onBlur={(e) => {
                      if (e.target.value !== team.key) {
                        updateTeam.mutate({ id: team.id, data: { key: e.target.value.toUpperCase() } });
                      }
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-caption font-medium">Description</label>
                  <Input
                    defaultValue={team.description}
                    onBlur={(e) => {
                      if (e.target.value !== team.description) {
                        updateTeam.mutate({ id: team.id, data: { description: e.target.value } });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
