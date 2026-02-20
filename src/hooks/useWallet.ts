'use client'

import { useWalletStore } from '@/stores/walletStore'

export function useWallet() {
  const { isConnected, accountId, walletAddress, network, balance, connect, disconnect, setBalance } = useWalletStore()

  const connectWallet = async () => {
    // Mock wallet connection for development
    connect('0.0.123456', '0x1234...abcd')
  }

  const disconnectWallet = () => {
    disconnect()
  }

  return {
    isConnected,
    accountId,
    walletAddress,
    network,
    balance,
    connectWallet,
    disconnectWallet,
    setBalance,
  }
}
