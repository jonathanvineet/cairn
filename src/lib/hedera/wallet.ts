export const HEDERA_WALLET_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  name: 'BoundaryTruth',
  description: 'Verified Boundary Inspection Evidence Infrastructure',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  icons: [`${process.env.NEXT_PUBLIC_APP_URL}/icon.png`],
  network: process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet',
}
