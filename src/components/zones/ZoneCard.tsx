import Link from 'next/link'
import { BoundaryZone } from '@/types/zone.types'
import { Card, CardContent } from '@/components/ui/card'
import { ZoneStatusBadge } from './ZoneStatusBadge'
import { formatRelative, formatDistance } from '@/lib/utils/format'
import { MapPin, Activity } from 'lucide-react'

interface ZoneCardProps {
  zone: BoundaryZone
}

export function ZoneCard({ zone }: ZoneCardProps) {
  return (
    <Link href={`/zones/${zone.id}`}>
      <Card className="hover:border-green-700/40 transition-colors cursor-pointer">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold text-[#F0EBDC]">{zone.name}</div>
              <div className="text-xs text-[#786E5F] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {zone.region}, {zone.state}
              </div>
            </div>
            <ZoneStatusBadge status={zone.status} />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#0E0A04] rounded p-2">
              <div className="text-sm font-bold text-[#F0EBDC]">{formatDistance(zone.totalLengthKm)}</div>
              <div className="text-[10px] text-[#786E5F]">Length</div>
            </div>
            <div className="bg-[#0E0A04] rounded p-2">
              <div className="text-sm font-bold text-[#F0EBDC]">{zone.checkpointCount}</div>
              <div className="text-[10px] text-[#786E5F]">Checkpoints</div>
            </div>
            <div className="bg-[#0E0A04] rounded p-2">
              <div className={`text-sm font-bold ${zone.riskScore > 70 ? 'text-red-400' : zone.riskScore > 40 ? 'text-amber-400' : 'text-green-400'}`}>
                {zone.riskScore}
              </div>
              <div className="text-[10px] text-[#786E5F]">Risk</div>
            </div>
          </div>
          {zone.lastInspectedAt && (
            <div className="text-xs text-[#786E5F] flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Last inspected {formatRelative(zone.lastInspectedAt)}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
