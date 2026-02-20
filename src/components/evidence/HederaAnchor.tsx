import { ExternalLink, CheckCircle, Clock, XCircle } from 'lucide-react'

interface HederaAnchorProps {
  transactionId?: string
  status: 'PENDING' | 'ANCHORED' | 'FAILED'
  timestamp?: Date
}

export function HederaAnchor({ transactionId, status, timestamp }: HederaAnchorProps) {
  const statusConfig = {
    PENDING: { icon: Clock, color: 'text-yellow-400', label: 'Pending Anchor' },
    ANCHORED: { icon: CheckCircle, color: 'text-teal-400', label: 'HCS Anchored' },
    FAILED: { icon: XCircle, color: 'text-red-400', label: 'Anchor Failed' },
  }

  const { icon: Icon, color, label } = statusConfig[status]

  return (
    <div className="flex items-start gap-3 bg-[#0E0A04] border border-[#3C3223] rounded p-3">
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium ${color}`}>{label}</div>
        {transactionId && (
          <div className="flex items-center gap-1 mt-1">
            <code className="text-xs font-mono text-[#B4AA96] truncate">{transactionId}</code>
            <a
              href={`https://hashscan.io/testnet/transaction/${transactionId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#786E5F] hover:text-teal-400 flex-shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
        {timestamp && (
          <div className="text-[10px] text-[#786E5F] mt-1">
            {new Date(timestamp).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  )
}
