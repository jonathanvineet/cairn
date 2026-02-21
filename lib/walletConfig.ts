// Import types only to avoid triggering module initialization on server
import type { DAppConnector } from "@hashgraph/hedera-wallet-connect";

// WalletConnect Project ID - get from https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

// Only log on client-side
if (typeof window !== 'undefined') {
  console.log('🔑 WalletConnect Project ID check:', {
    isDefined: !!projectId,
    length: projectId.length,
    preview: projectId ? `${projectId.slice(0, 8)}...${projectId.slice(-4)}` : 'MISSING',
  });

  if (!projectId) {
    console.error('❌ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set!');
  }
}

// Global singleton
let dAppConnector: DAppConnector | null = null;

/**
 * Create and initialize DAppConnector.
 * DAppConnector manages its own WalletConnectModal internally — no need to
 * create a separate Web3Modal instance.
 */
export async function createConnector(): Promise<DAppConnector> {
  if (typeof window === 'undefined') {
    throw new Error('DAppConnector can only be initialized on the client side');
  }

  if (dAppConnector) {
    console.log('♻️  Reusing existing DAppConnector');
    return dAppConnector;
  }

  if (!projectId) {
    throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set in environment variables');
  }

  const [
    { DAppConnector, HederaSessionEvent, HederaJsonRpcMethod, HederaChainId },
  ] = await Promise.all([
    import("@hashgraph/hedera-wallet-connect"),
  ]);

  const metadata = {
    name: "Cairn - Hedera Drone Network",
    description: "Decentralized drone operations on Hedera",
    url: window.location.origin,
    icons: [`${window.location.origin}/favicon.ico`],
  };

  console.log('🔧 Creating DAppConnector for', metadata.url);

  // DAppConnector creates its own WalletConnectModal in its constructor
  dAppConnector = new DAppConnector(
    metadata,
    HederaChainId.Testnet,
    projectId,
    Object.values(HederaJsonRpcMethod),
    [HederaSessionEvent.AccountsChanged, HederaSessionEvent.ChainChanged],
    [HederaChainId.Testnet]
  );

  await dAppConnector.init({ logger: "error" });
  console.log('✅ DAppConnector ready');

  return dAppConnector;
}

export function getDAppConnector(): DAppConnector | null {
  return dAppConnector;
}

export function resetConnector(): void {
  dAppConnector = null;
}

