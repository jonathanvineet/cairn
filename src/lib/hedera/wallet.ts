'use client'

// Client-side wallet utilities — for use in client components only

export const HEDERA_WALLET_CONFIG = {
  name: 'Cairn — Forest Boundary Intelligence',
  description: 'Boundary inspection evidence anchoring system',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons: [],
}

export function formatAccountId(accountId: string): string {
  return accountId
}

export async function fetchHBARBalance(
  accountId: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<number> {
  try {
    const base = network === 'mainnet'
      ? 'https://mainnet-public.mirrornode.hedera.com'
      : 'https://testnet.mirrornode.hedera.com'
    const response = await fetch(`${base}/api/v1/accounts/${accountId}`)
    if (!response.ok) return 0
    const data = await response.json()
    return (data.balance?.balance ?? 0) / 1e8
  } catch {
    return 0
  }
}
