'use client'
import { useState, useMemo } from 'react'
import { DEMO_RECORDS, DEMO_ZONES, getCheckpointById, getZoneById } from '@/lib/placeholder'
import { EvidenceCard } from '@/components/evidence/EvidenceCard'
import { Button } from '@/components/ui/Button'
import { Download, Search } from 'lucide-react'
import type { CheckpointCondition, AnchorStatus } from '@/types'

export default function EvidencePage() {
  const [conditionFilter, setConditionFilter] = useState<CheckpointCondition | 'ALL'>('ALL')
  const [anchorFilter, setAnchorFilter] = useState<AnchorStatus | 'ALL'>('ALL')
  const [zoneFilter, setZoneFilter] = useState('ALL')

  const filtered = useMemo(() => {
    let records = [...DEMO_RECORDS]
    if (conditionFilter !== 'ALL') records = records.filter(r => r.condition === conditionFilter)
    if (anchorFilter !== 'ALL') records = records.filter(r => r.anchorStatus === anchorFilter)
    if (zoneFilter !== 'ALL') records = records.filter(r => r.zoneId === zoneFilter)
    return records.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime())
  }, [conditionFilter, anchorFilter, zoneFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evidence Vault</h1>
          <p className="text-sm text-gray-500 mt-1">{DEMO_RECORDS.length} records total</p>
        </div>
        <Button variant="outline" size="sm">
          <Download size={14} />
          Export
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3">
        <select
          value={zoneFilter}
          onChange={e => setZoneFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="ALL">All Zones</option>
          {DEMO_ZONES.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>

        <div className="flex gap-1">
          {(['ALL', 'INTACT', 'ANOMALY', 'BREACH'] as const).map(c => (
            <button
              key={c}
              onClick={() => setConditionFilter(c)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                conditionFilter === c ? 'bg-forest-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c === 'ALL' ? 'All Conditions' : c}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          {(['ALL', 'ANCHORED', 'PENDING', 'FAILED'] as const).map(a => (
            <button
              key={a}
              onClick={() => setAnchorFilter(a)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                anchorFilter === a ? 'bg-teal-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {a === 'ALL' ? 'All Anchors' : a}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No records match the current filters</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(record => {
            const cp = getCheckpointById(record.checkpointId)
            const zone = getZoneById(record.zoneId)
            return <EvidenceCard key={record.id} record={record} checkpointName={cp?.name} zoneName={zone?.name} />
          })}
        </div>
      )}
    </div>
  )
}
