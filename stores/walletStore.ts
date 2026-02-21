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
  id: string;
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

export const useWalletStore = create<WalletState>((set) => ({
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

      console.log('🔵 [1/2] Initializing DAppConnector...');
      await initializeDAppConnector();

      console.log('🔵 [2/2] Opening HashPack connection modal...');
      console.log('⚠️  Make sure: HashPack is open, set to Testnet, and has accounts imported');

      // Connect to HashPack - opens modal and waits for approval
      const session = await connectHashPack();

      console.log('✅ Session approved:', {
        topic: session.topic,
        namespaces: Object.keys(session.namespaces),
      });

      // Extract accounts from session
      const accounts = extractAccounts(session);

      if (accounts.length === 0) {
        throw new Error(
          'No Hedera accounts found in approved session.\n\n' +
          'Checklist:\n' +
          '✓ HashPack installed and open?\n' +
          '✓ HashPack set to Testnet (Settings → Network)?\n' +
          '✓ At least one Testnet account imported?\n' +
          '✓ You approved the connection in HashPack?'
        );
      }

      accounts.forEach((acc) => {
        console.log(`   📱 Account: hedera:${acc.network}:${acc.id}`);
      });

      set({
        connected: true,
        selectedAccount: accounts[0],
        accounts,
        isInitializing: false,
        error: null,
      });

      console.log('✅ Connected to:', accounts[0].id);

    } catch (error) {
      console.error('🔴 Connection error:', error);

      let errorMessage = "Failed to connect wallet";
      if (error instanceof Error) {
        errorMessage = error.message;

        if (
          errorMessage.includes("User rejected") ||
          errorMessage.includes("User closed") ||
          errorMessage.includes("rejected pairing")
        ) {
          errorMessage = "Connection cancelled by user. Please try again.";
        }
      }

      resetConnector();

      set({
        connected: false,
        selectedAccount: null,
        accounts: [],
        error: errorMessage,
        isInitializing: false,
      });

      console.error('💡 Check console above for details and try again');
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
      console.error("Disconnect error:", msg);
    }
  },
}));
