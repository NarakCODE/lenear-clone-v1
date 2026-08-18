import type { StorageAdapter } from "../types/storage";

const inMemoryStore = new Map<string, string>();

function hasWorkingStorage(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof localStorage !== "undefined" &&
      typeof localStorage.getItem === "function" &&
      typeof localStorage.setItem === "function"
    );
  } catch {
    return false;
  }
}

/** SSR-safe localStorage with memory fallback. */
export const defaultStorage: StorageAdapter = {
  getItem: (k) => {
    if (!hasWorkingStorage()) return inMemoryStore.get(k) ?? null;
    return localStorage.getItem(k);
  },
  setItem: (k, v) => {
    if (!hasWorkingStorage()) {
      inMemoryStore.set(k, v);
      return;
    }
    localStorage.setItem(k, v);
  },
  removeItem: (k) => {
    if (!hasWorkingStorage()) {
      inMemoryStore.delete(k);
      return;
    }
    localStorage.removeItem(k);
  },
};
