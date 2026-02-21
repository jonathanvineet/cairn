import { create } from "zustand";

interface WalletState {
  connected: boolean;
  address: string | null;
  connect: () => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  connected: false,
  address: null,
  connect: () =>
    set({
      connected: true,
      address: "0x123a...f9e2",
    }),
  disconnect: () =>
    set({
      connected: false,
      address: null,
    }),
}));
