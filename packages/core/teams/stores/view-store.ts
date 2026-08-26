"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createWorkspaceAwareStorage,
  registerForWorkspaceRehydration,
} from "../../platform/workspace-storage";
import { defaultStorage } from "../../platform/storage";

export type TeamViewMode = "compact" | "comfortable";

export type TeamSortField = "name" | "key" | "issues" | "created" | "updated";

export type TeamSortDirection = "asc" | "desc";

export const TEAM_SORT_DEFAULT_DIRECTION: Record<
  TeamSortField,
  TeamSortDirection
> = {
  name: "asc",
  key: "asc",
  issues: "desc",
  created: "desc",
  updated: "desc",
};

export interface TeamListFilters {
  cycles: string[];
}

export const EMPTY_TEAM_FILTERS: TeamListFilters = {
  cycles: [],
};

// User-hideable columns in compact table view. Name is always visible.
export type TeamColumnKey = "key" | "cycles" | "issues" | "created" | "updated";

export const TEAM_DEFAULT_HIDDEN_COLUMNS: TeamColumnKey[] = ["updated"];

export interface TeamsViewState {
  viewMode: TeamViewMode;
  sortField: TeamSortField;
  sortDirection: TeamSortDirection;
  hiddenColumns: TeamColumnKey[];
  filters: TeamListFilters;
  setViewMode: (mode: TeamViewMode) => void;
  toggleSort: (field: TeamSortField) => void;
  setSortField: (field: TeamSortField) => void;
  setSortDirection: (direction: TeamSortDirection) => void;
  toggleColumn: (key: TeamColumnKey) => void;
  toggleFilter: (key: keyof TeamListFilters, value: string) => void;
  clearFilters: () => void;
}

const DEFAULTS = {
  viewMode: "compact" as TeamViewMode,
  sortField: "name" as TeamSortField,
  sortDirection: TEAM_SORT_DEFAULT_DIRECTION.name,
  hiddenColumns: TEAM_DEFAULT_HIDDEN_COLUMNS,
  filters: EMPTY_TEAM_FILTERS,
};

export const useTeamsViewStore = create<TeamsViewState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setViewMode: (mode) => set({ viewMode: mode }),
      toggleSort: (field) =>
        set((state) =>
          state.sortField === field
            ? {
                sortDirection: state.sortDirection === "asc" ? "desc" : "asc",
              }
            : {
                sortField: field,
                sortDirection: TEAM_SORT_DEFAULT_DIRECTION[field],
              },
        ),
      setSortField: (field) =>
        set((state) =>
          state.sortField === field
            ? {}
            : {
                sortField: field,
                sortDirection: TEAM_SORT_DEFAULT_DIRECTION[field],
              },
        ),
      setSortDirection: (direction) => set({ sortDirection: direction }),
      toggleColumn: (key) =>
        set((state) => ({
          hiddenColumns: state.hiddenColumns.includes(key)
            ? state.hiddenColumns.filter((k) => k !== key)
            : [...state.hiddenColumns, key],
        })),
      toggleFilter: (key, value) =>
        set((state) => {
          const list = state.filters[key];
          const next = list.includes(value)
            ? list.filter((v) => v !== value)
            : [...list, value];
          return { filters: { ...state.filters, [key]: next } };
        }),
      clearFilters: () => set({ filters: EMPTY_TEAM_FILTERS }),
    }),
    {
      name: "multica_teams_view",
      storage: createJSONStorage(() =>
        createWorkspaceAwareStorage(defaultStorage),
      ),
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortField: state.sortField,
        sortDirection: state.sortDirection,
        hiddenColumns: state.hiddenColumns,
        filters: state.filters,
      }),
      merge: (persisted, current) => {
        if (!persisted) return { ...current, ...DEFAULTS };
        const p = persisted as Partial<TeamsViewState>;
        return {
          ...current,
          ...p,
          filters: { ...EMPTY_TEAM_FILTERS, ...(p.filters ?? {}) },
        };
      },
    },
  ),
);

registerForWorkspaceRehydration(() => useTeamsViewStore.persist.rehydrate());
