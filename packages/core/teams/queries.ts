import { queryOptions } from "@tanstack/react-query";
import { api } from "../api";

export const teamKeys = {
  all: (wsId: string) => ["teams", wsId] as const,
  list: (wsId: string) => [...teamKeys.all(wsId), "list"] as const,
  detail: (wsId: string, id: string) =>
    [...teamKeys.all(wsId), "detail", id] as const,
  members: (wsId: string, teamId: string) =>
    [...teamKeys.all(wsId), "members", teamId] as const,
};

export function teamListOptions(wsId: string) {
  return queryOptions({
    queryKey: teamKeys.list(wsId),
    queryFn: () => api.listTeams(),
  });
}

export function teamDetailOptions(wsId: string, id: string) {
  return queryOptions({
    queryKey: teamKeys.detail(wsId, id),
    queryFn: () => api.getTeam(id),
    enabled: Boolean(id),
  });
}

export function teamMembersOptions(wsId: string, teamId: string) {
  return queryOptions({
    queryKey: teamKeys.members(wsId, teamId),
    queryFn: () => api.listTeamMembers(teamId),
    enabled: Boolean(teamId),
  });
}
