/**
 * Hedera WalletConnect Connector
 * Properly configured DAppConnector for HashPack on Testnet
 */

import type { DAppConnector } from "@hashgraph/hedera-wallet-connect";

export const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

if (typeof window !== 'undefined' && !PROJECT_ID) {
  console.error('❌ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set!');
}

if (typeof window !== 'undefined' && PROJECT_ID === 'your_project_id_here') {
  console.error('❌ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is still a placeholder! Replace it with your actual Project ID from https://cloud.walletconnect.com/');
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

  if (!PROJECT_ID || PROJECT_ID === 'YOUR_ACTUAL_PROJECT_ID_HERE' || PROJECT_ID === 'your_project_id_here') {
    throw new Error('❌ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not configured.\n\n📋 To fix:\n1. Go to https://cloud.walletconnect.com/\n2. Create a new project and copy your Project ID\n3. Replace the placeholder in .env.local with your actual Project ID\n4. Restart the dev server');
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
 * Works with both extension and mobile app via QR code
 */
export async function connectHashPack(): Promise<any> {
  const dapp = await initializeDAppConnector();

  try {
    console.log('🔍 Initiating HashPack connection...');
    console.log('⏱️  Timeout: 3 minutes (180 seconds)');
    console.log('');
    console.log('📋 CONNECTION STEPS:');
    console.log('   1️⃣  Look for HashPack popup in browser (top-right corner)');
    console.log('   2️⃣  OR scan QR code with HashPack mobile app');
    console.log('   3️⃣  Approve the connection request');
    console.log('   4️⃣  Wait for confirmation');
    console.log('');
    
    // Check if HashPack extension is installed
    const hasExtension = typeof window !== 'undefined' && 
      !!(window as any).hashconnect;
    
    if (hasExtension) {
      console.log('✅ HashPack extension detected - using browser extension');
      console.log('📱 CHECK YOUR BROWSER EXTENSIONS (top-right) for approval popup');
    } else {
      console.log('ℹ️  HashPack extension not detected - showing WalletConnect modal');
      console.log('📱 Scan QR code with HashPack mobile app OR install extension from:');
      console.log('   https://chrome.google.com/webstore/detail/hashpack/gjagmgiddbbciopjhllkdnddhcglnemk');
    }
    
    // Connect with timeout (180 seconds / 3 minutes - plenty of time for mobile QR scan)
    // Increased to 3 minutes to accommodate:
    // 1. Finding phone/wallet app (30s)
    // 2. Opening HashPack mobile (30s)
    // 3. Scanning QR code (30s)
    // 4. Reviewing and approving (60s)
    // 5. Network connection establishment (30s)
    const connectionPromise = dapp.openModal().catch((err: any) => {
      console.error('❌ Modal connection error:', err);
      // Ensure we have a proper Error object
      if (!err || typeof err !== 'object') {
        throw new Error('Connection failed with unknown error');
      }
      if (!err.message && !err.toString) {
        throw new Error('Connection failed: ' + JSON.stringify(err));
      }
      throw err;
    });
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Connection timeout after 3 minutes. Please check:\n• HashPack extension is installed\n• Mobile app is up to date\n• You approved the connection\n• Try refreshing and reconnecting'));
      }, 180000);
    });
    
    console.log('⏳ Waiting for wallet approval...');
    const session = await Promise.race([connectionPromise, timeoutPromise]);

    console.log('✅ HashPack connected successfully');
    console.log('📊 Session details:', session);
    return session;
  } catch (error: any) {
    console.error('❌ HashPack connection failed');
    console.error('Raw error:', error);
    console.error('Error type:', typeof error);
    console.error('Error keys:', error ? Object.keys(error) : 'null');
    
    // Handle empty error objects
    if (!error) {
      const defaultError = new Error('Connection failed with no error details');
      console.error('Throwing default error:', defaultError);
      throw defaultError;
    }
    
    // Convert non-Error objects to Error
    if (typeof error === 'string') {
      throw new Error(error);
    }
    
    if (typeof error === 'object' && !error.message) {
      // Try to extract useful info from the error object
      const errorStr = JSON.stringify(error, null, 2);
      console.error('Error object (stringified):', errorStr);
      
      if (errorStr === '{}' || errorStr === 'null') {
        throw new Error('Connection failed - empty error received. Check console for details.');
      }
      
      throw new Error(`Connection failed: ${errorStr}`);
    }
    
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
    
    // Provide better error messages
    if (error.message?.includes('User rejected') || error.message?.includes('User closed') || error.message?.includes('cancelled')) {
      throw new Error('❌ Connection cancelled by user');
    }
    if (error.message?.includes('timeout')) {
      throw new Error('⏱️ Connection timeout - Try again or check your HashPack app');
    }
    if (error.message?.includes('not installed') || error.message?.includes('not found')) {
      throw new Error('📱 HashPack not found - Install extension or use mobile app');
    }
    
    // Generic error with original message
    throw new Error(`Connection failed: ${error.message || error.toString() || 'Unknown error'}`);
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
