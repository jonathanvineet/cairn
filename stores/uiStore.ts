// 🔒 UI STATE ONLY — Which 3D panel is open, voice input state
import { create } from "zustand";

export type ActivePanel = "none" | "breach-form" | "payment-scanner" | "registration-complete";

interface VoiceState {
  isListening: boolean;
  interimText: string;
  finalText: string;
  volume: number;
}

interface UIState {
  activePanel: ActivePanel;
  voiceInput: VoiceState;
  breachCount: number;
  
  // Actions
  setActivePanel: (panel: ActivePanel) => void;
  startVoiceInput: () => void;
  stopVoiceInput: () => void;
  updateVoiceInterim: (text: string) => void;
  updateVoiceFinal: (text: string) => void;
  setVoiceVolume: (volume: number) => void;
  incrementBreachCount: () => void;
  resetBreachCount: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activePanel: "none",
  voiceInput: {
    isListening: false,
    interimText: "",
    finalText: "",
    volume: 0,
  },
  breachCount: 0,
  
  setActivePanel: (panel) => set({ activePanel: panel }),
  
  startVoiceInput: () =>
    set((state) => ({
      voiceInput: { ...state.voiceInput, isListening: true, interimText: "", finalText: "" },
    })),
    
  stopVoiceInput: () =>
    set((state) => ({
      voiceInput: { ...state.voiceInput, isListening: false },
    })),
    
  updateVoiceInterim: (text) =>
    set((state) => ({
      voiceInput: { ...state.voiceInput, interimText: text },
    })),
    
  updateVoiceFinal: (text) =>
    set((state) => ({
      voiceInput: { ...state.voiceInput, finalText: text, interimText: "" },
    })),
    
  setVoiceVolume: (volume) =>
    set((state) => ({
      voiceInput: { ...state.voiceInput, volume },
    })),
    
  incrementBreachCount: () =>
    set((state) => ({ breachCount: state.breachCount + 1 })),
    
  resetBreachCount: () => set({ breachCount: 0 }),
}));
