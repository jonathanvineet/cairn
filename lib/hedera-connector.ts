/**
 * Hedera WalletConnect Connector
 * Properly configured DAppConnector for HashPack on Testnet
 */

import type { DAppConnector } from "@hashgraph/hedera-wallet-connect";

export const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

if (typeof window !== 'undefined' && !PROJECT_ID) {
  console.error('❌ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set!');
}

let dAppConnector: DAppConnector | null = null;

/**
 * Create DAppConnector for Hedera Testnet
 */
export async function initializeDAppConnector(): Promise<DAppConnector> {
  if (typeof window === 'undefined') {
    throw new Error('DAppConnector must be initialized on client side');
  }

  if (dAppConnector) {
    return dAppConnector;
  }

  if (!PROJECT_ID) {
    throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID not configured');
  }

  const {
    DAppConnector,
    HederaChainId,
    HederaJsonRpcMethod,
    HederaSessionEvent,
  } = await import("@hashgraph/hedera-wallet-connect");
  const { LedgerId } = await import("@hiero-ledger/sdk");

  const metadata = {
    name: "Cairn - Hedera Drone Network",
    description: "Decentralized drone operations on Hedera",
    url: window.location.origin,
    icons: [`${window.location.origin}/favicon.ico`],
  };

  dAppConnector = new DAppConnector(
    metadata,
    LedgerId.TESTNET,
    PROJECT_ID,
    Object.values(HederaJsonRpcMethod),
    [HederaSessionEvent.AccountsChanged, HederaSessionEvent.ChainChanged],
    [HederaChainId.Testnet]
  );

  await dAppConnector.init({ logger: "error" });
  
  return dAppConnector;
}

/**
 * Connect to HashPack via WalletConnect
 * Opens modal with QR code and awaits user approval
 */
export async function connectHashPack(): Promise<any> {
  const dapp = await initializeDAppConnector();

  // Use dapp.openModal() - the built-in Hedera SDK method that:
  // - Generates WalletConnect URI for hedera:testnet
  // - Opens the internal QR modal
  // - Waits for user approval in HashPack
  // - Returns the approved session
  const session = await dapp.openModal();

  return session;
}

/**
 * Disconnect from wallet
 */
export async function disconnectHashPack(): Promise<void> {
  if (dAppConnector) {
    await dAppConnector.disconnectAll();
    dAppConnector = null;
  }
}

/**
 * Get current connector instance
 */
export function getConnector(): DAppConnector | null {
  return dAppConnector;
}

/**
 * Reset connector
 */
export function resetConnector(): void {
  dAppConnector = null;
}

/**
 * Extract account info from session
 */
export interface AccountInfo {
  id: string;
  network: string;
  chainId: string;
}

export function extractAccounts(session: any): AccountInfo[] {
  const hederaNamespace = session.namespaces?.hedera;
  if (!hederaNamespace) {
    throw new Error('No Hedera namespace in session');
  }

  const accounts = hederaNamespace.accounts ?? [];
  if (accounts.length === 0) {
    throw new Error('No accounts in Hedera namespace');
  }

  return accounts.map((accountStr: string) => {
    const [, network, accountId] = accountStr.split(":");
    return {
      id: accountId,
      network,
      chainId: accountStr,
    };
  });
}
