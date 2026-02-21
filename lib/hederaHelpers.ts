/**
 * Hedera Helper Utilities
 * Provides utilities for transaction handling, serialization, and multi-signature support
 */

import { Transaction, PrivateKey } from "@hiero-ledger/sdk";

/**
 * Convert a transaction to a base64 encoded string for transmission
 * Useful for sending transactions to backend services or storing them
 */
export function transactionToBase64String(transaction: Transaction): string {
  const transactionBytes = transaction.toBytes();
  return Buffer.from(transactionBytes).toString("base64");
}

/**
 * Convert a base64 encoded string back to a Transaction
 */
export function transactionFromBase64String(base64: string): Transaction {
  const transactionBytes = Buffer.from(base64, "base64");
  return Transaction.fromBytes(transactionBytes);
}

/**
 * Add a signature to an already-signed transaction
 * This is useful for multi-signature workflows where multiple parties need to sign
 * 
 * @param transaction - The transaction to add a signature to (can already have signatures)
 * @param privateKey - The private key to sign with
 * @returns The transaction with the additional signature
 * 
 * @example
 * // Frontend: User signs with wallet
 * const userSignedTx = await signer.signTransaction(transaction)
 * 
 * // Backend: Add server signature
 * const fullySignedTx = await addSignatureToTransaction(
 *   userSignedTx, 
 *   backendPrivateKey
 * )
 * 
 * // Execute with all signatures
 * await fullySignedTx.execute(client)
 */
export async function addSignatureToTransaction(
  transaction: Transaction,
  privateKey: PrivateKey
): Promise<Transaction> {
  // Sign the transaction with the provided private key
  // This adds the signature to the existing signatures
  const signedTransaction = await transaction.sign(privateKey);
  return signedTransaction;
}

/**
 * Helper to format Hedera account IDs for display
 */
export function formatAccountId(accountId: string): string {
  // Already formatted as 0.0.xxxx
  if (accountId.startsWith("0.0.")) {
    return accountId;
  }
  // Try to parse and format
  return accountId;
}

/**
 * Helper to format HBAR amounts for display
 */
export function formatHbar(amount: number | bigint): string {
  return `${amount} ℏ`;
}

/**
 * Validate if a string is a valid Hedera account ID format
 */
export function isValidAccountId(accountId: string): boolean {
  // Format: shard.realm.num (e.g., 0.0.1234)
  const accountIdRegex = /^\d+\.\d+\.\d+$/;
  return accountIdRegex.test(accountId);
}

/**
 * Parse a CAIP-10 account string to extract the account ID
 * Format: hedera:testnet:0.0.1234 -> 0.0.1234
 */
export function parseCAIPAccount(caipAccount: string): {
  namespace: string;
  network: string;
  accountId: string;
} | null {
  const parts = caipAccount.split(":");
  if (parts.length !== 3) {
    return null;
  }

  return {
    namespace: parts[0],
    network: parts[1],
    accountId: parts[2],
  };
}
