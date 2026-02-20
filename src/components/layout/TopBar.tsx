'use client'
import { Bell, User } from 'lucide-react'
import Link from 'next/link'
import { useWalletStore } from '@/stores/walletStore'
import { formatHBAR } from '@/lib/utils/format'

interface TopBarProps {
  title?: string
}

export function TopBar({ title }: TopBarProps) {
  const { accountId, balance, status } = useWalletStore()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        {title && <h1 className="font-semibold text-gray-900">{title}</h1>}
      </div>
      <div className="flex items-center gap-3">
        {status === 'CONNECTED' && accountId ? (
          <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-3 py-1">
            <div className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="text-xs font-medium text-teal-700">{accountId}</span>
            {balance !== null && (
              <span className="text-xs text-teal-600">{formatHBAR(balance)}</span>
            )}
          </div>
        ) : (
          <Link href="/wallet" className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-full px-3 py-1">
            Connect Wallet
          </Link>
        )}
        <Link href="/alerts" className="p-2 rounded-full hover:bg-gray-100 text-gray-500 relative">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Link>
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
          <User size={18} />
        </button>
      </div>
    </header>
  )
}
