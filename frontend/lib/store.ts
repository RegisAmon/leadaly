import { create } from "zustand";
import type { Workspace, User } from "./types";

interface AppState {
  workspace: Workspace | null;
  user: User | null;
  setWorkspace: (ws: Workspace) => void;
  setUser: (u: User) => void;
}

export const useAppStore = create<AppState>((set) => ({
  workspace: null,
  user: null,
  setWorkspace: (ws) => set({ workspace: ws }),
  setUser: (u) => set({ user: u }),
}));
