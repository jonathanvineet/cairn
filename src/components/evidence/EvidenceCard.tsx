import Link from 'next/link'
import { InspectionRecord } from '@/types/inspection.types'
import { Card, CardContent } from '@/components/ui/card'
import { ConditionBadge } from './ConditionBadge'
import { HederaAnchor } from './HederaAnchor'
import { formatDateTime, formatHash } from '@/lib/utils/format'
import { MapPin, Calendar } from 'lucide-react'

interface EvidenceCardProps {
  record: InspectionRecord
}

export function EvidenceCard({ record }: EvidenceCardProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Link href={`/evidence/${record.id}`} className="font-mono text-xs text-green-400 hover:underline">
            {formatHash(record.id, 6)}
          </Link>
          <ConditionBadge condition={record.condition} />
        </div>
        <div className="space-y-1.5 text-xs text-[#B4AA96]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDateTime(record.capturedAt)}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {record.latitude.toFixed(4)}°N, {record.longitude.toFixed(4)}°E
          </div>
        </div>
        <HederaAnchor
          transactionId={record.hcsTransactionId}
          status={record.anchorStatus}
          timestamp={record.hcsTimestamp}
        />
      </CardContent>
    </Card>
  )
}
