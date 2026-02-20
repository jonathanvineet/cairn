import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WalletState } from '@/types'

interface WalletStore extends WalletState {
  setStatus: (status: WalletState['status'], error?: string) => void
  setConnected: (accountId: string, balance: number, network: 'testnet' | 'mainnet') => void
  disconnect: () => void
  setBalance: (balance: number) => void
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      accountId: null,
      balance: null,
      network: null,
      status: 'NOT_CONNECTED',
      setStatus: (status, error) => set({ status, error }),
      setConnected: (accountId, balance, network) =>
        set({ accountId, balance, network, status: 'CONNECTED', error: undefined }),
      disconnect: () =>
        set({ accountId: null, balance: null, network: null, status: 'NOT_CONNECTED', error: undefined }),
      setBalance: (balance) => set({ balance }),
    }),
    { name: 'cairn-wallet' }
  )
)
