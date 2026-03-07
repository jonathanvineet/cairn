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
        // Create a client with the user's account as operator for freezing
        const client = Client.forTestnet();
        client.setOperator(
          AccountId.fromString(selectedAccount.id),
          // We don't have the private key, but we can set a dummy one
          // since we're only using this for freezing, not signing
          "0000000000000000000000000000000000000000000000000000000000000000"
        );
        
        // Freeze the transaction with the client
        await transaction.freezeWith(client);
        
        // Use signAndExecuteTransaction directly - this only prompts ONCE
        const connector = getConnector();
        if (!connector) {
          throw new Error("Wallet connector not available");
        }
        
        const signer = connector.getSigner(AccountId.fromString(selectedAccount.id));
        const result = await signer.call(transaction);
        
        return result;
      } catch (err) {
        console.error("Transaction execution error:", err);
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
