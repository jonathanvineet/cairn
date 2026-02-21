import { create } from "zustand";
import {
  getOrInitializeDAppConnector,
  getDAppConnector,
} from "@/lib/walletConfig";

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
    // Ensure we're on client-side
    if (typeof window === 'undefined') {
      set({ error: 'Wallet connection only available on client side' });
      return;
    }

    try {
      set({ error: null, isInitializing: true });

      console.log('🔵 [1/6] Starting wallet connection...');

      const connector = await getOrInitializeDAppConnector();
      
      console.log('🔵 [2/6] DAppConnector initialized:', {
        hasConnector: !!connector,
        hasSession: !!connector.session,
        sessionTopic: connector.session?.topic,
      });

      // Check if there's already an active session
      if (connector.session) {
        console.log('🟡 [INFO] Found existing session, disconnecting first...');
        try {
          await connector.disconnectAll();
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.log('🟡 [INFO] No previous sessions to disconnect');
        }
      }

      console.log('🔵 [3/6] Opening WalletConnect modal...');
      
      // Open the modal and wait for connection
      // This should block until user scans/connects or closes modal
      try {
        await connector.openModal();
      } catch (modalError) {
        console.error('🔴 [ERROR] Modal error:', modalError);
        throw new Error('Failed to open wallet connection modal. Please refresh and try again.');
      }

      console.log('🔵 [4/6] Modal interaction complete');

      // Wait for session to be established
      let attempts = 0;
      const maxAttempts = 20; // 10 seconds total
      let session = connector.session;

      while (!session && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        session = connector.session;
        attempts++;
        console.log(`🔵 [4/${6}] Waiting for session... (attempt ${attempts}/${maxAttempts})`, {
          hasSession: !!session,
        });
      }

      console.log('🔵 [5/6] Session check complete:', {
        hasSession: !!session,
        hasTopic: !!session?.topic,
        hasNamespaces: !!session?.namespaces,
        namespaceKeys: session?.namespaces ? Object.keys(session.namespaces) : [],
        rawSession: session,
      });

      if (!session) {
        console.error('🔴 [ERROR] No session after modal closed. User may have cancelled or wallet failed to connect.');
        throw new Error("No session created. Please try connecting again and approve in your wallet app.");
      }

      if (!session.namespaces) {
        console.error('🔴 [ERROR] Session exists but no namespaces:', session);
        throw new Error("Session created but incomplete. Please try again.");
      }

      // Extract accounts from session
      const accounts: Account[] = [];

      // Check for Hedera namespace (hedera:testnet or hedera:mainnet)
      const hederaNamespace = session.namespaces["hedera"];

      console.log('🔵 [6/6] Processing accounts:', {
        hederaNamespace,
        allNamespaces: Object.keys(session.namespaces),
      });

      if (hederaNamespace && hederaNamespace.accounts) {
        hederaNamespace.accounts.forEach((account: string) => {
          console.log('   📝 Processing account:', account);
          // Format: hedera:testnet:0.0.1234
          const parts = account.split(":");
          if (parts.length >= 3) {
            const [, network, accountId] = parts;
            accounts.push({
              id: accountId,
              network: network,
              chainId: account,
            });
          }
        });
      }

      if (accounts.length === 0) {
        console.error('🔴 [ERROR] No accounts found in Hedera namespace');
        console.error('Available namespaces:', Object.keys(session.namespaces));
        throw new Error(
          "No Hedera accounts found in session. Please ensure your wallet supports Hedera and is on Testnet."
        );
      }

      const selectedAccount = accounts[0];

      set({
        connected: true,
        selectedAccount,
        accounts,
        isInitializing: false,
      });

      console.log("✅ Connected to Hedera wallet");
      console.log("   Account:", selectedAccount.id);
      console.log("   Network:", selectedAccount.network);
      console.log("   Full chain ID:", selectedAccount.chainId);
    } catch (error) {
      console.error('🔴 [FATAL] Connection failed:', error);
      
      let errorMessage = "Failed to connect wallet";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('   Error details:', {
          message: error.message,
          stack: error.stack,
        });
        
        // User closed modal without connecting
        if (errorMessage.includes("User rejected") || 
            errorMessage.includes("User closed modal") ||
            errorMessage.includes("Modal closed")) {
          errorMessage = "Connection cancelled. Please try again and approve in your wallet.";
        }
      }

      set({
        connected: false,
        selectedAccount: null,
        accounts: [],
        error: errorMessage,
        isInitializing: false,
      });

      console.error("❌ Wallet connection error:", errorMessage);
      console.error("💡 Troubleshooting tips:");
      console.error("   1. Ensure your wallet (HashPack/Kabila/Dropp) is installed");
      console.error("   2. Make sure wallet is on TESTNET (not Mainnet)");
      console.error("   3. Check WalletConnect Project ID in .env");
      console.error("   4. Try clearing browser cache and reconnecting");
      console.error("   5. See WALLET_TROUBLESHOOTING.md for detailed help");
      
      throw error;
    }
  },

  disconnect: async () => {
    // Ensure we're on client-side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const connector = getDAppConnector();

      if (connector && connector.session) {
        await connector.disconnectSession();
      }

      set({
        connected: false,
        selectedAccount: null,
        accounts: [],
        error: null,
      });

      console.log("✓ Wallet disconnected");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to disconnect wallet";

      set({ error: errorMessage });
      console.error("Wallet disconnection error:", errorMessage);
    }
  },
}));
