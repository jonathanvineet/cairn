import Link from 'next/link'
import { MapPin, Clock, Copy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { ConditionBadge, AnchorBadge } from '@/components/ui/Badge'
import { formatTimestamp, formatGPS, formatHash } from '@/lib/utils/format'
import type { InspectionRecord } from '@/types'

interface EvidenceCardProps {
  record: InspectionRecord
  checkpointName?: string
  zoneName?: string
}

export function EvidenceCard({ record, checkpointName, zoneName }: EvidenceCardProps) {
  const accentMap = {
    INTACT: 'intact' as const,
    ANOMALY: 'anomaly' as const,
    BREACH: 'breach' as const,
  }

  return (
    <Card accent={accentMap[record.condition]} className="flex flex-col">
      <div className="aspect-video bg-gray-100 rounded-t-xl overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-full h-full ${record.condition === 'INTACT' ? 'bg-green-50' : record.condition === 'ANOMALY' ? 'bg-amber-50' : 'bg-red-50'} flex items-center justify-center`}>
            <span className="text-4xl">{record.condition === 'INTACT' ? '🟢' : record.condition === 'ANOMALY' ? '🟡' : '🔴'}</span>
          </div>
        </div>
        <div className="absolute top-2 left-2">
          <ConditionBadge condition={record.condition} />
        </div>
      </div>
      <CardContent className="space-y-3 flex-1">
        <div>
          <div className="font-semibold text-gray-900 text-sm">{checkpointName ?? record.checkpointId}</div>
          {zoneName && <div className="text-xs text-gray-500">{zoneName}</div>}
        </div>

        <div className="space-y-1 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={11} />
            <span>Captured: {formatTimestamp(record.capturedAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={11} />
            <span>GPS: {formatGPS(record.latitude, record.longitude)}</span>
          </div>
        </div>

        <div className="space-y-1">
          <AnchorBadge status={record.anchorStatus} />
          {record.hederaTransactionId && (
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <span className="font-mono">{formatHash(record.hederaTransactionId)}</span>
              <button
                onClick={() => navigator.clipboard.writeText(record.hederaTransactionId!).catch(console.error)}
                className="hover:text-gray-600"
              >
                <Copy size={10} />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Link href={`/evidence/${record.id}`} className="flex-1">
            <button className="w-full text-xs border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50">
              View Record
            </button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
