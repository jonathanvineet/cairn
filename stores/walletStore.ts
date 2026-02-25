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
import { connectMetaMask as connectMM, isMetaMaskInstalled } from "@/lib/metamask-connector";

export type WalletType = "HASH_PACK" | "META_MASK";

interface Account {
  id: string; // EVM address or Hedera Account ID
  network: string;
  chainId: string;
}

interface WalletState {
  connected: boolean;
  walletType: WalletType | null;
  selectedAccount: Account | null;
  accounts: Account[];
  connect: (type?: WalletType) => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
  isInitializing: boolean;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  connected: false,
  walletType: null,
  selectedAccount: null,
  accounts: [],
  error: null,
  isInitializing: false,

  connect: async (type: WalletType = "HASH_PACK") => {
    if (typeof window === 'undefined') {
      set({ error: 'Wallet connection only available on client side' });
      return;
    }

    try {
      set({ error: null, isInitializing: true });

      if (type === "META_MASK") {
        if (!isMetaMaskInstalled()) {
          throw new Error("MetaMask is not installed");
        }

        const { address } = await connectMM();
        const account = {
          id: address,
          network: "testnet",
          chainId: "296"
        };

        set({
          connected: true,
          walletType: "META_MASK",
          selectedAccount: account,
          accounts: [account],
          isInitializing: false,
          error: null
        });

        console.log('✅ Connected to MetaMask:', address);
        return;
      }

      // Default: HashPack
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
        walletType: "HASH_PACK",
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

      if (type === "HASH_PACK") {
        resetConnector();
      }

      set({
        connected: false,
        walletType: null,
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
    const { walletType } = get();

    try {
      if (walletType === "HASH_PACK") {
        await disconnectHashPack();
      }
      // MetaMask disconnection is handled client-side usually by just clearing state

      set({
        connected: false,
        walletType: null,
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
