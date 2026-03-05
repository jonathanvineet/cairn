// 🔒 VISUAL STATE ONLY — Never touch existing walletStore or missionStore
import { create } from "zustand";

interface CameraState {
  position: [number, number, number];
  rotation: [number, number, number];
  velocity: number;
  altitude: number;
  heading: number;
}

interface WorldState {
  // Camera state
  camera: CameraState;
  scrollSpeed: number;
  thermalMode: boolean;
  
  // Actions
  updateCamera: (updates: Partial<CameraState>) => void;
  setScrollSpeed: (speed: number) => void;
  toggleThermal: () => void;
  setThermalMode: (enabled: boolean) => void;
}

export const useWorldStore = create<WorldState>((set) => ({
  camera: {
    position: [0, 85, 0],
    rotation: [0, 0, 0],
    velocity: 0,
    altitude: 22,
    heading: 0,
  },
  scrollSpeed: 0,
  thermalMode: false,
  
  updateCamera: (updates) =>
    set((state) => ({
      camera: { ...state.camera, ...updates },
    })),
    
  setScrollSpeed: (speed) => set({ scrollSpeed: speed }),
  
  toggleThermal: () =>
    set((state) => ({ thermalMode: !state.thermalMode })),
    
  setThermalMode: (enabled) => set({ thermalMode: enabled }),
}));
