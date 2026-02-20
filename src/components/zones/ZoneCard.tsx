import Link from 'next/link'
import { MapPin, Clock, Activity, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { ZoneStatusBadge } from '@/components/ui/Badge'
import { RiskBar } from '@/components/ui/RiskBar'
import { Button } from '@/components/ui/Button'
import { formatRelativeTime, formatKm } from '@/lib/utils/format'
import type { Zone } from '@/types'

interface ZoneCardProps {
  zone: Zone
}

export function ZoneCard({ zone }: ZoneCardProps) {
  const accentMap = {
    BREACH: 'breach' as const,
    ALERT: 'anomaly' as const,
    ACTIVE: 'intact' as const,
    INACTIVE: 'none' as const,
  }

  return (
    <Card accent={accentMap[zone.status]} className="flex flex-col">
      <CardContent className="flex-1 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 leading-tight">{zone.name}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <MapPin size={11} />
              <span>{zone.region}, {zone.state}</span>
            </div>
          </div>
          <ZoneStatusBadge status={zone.status} />
        </div>

        <div className="flex items-center gap-1 text-xs">
          <Clock size={12} className="text-gray-400" />
          {zone.lastInspectedAt ? (
            <span className={zone.status === 'BREACH' ? 'text-red-600 font-medium' : 'text-gray-500'}>
              {formatRelativeTime(zone.lastInspectedAt)}
            </span>
          ) : (
            <span className="text-gray-400">Not yet inspected</span>
          )}
        </div>

        <RiskBar score={zone.riskScore} />

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="font-bold text-gray-900">{formatKm(zone.lengthKm)}</div>
            <div className="text-gray-500">Total length</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="font-bold text-gray-900">{zone.checkpointCount}</div>
            <div className="text-gray-500">Checkpoints</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Activity size={12} />
            <span>{zone.patrolsThisWeek} patrols this week</span>
          </div>
          {zone.openAlerts > 0 && (
            <div className="flex items-center gap-1 text-amber-600 font-medium">
              <AlertTriangle size={12} />
              <span>{zone.openAlerts} alerts</span>
            </div>
          )}
        </div>

        <Link href={`/zones/${zone.id}`}>
          <Button variant="outline" size="sm" className="w-full">
            View Zone
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
