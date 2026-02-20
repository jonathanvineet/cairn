'use client'
import { useState } from 'react'
import { DEMO_INCIDENTS, getZoneById } from '@/lib/placeholder'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatTimestamp, formatRelativeTime } from '@/lib/utils/format'
import Link from 'next/link'
import { Plus, AlertTriangle } from 'lucide-react'
import type { IncidentStatus } from '@/types'

const statusConfig: Record<IncidentStatus, { variant: 'danger' | 'warning' | 'success' | 'info'; label: string }> = {
  OPEN: { variant: 'danger', label: 'OPEN' },
  UNDER_REVIEW: { variant: 'warning', label: 'UNDER REVIEW' },
  RESOLVED: { variant: 'success', label: 'RESOLVED' },
  DISPUTED: { variant: 'info', label: 'DISPUTED' },
}

export default function IncidentsPage() {
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'ALL'>('ALL')

  const filtered = DEMO_INCIDENTS.filter(i => statusFilter === 'ALL' || i.status === statusFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
          <p className="text-sm text-gray-500 mt-1">{DEMO_INCIDENTS.length} incidents recorded</p>
        </div>
        <Button size="sm">
          <Plus size={14} />
          Report Incident
        </Button>
      </div>

      <div className="flex gap-2">
        {(['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISPUTED'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s ? 'bg-forest-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'ALL' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(incident => {
          const zone = getZoneById(incident.zoneId)
          const { variant, label } = statusConfig[incident.status]
          return (
            <Card key={incident.id} accent={incident.status === 'OPEN' ? 'breach' : 'none'}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-red-500" />
                      <span className="font-semibold text-gray-900">{incident.id}</span>
                      <Badge variant={variant}>{label}</Badge>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{incident.type.replace('_', ' ')} · {zone?.name}</div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>{formatRelativeTime(incident.reportedAt)}</div>
                    {incident.damageEstimate && <div className="font-medium text-gray-700">₹{incident.damageEstimate.toLocaleString()}</div>}
                  </div>
                </div>
                <p className="text-sm text-gray-700">{incident.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">{incident.linkedRecordIds.length} linked evidence records</div>
                  <Link href={`/incidents/${incident.id}`}>
                    <Button variant="outline" size="sm">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
