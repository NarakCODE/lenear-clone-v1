import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type {
  CreateTeamRequest,
  UpdateTeamRequest,
  AddTeamMemberRequest,
  UpdateTeamMemberRoleRequest,
} from "../types";
import { teamKeys } from "./queries";

export function useCreateTeam(wsId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeamRequest) => api.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.list(wsId) });
    },
  });
}

export function useUpdateTeam(wsId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamRequest }) =>
      api.updateTeam(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.list(wsId) });
      queryClient.invalidateQueries({
        queryKey: teamKeys.detail(wsId, variables.id),
      });
    },
  });
}

export function useArchiveTeam(wsId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.archiveTeam(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.list(wsId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(wsId, id) });
    },
  });
}

export function useDeleteTeam(wsId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTeam(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.list(wsId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(wsId, id) });
    },
  });
}

export function useAddTeamMember(wsId: string, teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddTeamMemberRequest) => api.addTeamMember(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.members(wsId, teamId),
      });
    },
  });
}

export function useUpdateTeamMemberRole(wsId: string, teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateTeamMemberRoleRequest;
    }) => api.updateTeamMemberRole(teamId, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.members(wsId, teamId),
      });
    },
  });
}

export function useRemoveTeamMember(wsId: string, teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.removeTeamMember(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.members(wsId, teamId),
      });
    },
  });
}
