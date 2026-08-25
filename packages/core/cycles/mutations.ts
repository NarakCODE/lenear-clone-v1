import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { CreateCycleRequest, UpdateCycleRequest } from "../types";
import { cycleKeys } from "./queries";

export function useCreateCycle(wsId: string, teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCycleRequest) => api.createCycle(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cycleKeys.list(wsId, teamId),
      });
      queryClient.invalidateQueries({
        queryKey: cycleKeys.current(wsId, teamId),
      });
    },
  });
}

export function useUpdateCycle(wsId: string, teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCycleRequest }) =>
      api.updateCycle(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: cycleKeys.list(wsId, teamId),
      });
      queryClient.invalidateQueries({
        queryKey: cycleKeys.current(wsId, teamId),
      });
      queryClient.invalidateQueries({
        queryKey: cycleKeys.detail(wsId, variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: cycleKeys.progress(wsId, variables.id),
      });
    },
  });
}

export function useDeleteCycle(wsId: string, teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCycle(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: cycleKeys.list(wsId, teamId),
      });
      queryClient.invalidateQueries({
        queryKey: cycleKeys.current(wsId, teamId),
      });
      queryClient.invalidateQueries({ queryKey: cycleKeys.detail(wsId, id) });
    },
  });
}
