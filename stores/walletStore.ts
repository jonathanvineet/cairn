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
      await disconnectHashPack();

      set({
        connected: false,
        selectedAccount: null,
        accounts: [],
        hasManuallyConnected: false,
        error: null,
      });

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wallet-storage');
      }

      console.log("✓ Disconnected from wallet");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      set({ error: msg });
    }
  },

  restoreSession: async () => {
    if (typeof window === 'undefined') return;
    
    const state = get();
    
    // Only restore if user has manually connected before
    if (!state.hasManuallyConnected) {
      console.log('ℹ️ No previous manual connection, skipping auto-restore');
      set({ hasHydrated: true });
      return;
    }
    
    if (state.connected) {
      console.log('ℹ️ Already connected, skipping restore');
      set({ hasHydrated: true });
      return;
    }

    try {
      console.log('🔄 Checking for persisted wallet session...');
      set({ isInitializing: true });

      const session = await checkPersistedState();
      
      if (session) {
        const accounts = extractAccounts(session);
        
        if (accounts.length > 0) {
          set({
            connected: true,
            selectedAccount: accounts[0],
            accounts,
            isInitializing: false,
            hasHydrated: true,
            error: null,
          });
          
          console.log('✅ Wallet session restored:', accounts[0].id);
          return;
        }
      }
      
      set({ isInitializing: false, hasHydrated: true });
      console.log('ℹ️ No wallet session to restore');
    } catch (error) {
      console.error('❌ Failed to restore session:', error);
      set({ 
        isInitializing: false,
        hasHydrated: true,
        connected: false,
        selectedAccount: null,
        accounts: [],
      });
    }
  },

  setHasHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),
  }),
  {
    name: 'wallet-storage',
    partialize: (state) => ({
      // Don't persist 'connected' - only persist the flag and account info
      // connected: state.connected,  // REMOVED
      selectedAccount: state.selectedAccount,
      accounts: state.accounts,
      hasManuallyConnected: state.hasManuallyConnected,
    }),
    onRehydrateStorage: () => (state) => {
      if (state) {
        // Always start with connected: false on page load
        // restoreSession() will set it to true if session is valid
        state.connected = false;
        state.hasHydrated = true;
      }
    },
  }
));
