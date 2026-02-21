import { useCallback } from "react";
import { useWalletStore } from "@/stores/walletStore";
import { getDAppConnector } from "@/lib/walletConfig";
import { Transaction, AccountId } from "@hiero-ledger/sdk";
import {
  transactionToBase64String,
  transactionFromBase64String,
  addSignatureToTransaction,
} from "@/lib/hederaHelpers";

export function useHederaWallet() {
  const { connected, selectedAccount, error } = useWalletStore();

  const getSigner = useCallback(() => {
    const connector = getDAppConnector();
    if (!connector || !selectedAccount) {
      throw new Error("Wallet not connected");
    }
    return connector.getSigner(AccountId.fromString(selectedAccount.id));
  }, [selectedAccount]);

  const signTransaction = useCallback(
    async (transaction: Transaction) => {
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
    [connected, selectedAccount, getSigner]
  );

  const signAndExecuteTransaction = useCallback(
    async (transaction: Transaction) => {
      if (!connected || !selectedAccount) {
        throw new Error("Wallet not connected");
      }

      try {
        const signer = getSigner();
        // Sign the transaction
        const signedTx = await signer.signTransaction(transaction);
        // Execute the signed transaction using the signer's call method
        const result = await signer.call(signedTx);
        return result;
      } catch (err) {
        console.error("Transaction execution error:", err);
        throw err;
      }
    },
    [connected, selectedAccount, getSigner]
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
