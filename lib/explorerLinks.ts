/**
 * explorerLinks.ts
 * 
 * Utility functions to generate links to Hedera blockchain explorer
 * for transactions, accounts, topics, and contracts
 */

const HEDERA_TESTNET_EXPLORER = "https://testnet.mirrornode.hedera.com";

/**
 * Generate a link to view a transaction in Hedera explorer
 * @param transactionId - Transaction ID in format "0.0.account@timestamp"
 * @returns Explorer URL
 */
export function getTransactionExplorerLink(transactionId: string): string {
  return `${HEDERA_TESTNET_EXPLORER}/api/v1/transactions/${transactionId}`;
}

/**
 * Generate a link to view an account in Hedera explorer
 * @param accountId - Account ID in format "0.0.accountNumber"
 * @returns Explorer URL
 */
export function getAccountExplorerLink(accountId: string): string {
  return `${HEDERA_TESTNET_EXPLORER}/api/v1/accounts/${accountId}`;
}

/**
 * Generate a link to view an HCS topic in Hedera explorer
 * @param topicId - Topic ID in format "0.0.topicNumber"
 * @returns Explorer URL
 */
export function getTopicExplorerLink(topicId: string): string {
  return `${HEDERA_TESTNET_EXPLORER}/api/v1/topics/${topicId}`;
}

/**
 * Generate a link to view a contract in Hedera explorer
 * @param contractId - Contract ID in format "0.0.contractNumber"
 * @returns Explorer URL
 */
export function getContractExplorerLink(contractId: string): string {
  return `${HEDERA_TESTNET_EXPLORER}/api/v1/contracts/${contractId}`;
}

/**
 * Format transaction response with explorer link
 * Returns an object with the transaction ID and a clickable explorer URL
 */
export function formatTransactionResponse(transactionId: string) {
  return {
    transactionId,
    explorerLink: getTransactionExplorerLink(transactionId),
    explorerUrl: `${HEDERA_TESTNET_EXPLORER}/#/transaction/${transactionId}`,
  };
}

/**
 * Create a structured response object for transaction results
 */
export function createTransactionResultResponse(
  transactionId: string,
  status: string = "SUCCESS",
  additionalData: Record<string, any> = {}
) {
  return {
    success: true,
    transactionId,
    status,
    explorerLink: getTransactionExplorerLink(transactionId),
    explorerUrl: `${HEDERA_TESTNET_EXPLORER}/#/transaction/${transactionId}`,
    ...additionalData,
  };
}
