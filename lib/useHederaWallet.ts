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
  const { connected, selectedAccount, error } = useWalletStore();

  const getSigner = useCallback(() => {
    const connector = getConnector();
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
        
        // Now sign and execute with the wallet
        const signer = getSigner();
        const signedTx = await signer.signTransaction(transaction);
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
