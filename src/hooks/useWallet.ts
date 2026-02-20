'use client'
import { useWalletStore } from '@/stores/walletStore'
import { fetchHBARBalance } from '@/lib/hedera/wallet'
import { useCallback } from 'react'

export function useWallet() {
  const store = useWalletStore()

  const connect = useCallback(async () => {
    store.setStatus('CONNECTING')
    try {
      store.setStatus('AWAITING_APPROVAL')
      // In production: use @hashgraph/hedera-wallet-connect dAppConnector
      await new Promise(resolve => setTimeout(resolve, 1500))
      const demoAccountId = '0.0.3456789'
      const balance = await fetchHBARBalance(demoAccountId, 'testnet').catch(() => 2.41)
      store.setConnected(demoAccountId, balance || 2.41, 'testnet')
    } catch {
      store.setStatus('ERROR', 'Failed to connect')
    }
  }, [store])

  const refreshBalance = useCallback(async () => {
    if (!store.accountId || !store.network) return
    const balance = await fetchHBARBalance(store.accountId, store.network).catch(() => null)
    if (balance !== null) store.setBalance(balance)
  }, [store])

  return {
    ...store,
    connect,
    refreshBalance,
  }
}
