import { create } from "zustand";

export type MissionStatus = "active" | "paused" | "completed" | "aborted";

interface MissionState {
  status: MissionStatus;
  completedCheckpoints: number;
  totalCheckpoints: number;
  etaMinutes: number;
  dronePosition: { x: number; y: number };
  pause: () => void;
  resume: () => void;
  abort: () => void;
  tick: () => void;
}

export const useMissionStore = create<MissionState>((set) => ({
  status: "active",
  completedCheckpoints: 7,
  totalCheckpoints: 12,
  etaMinutes: 3,
  dronePosition: { x: 62, y: 38 },
  pause: () => set({ status: "paused" }),
  resume: () => set({ status: "active" }),
  abort: () => set({ status: "aborted" }),
  tick: () =>
    set((s) => {
      if (s.status !== "active") return s;
      const newCompleted = Math.min(s.completedCheckpoints + 1, s.totalCheckpoints);
      return {
        completedCheckpoints: newCompleted,
        etaMinutes: Math.max(0, s.etaMinutes - 1),
        dronePosition: {
          x: s.dronePosition.x + (Math.random() - 0.4) * 8,
          y: s.dronePosition.y + (Math.random() - 0.5) * 6,
        },
        status: newCompleted >= s.totalCheckpoints ? "completed" : "active",
      };
    }),
}));
