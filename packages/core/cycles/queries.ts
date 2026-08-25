import { queryOptions } from "@tanstack/react-query";
import { api } from "../api";

export const cycleKeys = {
  all: (wsId: string) => ["cycles", wsId] as const,
  list: (wsId: string, teamId: string) =>
    [...cycleKeys.all(wsId), "list", teamId] as const,
  current: (wsId: string, teamId: string) =>
    [...cycleKeys.all(wsId), "current", teamId] as const,
  detail: (wsId: string, id: string) =>
    [...cycleKeys.all(wsId), "detail", id] as const,
  progress: (wsId: string, id: string) =>
    [...cycleKeys.all(wsId), "progress", id] as const,
};

export function cycleListOptions(wsId: string, teamId: string) {
  return queryOptions({
    queryKey: cycleKeys.list(wsId, teamId),
    queryFn: () => api.listCycles(teamId),
    enabled: Boolean(teamId),
  });
}

export function currentCycleOptions(wsId: string, teamId: string) {
  return queryOptions({
    queryKey: cycleKeys.current(wsId, teamId),
    queryFn: () => api.getCurrentCycle(teamId),
    enabled: Boolean(teamId),
  });
}

export function cycleDetailOptions(wsId: string, id: string) {
  return queryOptions({
    queryKey: cycleKeys.detail(wsId, id),
    queryFn: () => api.getCycle(id),
    enabled: Boolean(id),
  });
}

export function cycleProgressOptions(wsId: string, id: string) {
  return queryOptions({
    queryKey: cycleKeys.progress(wsId, id),
    queryFn: () => api.getCycleProgress(id),
    enabled: Boolean(id),
  });
}
