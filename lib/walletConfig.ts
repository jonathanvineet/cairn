import {
  DAppConnector,
  HederaSessionEvent,
  HederaJsonRpcMethod,
  HederaChainId,
} from "@hashgraph/hedera-wallet-connect";
import { LedgerId } from "@hiero-ledger/sdk";

// Metadata for your dApp
const metadata = {
  name: "Cairn - Hedera Drone Network",
  description: "Decentralized drone operations on Hedera",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  icons: [
    "https://avatars.githubusercontent.com/u/31002956", // Hedera icon as placeholder
  ],
};

// WalletConnect Project ID - get from https://cloud.walletconnect.com
const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

// Log immediately to verify it's loading
console.log('🔑 WalletConnect Project ID check:', {
  isDefined: !!PROJECT_ID,
  length: PROJECT_ID.length,
  preview: PROJECT_ID ? `${PROJECT_ID.slice(0, 8)}...${PROJECT_ID.slice(-4)}` : 'MISSING',
});

if (!PROJECT_ID) {
  console.error('❌ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID environment variable not set!');
  console.error('   Get a free Project ID from: https://cloud.walletconnect.com');
  console.error('   Add it to your .env file:');
  console.error('   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id-here');
}

// Initialize DAppConnector for Hedera Testnet
let dAppConnector: DAppConnector | null = null;

export async function initializeDAppConnector(): Promise<DAppConnector> {
  // Only initialize on client-side
  if (typeof window === 'undefined') {
    throw new Error('DAppConnector can only be initialized on the client side');
  }

  if (dAppConnector) {
    console.log('♻️  Reusing existing DAppConnector');
    return dAppConnector;
  }

  console.log('🔧 Initializing DAppConnector with config:', {
    name: metadata.name,
    url: metadata.url,
    projectId: PROJECT_ID ? `${PROJECT_ID.slice(0, 8)}...` : 'MISSING!',
    network: 'TESTNET',
    chainId: HederaChainId.Testnet,
  });

  if (!PROJECT_ID) {
    throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set in environment variables');
  }

  dAppConnector = new DAppConnector(
    metadata,
    LedgerId.TESTNET,
    PROJECT_ID,
    Object.values(HederaJsonRpcMethod),
    [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
    [HederaChainId.Testnet]
  );

  console.log('⏳ Initializing connector...');
  await dAppConnector.init({ logger: "debug" }); // Changed to debug for better logs

  console.log('✅ DAppConnector initialized successfully');

  return dAppConnector;
}

export function getDAppConnector(): DAppConnector | null {
  return dAppConnector;
}

export async function getOrInitializeDAppConnector(): Promise<DAppConnector> {
  if (dAppConnector) {
    return dAppConnector;
  }
  return initializeDAppConnector();
}
