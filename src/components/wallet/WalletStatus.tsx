'use client'
import { CheckCircle, AlertTriangle, Clock, WifiOff } from 'lucide-react'
import { useWalletStore } from '@/stores/walletStore'
import { formatHBAR } from '@/lib/utils/format'

export function WalletStatus() {
  const { status, accountId, balance, network } = useWalletStore()

  const statusConfig = {
    NOT_CONNECTED: { icon: WifiOff, color: 'text-gray-400', label: 'Not connected' },
    CONNECTING: { icon: Clock, color: 'text-amber-500', label: 'Connecting...' },
    AWAITING_APPROVAL: { icon: Clock, color: 'text-amber-500', label: 'Awaiting approval' },
    CONNECTED: { icon: CheckCircle, color: 'text-teal-600', label: accountId ?? 'Connected' },
    WRONG_NETWORK: { icon: AlertTriangle, color: 'text-red-500', label: 'Wrong network' },
    ERROR: { icon: AlertTriangle, color: 'text-red-500', label: 'Error' },
  }

  const { icon: Icon, color, label } = statusConfig[status]

  return (
    <div className="flex items-center gap-2">
      <Icon size={16} className={color} />
      <span className={`text-sm font-medium ${color}`}>{label}</span>
      {status === 'CONNECTED' && balance !== null && (
        <span className="text-xs text-gray-500">({formatHBAR(balance)}) • {network}</span>
      )}
    </div>
  )
}
