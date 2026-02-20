import { notFound } from 'next/navigation'
import { getIncidentById, getZoneById, getRecordById, getCheckpointById } from '@/lib/placeholder'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConditionBadge, AnchorBadge } from '@/components/ui/Badge'
import { formatTimestamp, formatRelativeTime } from '@/lib/utils/format'
import { AlertTriangle, FileText, Archive } from 'lucide-react'
import Link from 'next/link'
import type { IncidentStatus } from '@/types'

const statusConfig: Record<IncidentStatus, { variant: 'danger' | 'warning' | 'success' | 'info' }> = {
  OPEN: { variant: 'danger' },
  UNDER_REVIEW: { variant: 'warning' },
  RESOLVED: { variant: 'success' },
  DISPUTED: { variant: 'info' },
}

export default function IncidentDetailPage({ params }: { params: { incidentId: string } }) {
  const incident = getIncidentById(params.incidentId)
  if (!incident) notFound()

  const zone = getZoneById(incident.zoneId)
  const linkedRecords = incident.linkedRecordIds.map(id => getRecordById(id)).filter(Boolean)
  const { variant } = statusConfig[incident.status]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/incidents" className="text-sm text-gray-500 hover:text-gray-700">← Incidents</Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold text-gray-900">{incident.id}</h1>
            <Badge variant={variant}>{incident.status.replace('_', ' ')}</Badge>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {incident.type.replace('_', ' ')} · {zone?.name} · {formatRelativeTime(incident.reportedAt)}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><FileText size={14} /> Generate Package</Button>
          <Button variant="outline" size="sm"><Archive size={14} /> File Dispute</Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-gray-900 mb-1">Incident Summary</div>
              <p className="text-sm text-gray-700">{incident.description}</p>
              {incident.damageEstimate && (
                <div className="mt-2 text-sm text-gray-500">
                  Estimated damage: <span className="font-semibold text-gray-900">₹{incident.damageEstimate.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card accent="breach">
        <CardHeader>
          <CardTitle>Evidence Chain</CardTitle>
          <p className="text-xs text-gray-500 mt-1">Pre-incident inspection timeline proving when anomaly first appeared</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {linkedRecords.map((record) => {
            if (!record) return null
            const cp = getCheckpointById(record.checkpointId)
            return (
              <div key={record.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-400 w-28 shrink-0">
                    {formatTimestamp(record.capturedAt)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{cp?.name ?? record.checkpointId}</div>
                    <ConditionBadge condition={record.condition} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AnchorBadge status={record.anchorStatus} />
                  <Link href={`/evidence/${record.id}`} className="text-xs text-forest-600 hover:underline">
                    {record.id}
                  </Link>
                </div>
              </div>
            )
          })}
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
            <span className="font-bold text-red-700">INCIDENT DATE: </span>
            <span className="text-red-700">{formatTimestamp(incident.reportedAt)} — Breach reported</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
