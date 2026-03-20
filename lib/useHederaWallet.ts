import { useCallback } from "react";
import { useWalletStore } from "@/stores/walletStore";
import { getConnector } from "@/lib/hedera-connector";
import { Transaction, AccountId, Client } from "@hiero-ledger/sdk";
import {
  transactionToBase64String,
  transactionFromBase64String,
  addSignatureToTransaction,
} from "@/lib/hederaHelpers";

export function useHederaWallet() {
  const { connected, selectedAccount, error, hasHydrated } = useWalletStore();

  const getSigner = useCallback(() => {
    const connector = getConnector();
    if (!hasHydrated) {
      throw new Error("Wallet is initializing, please wait...");
    }
    if (!connector || !selectedAccount) {
      throw new Error("Wallet not connected");
    }
    return connector.getSigner(AccountId.fromString(selectedAccount.id));
  }, [selectedAccount, hasHydrated]);

  const signTransaction = useCallback(
    async (transaction: Transaction) => {
      if (!hasHydrated) {
        throw new Error("Wallet is initializing, please wait...");
      }
      if (!connected || !selectedAccount) {
        throw new Error("Wallet not connected");
      }

      try {
        const signer = getSigner();
        const signedTx = await signer.signTransaction(transaction);
        return signedTx;
      } catch (err) {
        console.error("Transaction signing error:", err);
        throw err;
      }
    },
    [connected, selectedAccount, getSigner, hasHydrated]
  );

  const signAndExecuteTransaction = useCallback(
    async (transaction: Transaction) => {
      if (!hasHydrated) {
        throw new Error("Wallet is initializing, please wait...");
      }
      if (!connected || !selectedAccount) {
        throw new Error("Wallet not connected");
      }

      try {
        console.log('🔐 [useHederaWallet] Starting transaction signing and execution...');
        console.log('🔐 [useHederaWallet] Selected account:', selectedAccount.id);
        
        // Create a client with the user's account as operator for freezing
        const client = Client.forTestnet();
        client.setOperator(
          AccountId.fromString(selectedAccount.id),
          // We don't have the private key, but we can set a dummy one
          // since we're only using this for freezing, not signing
          "0000000000000000000000000000000000000000000000000000000000000000"
        );
        
        console.log('❄️ [useHederaWallet] Freezing transaction with client...');
        // Freeze the transaction with the client
        await transaction.freezeWith(client);
        console.log('❄️ [useHederaWallet] Transaction frozen successfully');
        
        // Use signAndExecuteTransaction directly - this only prompts ONCE
        const connector = getConnector();
        if (!connector) {
          throw new Error("Wallet connector not available");
        }
        
        console.log('📮 [useHederaWallet] Getting signer from connector...');
        const signer = connector.getSigner(AccountId.fromString(selectedAccount.id));
        
        console.log('✍️ [useHederaWallet] Sending transaction to wallet for signing and execution...');
        console.log('✍️ [useHederaWallet] This may take 30+ seconds. Waiting for wallet response...');
        
        const result = await signer.call(transaction);
        
        console.log('✅ [useHederaWallet] Transaction executed successfully');
        console.log('✅ [useHederaWallet] Result:', result);
        return result;
      } catch (err) {
        console.error("❌ [useHederaWallet] Transaction execution error:", err);
        console.error("❌ [useHederaWallet] Error message:", (err as any)?.message);
        console.error("❌ [useHederaWallet] Error code:", (err as any)?.code);
        throw err;
      }
    },
    [connected, selectedAccount, getSigner, hasHydrated]
  );

  return {
    connected,
    selectedAccount,
    error,
    getSigner,
    signTransaction,
    signAndExecuteTransaction,
    // Export helper utilities
    transactionToBase64String,
    transactionFromBase64String,
    addSignatureToTransaction,
  };
}
