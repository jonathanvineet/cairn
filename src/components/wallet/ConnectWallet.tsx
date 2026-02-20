'use client'
import { useState } from 'react'
import { Wallet, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useWalletStore } from '@/stores/walletStore'
import { fetchHBARBalance } from '@/lib/hedera/wallet'

export function ConnectWallet() {
  const { status, accountId, balance, network, setStatus, setConnected, disconnect } = useWalletStore()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleConnect = async () => {
    setStatus('CONNECTING')
    try {
      // Simulate wallet connection flow for demo
      setStatus('AWAITING_APPROVAL')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Demo: use a placeholder account
      const demoAccountId = '0.0.3456789'
      const demoBalance = await fetchHBARBalance(demoAccountId, 'testnet').catch((err) => { console.error('Failed to fetch balance:', err); return 0 })
      setConnected(demoAccountId, demoBalance ?? 0, 'testnet')
    } catch {
      setStatus('ERROR', 'Failed to connect wallet')
    }
  }

  if (status === 'NOT_CONNECTED') {
    return (
      <Button onClick={handleConnect} variant="outline" size="sm">
        <Wallet size={14} />
        Connect Wallet
      </Button>
    )
  }

  if (status === 'CONNECTING' || status === 'AWAITING_APPROVAL') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 size={14} className="animate-spin" />
        {status === 'CONNECTING' ? 'Connecting...' : 'Approve in wallet...'}
      </div>
    )
  }

  if (status === 'ERROR') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <AlertTriangle size={14} />
          <span>Connection failed</span>
        </div>
        <Button onClick={handleConnect} variant="outline" size="sm">Retry</Button>
      </div>
    )
  }

  if (status === 'CONNECTED' && accountId) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-3 py-1.5 hover:bg-teal-100 transition-colors"
        >
          <div className="w-2 h-2 rounded-full bg-teal-500" />
          <span className="text-xs font-medium text-teal-700">{accountId}</span>
          {balance !== null && (
            <span className="text-xs text-teal-600">{balance.toFixed(2)} ℏ</span>
          )}
          <span className="text-xs bg-orange-100 text-orange-700 rounded px-1">{network}</span>
        </button>
        {showDropdown && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <button
              onClick={() => { navigator.clipboard.writeText(accountId); setShowDropdown(false) }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Copy Account ID
            </button>
            <a
              href={`https://hashscan.io/testnet/account/${accountId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setShowDropdown(false)}
            >
              View on Explorer
            </a>
            <button
              onClick={() => { disconnect(); setShowDropdown(false) }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    )
  }

  return null
}
