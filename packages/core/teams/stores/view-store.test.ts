// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { useTeamsViewStore } from "./view-store";
import { setCurrentWorkspace } from "../../platform/workspace-storage";

const flush = () =>
  new Promise((resolve) => queueMicrotask(() => resolve(null)));

beforeAll(() => {
  if (typeof globalThis.localStorage?.clear !== "function") {
    const values = new Map<string, string>();
    const storage: Storage = {
      get length() {
        return values.size;
      },
      clear: () => values.clear(),
      getItem: (k) => values.get(k) ?? null,
      key: (i) => Array.from(values.keys())[i] ?? null,
      removeItem: (k) => {
        values.delete(k);
      },
      setItem: (k, v) => {
        values.set(k, v);
      },
    };
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: storage,
    });
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: storage,
    });
  }
});

beforeEach(() => {
  localStorage.clear();
  useTeamsViewStore.setState({
    viewMode: "compact",
    sortField: "name",
    sortDirection: "asc",
    hiddenColumns: ["updated"],
    filters: { cycles: [] },
  });
  setCurrentWorkspace(null, null);
});

afterEach(() => {
  setCurrentWorkspace(null, null);
});

describe("useTeamsViewStore", () => {
  it("defaults to 'compact'", () => {
    expect(useTeamsViewStore.getState().viewMode).toBe("compact");
  });

  it("setViewMode mutates the store", () => {
    useTeamsViewStore.getState().setViewMode("comfortable");
    expect(useTeamsViewStore.getState().viewMode).toBe("comfortable");
  });

  it("toggleSort toggles direction or sets new field", () => {
    useTeamsViewStore.getState().toggleSort("name");
    expect(useTeamsViewStore.getState().sortDirection).toBe("desc");

    useTeamsViewStore.getState().toggleSort("issues");
    expect(useTeamsViewStore.getState().sortField).toBe("issues");
    expect(useTeamsViewStore.getState().sortDirection).toBe("desc");
  });

  it("toggleFilter adds and removes filter values", () => {
    useTeamsViewStore.getState().toggleFilter("cycles", "enabled");
    expect(useTeamsViewStore.getState().filters.cycles).toEqual(["enabled"]);

    useTeamsViewStore.getState().toggleFilter("cycles", "enabled");
    expect(useTeamsViewStore.getState().filters.cycles).toEqual([]);
  });

  it("toggleColumn toggles hidden columns", () => {
    useTeamsViewStore.getState().toggleColumn("cycles");
    expect(useTeamsViewStore.getState().hiddenColumns).toContain("cycles");

    useTeamsViewStore.getState().toggleColumn("cycles");
    expect(useTeamsViewStore.getState().hiddenColumns).not.toContain("cycles");
  });

  it("partialize persists view prefs under the workspace-namespaced key", async () => {
    setCurrentWorkspace("acme", "ws_a");
    await flush();
    useTeamsViewStore.getState().setViewMode("comfortable");

    const raw = localStorage.getItem("multica_teams_view:acme");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(Object.keys(parsed.state).sort()).toEqual([
      "filters",
      "hiddenColumns",
      "sortDirection",
      "sortField",
      "viewMode",
    ]);
    expect(parsed.state.viewMode).toBe("comfortable");
  });
});
