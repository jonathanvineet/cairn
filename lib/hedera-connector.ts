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

  // Initialize connector
  await dAppConnector.init({ logger: "error" });
  
  console.log('✅ DAppConnector initialized');
  
  return dAppConnector;
}

/**
 * Connect to HashPack via WalletConnect
 * Attempts to use browser extension if available
 */
export async function connectHashPack(): Promise<any> {
  const dapp = await initializeDAppConnector();

  try {
    console.log('🔍 Initiating HashPack connection...');
    
    // Check if HashPack extension is installed
    const hasExtension = typeof window !== 'undefined' && 
      !!(window as any).hashconnect;
    
    if (hasExtension) {
      console.log('✅ HashPack extension detected - connecting via extension');
      console.log('📱 Please approve the connection in your HashPack extension popup');
    } else {
      console.log('ℹ️ HashPack extension not detected - showing WalletConnect modal');
    }
    
    // openModal() should detect and use the extension automatically
    // When extension is present, it triggers the extension popup
    // The "new tab" can be ignored - focus on the extension popup instead
    const session = await dapp.openModal();

    console.log('✅ HashPack connected successfully');
    return session;
  } catch (error: any) {
    console.error('❌ HashPack connection failed:', error);
    
    // Provide better error message
    if (error.message?.includes('User rejected') || error.message?.includes('User closed')) {
      throw new Error('Connection cancelled. Please approve in HashPack extension.');
    }
    
    throw error;
  }
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
 * Check for persisted WalletConnect session and restore if available
 */
export async function checkPersistedState(): Promise<any | null> {
  try {
    const dapp = await initializeDAppConnector();
    
    // Check if there's an existing session
    const sessions = dapp.walletConnectClient?.session.getAll();
    
    if (sessions && sessions.length > 0) {
      console.log('✅ Found persisted WalletConnect session');
      return sessions[0];
    }
    
    console.log('ℹ️ No persisted session found');
    return null;
  } catch (error) {
    console.error('❌ Error checking persisted state:', error);
    return null;
  }
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
