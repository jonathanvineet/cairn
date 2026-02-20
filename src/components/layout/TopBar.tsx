'use client'

import { Bell, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useWalletStore } from '@/stores/walletStore'
import { useAlertStore } from '@/stores/alertStore'

export function TopBar() {
  const { isConnected, accountId } = useWalletStore()
  const { unreadCount } = useAlertStore()

  return (
    <header className="h-14 border-b border-[#3C3223] bg-[#1C140A] px-6 flex items-center justify-between">
      <div className="text-sm text-[#786E5F]">
        Forest Boundary Inspection Evidence System
      </div>
      <div className="flex items-center gap-3">
        <Link href="/alerts" className="relative p-2 text-[#B4AA96] hover:text-[#F0EBDC] transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </Link>
        <Link
          href="/wallet"
          className="flex items-center gap-2 text-sm border border-[#3C3223] hover:border-green-700/60 rounded px-3 py-1.5 text-[#B4AA96] hover:text-[#F0EBDC] transition-colors"
        >
          <Wallet className="w-4 h-4" />
          {isConnected ? (
            <span className="text-green-400 font-mono text-xs">{accountId}</span>
          ) : (
            <span>Connect</span>
          )}
        </Link>
      </div>
    </header>
  )
}
