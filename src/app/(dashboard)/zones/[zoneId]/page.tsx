'use client'
import { notFound } from 'next/navigation'
import { useState } from 'react'
import { getZoneById, getRecordsByZone, getMissionsByZone, DEMO_USERS, getRecordsByMission } from '@/lib/placeholder'
import { ZoneStatusBadge, ConditionBadge, AnchorBadge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RiskBar } from '@/components/ui/RiskBar'
import { EvidenceCard } from '@/components/evidence/EvidenceCard'
import { formatTimestamp, formatKm, formatGPS, formatRelativeTime } from '@/lib/utils/format'
import { MapPin, Users, Shield, AlertTriangle, Activity } from 'lucide-react'
import Link from 'next/link'

type Tab = 'overview' | 'timeline' | 'evidence' | 'incidents'

export default function ZoneDetailPage({ params }: { params: { zoneId: string } }) {
  const zone = getZoneById(params.zoneId)
  if (!zone) notFound()

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const records = getRecordsByZone(zone.id)
  const missions = getMissionsByZone(zone.id)
  const operators = DEMO_USERS.filter(u => zone.assignedOperatorIds.includes(u.id))

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'overview', label: 'Overview' },
    { key: 'timeline', label: 'Inspection Timeline' },
    { key: 'evidence', label: 'Evidence' },
    { key: 'incidents', label: 'Incidents' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/zones" className="text-sm text-gray-500 hover:text-gray-700">← Zones</Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{zone.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <ZoneStatusBadge status={zone.status} />
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin size={12} /> {zone.region}, {zone.state}
            </span>
          </div>
        </div>
        <Button>
          <Shield size={14} />
          Start Patrol
        </Button>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-forest-600 text-forest-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Patrols', value: missions.filter(m => m.status === 'COMPLETED').length },
              { label: 'Anomalies (30d)', value: records.filter(r => r.condition === 'ANOMALY').length },
              { label: 'Breaches (30d)', value: records.filter(r => r.condition === 'BREACH').length },
              { label: 'Open Alerts', value: zone.openAlerts },
            ].map(({ label, value }) => (
              <Card key={label}>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-gray-900">{value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Zone Metadata</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-500">Region</span><span className="font-medium">{zone.region}</span>
                  <span className="text-gray-500">State</span><span className="font-medium">{zone.state}</span>
                  <span className="text-gray-500">Length</span><span className="font-medium">{formatKm(zone.lengthKm)}</span>
                  <span className="text-gray-500">Checkpoints</span><span className="font-medium">{zone.checkpointCount}</span>
                </div>
                <RiskBar score={zone.riskScore} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Assigned Operators</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {operators.map(op => (
                  <div key={op.id} className="flex items-center gap-2 text-sm">
                    <div className="w-7 h-7 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center text-xs font-bold">
                      {op.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{op.name}</div>
                      {op.hederaAccountId && <div className="text-xs text-gray-400">{op.hederaAccountId}</div>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Recent Missions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {missions.slice(0, 3).map(mission => {
                const operator = DEMO_USERS.find(u => u.id === mission.operatorId)
                return (
                  <div key={mission.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{mission.id}</div>
                      <div className="text-xs text-gray-500">
                        {operator?.name} · {mission.startedAt ? formatRelativeTime(mission.startedAt) : 'Scheduled'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{mission.completedCheckpoints}/{mission.checkpointCount}</div>
                      <div className={`text-xs ${mission.status === 'COMPLETED' ? 'text-green-600' : mission.status === 'IN_PROGRESS' ? 'text-amber-600' : 'text-gray-500'}`}>
                        {mission.status}
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {missions.map(mission => {
            const missionRecords = getRecordsByMission(mission.id)
            const operator = DEMO_USERS.find(u => u.id === mission.operatorId)
            const hasBreaches = missionRecords.some(r => r.condition === 'BREACH')
            const hasAnomalies = missionRecords.some(r => r.condition === 'ANOMALY')
            const accent = hasBreaches ? 'breach' : hasAnomalies ? 'anomaly' : 'intact'
            return (
              <Card key={mission.id} accent={accent}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{mission.startedAt ? formatTimestamp(mission.startedAt) : 'Scheduled'}</div>
                      <div className="text-sm text-gray-500">{operator?.name} · {mission.completedCheckpoints}/{mission.checkpointCount} checkpoints</div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      mission.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      mission.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                    }`}>{mission.status}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {missionRecords.map(r => (
                      <Link key={r.id} href={`/evidence/${r.id}`}>
                        <ConditionBadge condition={r.condition} />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {activeTab === 'evidence' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.slice(0, 12).map(record => {
            const cp = zone.checkpoints.find(c => c.id === record.checkpointId)
            return <EvidenceCard key={record.id} record={record} checkpointName={cp?.name} zoneName={zone.name} />
          })}
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="text-gray-500 text-center py-12">
          <Link href="/incidents" className="text-forest-600 hover:underline">View all incidents →</Link>
        </div>
      )}
    </div>
  )
}
