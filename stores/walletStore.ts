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
      console.error('🔴 Error type:', typeof error);
      console.error('🔴 Error object:', error);

      // Handle empty or invalid error objects
      let errorMessage = 'Failed to connect wallet';
      
      if (!error) {
        errorMessage = 'Connection failed with no error details. Please try again.';
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'object') {
        try {
          const errorStr = JSON.stringify(error);
          if (errorStr && errorStr !== '{}') {
            errorMessage = `Connection failed: ${errorStr}`;
          } else {
            errorMessage = 'Connection failed with empty error. Check console logs.';
          }
        } catch (e) {
          errorMessage = 'Connection failed. Unable to parse error details.';
        }
      }
      
      // Additional error type checks
      if (errorMessage.includes("User rejected")) {
        errorMessage = "❌ Connection cancelled by user";
      } else if (errorMessage.includes("timeout")) {
        errorMessage = "⏱️ Connection timeout - Click retry to try again";
      } else if (errorMessage.includes("User closed")) {
        errorMessage = "❌ Modal closed - Click retry to reconnect";
      } else if (errorMessage.includes("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID")) {
        errorMessage = "⚠️ WalletConnect Project ID not configured. Check console for setup instructions.";
      } else if (errorMessage.includes("Failed to publish custom payload")) {
        errorMessage = "⚠️ WalletConnect connection failed. Check that your Project ID is valid and restart the server.";
      }

      resetConnector();

      set({
        connected: false,
        selectedAccount: null,
        accounts: [],
        error: errorMessage,
        isInitializing: false,
      });
      
      // Always throw a proper Error object
      throw new Error(errorMessage);
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

      console.log("✓ Disconnected from wallet");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      set({ error: msg });
    }
  },

  restoreSession: async () => {
    if (typeof window === 'undefined') return;
    
    try {
      console.log('🔄 Attempting to restore wallet session...');
      
      // Check if there's a persisted session
      const persistedState = localStorage.getItem('wallet-storage');
      if (!persistedState) {
        console.log('ℹ️ No persisted wallet session found');
        set({ hasHydrated: true });
        return;
      }

      const state = JSON.parse(persistedState);
      const savedAccount = state?.state?.selectedAccount;
      
      if (!savedAccount) {
        console.log('ℹ️ No saved account in persisted state');
        set({ hasHydrated: true });
        return;
      }

      console.log('🔍 Found persisted session, checking WalletConnect...');
      
      // Initialize connector to restore sessions
      try {
        await initializeDAppConnector();
      } catch (err) {
        console.log('⚠️ Failed to initialize connector during restore:', err);
        localStorage.removeItem('wallet-storage');
        set({ hasHydrated: true });
        return;
      }

      const connector = getConnector();
      if (!connector) {
        console.log('⚠️ Connector not available after initialization');
        localStorage.removeItem('wallet-storage');
        set({ hasHydrated: true });
        return;
      }

      // Get the restored sessions from connector
      const sessions = connector.walletConnectClient?.session.getAll();
      
      if (!sessions || sessions.length === 0) {
        console.log('⚠️ No WalletConnect sessions found, clearing storage');
        localStorage.removeItem('wallet-storage');
        set({ hasHydrated: true });
        return;
      }

      const wcSession = sessions[0];
      
      // Validate that session has Hedera namespace
      if (!wcSession?.namespaces?.hedera) {
        console.log('⚠️ Session missing Hedera namespace, clearing storage');
        localStorage.removeItem('wallet-storage');
        set({ hasHydrated: true });
        return;
      }

      console.log('✅ WalletConnect session found with Hedera namespace, restoring connection...');
      
      try {
        const accounts = extractAccounts(wcSession);
        
        if (accounts.length > 0) {
          set({
            connected: true,
            selectedAccount: accounts[0],
            accounts,
            hasHydrated: true,
            error: null,
            isInitializing: false,
          });
          console.log('✅ Wallet session restored:', accounts[0].id);
          return;
        }
      } catch (accountError) {
        console.log('⚠️ Failed to extract accounts from session:', accountError);
        localStorage.removeItem('wallet-storage');
        set({ hasHydrated: true });
        return;
      }

      console.log('ℹ️ Could not restore session');
      set({ hasHydrated: true });
    } catch (error) {
      console.warn('⚠️ Session restore failed:', error);
      localStorage.removeItem('wallet-storage');
      set({ hasHydrated: true });
    }
  },

  setHasHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),
  }),
  {
    name: 'wallet-storage',
    partialize: (state) => ({
      // Persist the connection state and account info
      selectedAccount: state.selectedAccount,
      accounts: state.accounts,
      hasManuallyConnected: state.hasManuallyConnected,
    }),
    onRehydrateStorage: () => (state) => {
      if (state) {
        // Mark as hydrated so pages can check when store is ready
        state.hasHydrated = true;
      }
    },
  }
));
