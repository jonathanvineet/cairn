import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WalletState {
  isConnected: boolean
  accountId: string | null
  walletAddress: string | null
  network: string
  balance: number | null
  sessionTopic: string | null
  connect: (accountId: string, address?: string) => void
  disconnect: () => void
  setBalance: (balance: number) => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      isConnected: false,
      accountId: null,
      walletAddress: null,
      network: process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet',
      balance: null,
      sessionTopic: null,
      connect: (accountId, address) =>
        set({ isConnected: true, accountId, walletAddress: address || null }),
      disconnect: () =>
        set({ isConnected: false, accountId: null, walletAddress: null, balance: null }),
      setBalance: (balance) => set({ balance }),
    }),
    { name: 'boundary-truth-wallet' }
  )
)
