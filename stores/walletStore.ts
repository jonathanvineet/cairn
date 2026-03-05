import { create } from "zustand";
import {
  initializeDAppConnector,
  connectHashPack,
  disconnectHashPack,
  getConnector,
  resetConnector,
  extractAccounts,
  type AccountInfo,
} from "@/lib/hedera-connector";

interface Account {
  id: string; // Hedera Account ID
  network: string;
  chainId: string;
}

interface WalletState {
  connected: boolean;
  selectedAccount: Account | null;
  accounts: Account[];
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
  isInitializing: boolean;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  connected: false,
  selectedAccount: null,
  accounts: [],
  error: null,
  isInitializing: false,

  connect: async () => {
    if (typeof window === 'undefined') {
      set({ error: 'Wallet connection only available on client side' });
      return;
    }

    try {
      set({ error: null, isInitializing: true });

      // HashPack connection
      console.log('🔵 [1/2] Initializing DAppConnector (HashPack)...');
      await initializeDAppConnector();

      console.log('🔵 [2/2] Opening HashPack connection modal...');
      const session = await connectHashPack();

      const accounts = extractAccounts(session);

      if (accounts.length === 0) {
        throw new Error('No Hedera accounts found in approved session.');
      }

      set({
        connected: true,
        selectedAccount: accounts[0],
        accounts,
        isInitializing: false,
        error: null,
      });

      console.log('✅ Connected to HashPack:', accounts[0].id);

    } catch (error: any) {
      console.error('🔴 Connection error:', error);

      let errorMessage = error.message || "Failed to connect wallet";
      if (errorMessage.includes("User rejected")) {
        errorMessage = "Connection cancelled by user.";
      }

      resetConnector();

      set({
        connected: false,
        selectedAccount: null,
        accounts: [],
        error: errorMessage,
        isInitializing: false,
      });
      throw error;
    }
  },

  disconnect: async () => {
    if (typeof window === 'undefined') return;

    try {
      await disconnectHashPack();

      set({
        connected: false,
        selectedAccount: null,
        accounts: [],
        error: null,
      });

      console.log("✓ Disconnected from wallet");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      set({ error: msg });
    }
  },
}));
