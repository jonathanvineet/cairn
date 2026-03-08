import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  initializeDAppConnector,
  connectHashPack,
  disconnectHashPack,
  getConnector,
  resetConnector,
  extractAccounts,
  checkPersistedState,
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
  hasManuallyConnected: boolean;
  hasHydrated: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  restoreSession: () => Promise<void>;
  error: string | null;
  isInitializing: boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useWalletStore = create<WalletState>()(persist(
  (set, get) => ({
    connected: false,
    selectedAccount: null,
    accounts: [],
    hasManuallyConnected: false,
    hasHydrated: false,
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
        hasManuallyConnected: true,
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
      // Disconnect from HashPack and clear connector
      await disconnectHashPack();
      resetConnector();

      set({
        connected: false,
        selectedAccount: null,
        accounts: [],
        hasManuallyConnected: false,
        error: null,
        isInitializing: false,
      });

      // Clear localStorage completely
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wallet-storage');
        localStorage.removeItem('wc@2:client:0.3//session');
        localStorage.removeItem('wc@2:core:0.3//messages');
      }

      console.log("✓ Disconnected from wallet and cleared all sessions");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      set({ error: msg });
    }
  },

  restoreSession: async () => {
    if (typeof window === 'undefined') return;
    
    // COMPLETELY DISABLE AUTO-CONNECTION
    // User must manually connect wallet every time
    console.log('ℹ️ Wallet restoreSession called - NO auto-connection');
    set({ 
      hasHydrated: true,
      connected: false,
      selectedAccount: null,
      accounts: [],
      error: null,
    });
  },

  setHasHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),
  }),
  {
    name: 'wallet-storage',
    partialize: (state) => ({
      // DON'T persist anything to prevent auto-connection
      // User must manually connect on every app load
    }),
    onRehydrateStorage: () => (state) => {
      if (state) {
        // Always start disconnected
        state.connected = false;
        state.selectedAccount = null;
        state.accounts = [];
        state.hasManuallyConnected = false;
        state.hasHydrated = true;
        state.error = null;
      }
    },
  }
));
