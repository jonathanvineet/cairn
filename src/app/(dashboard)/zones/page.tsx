'use client'
import { useState, useMemo } from 'react'
import { DEMO_ZONES } from '@/lib/placeholder'
import { ZoneCard } from '@/components/zones/ZoneCard'
import { Button } from '@/components/ui/Button'
import { Plus, Search } from 'lucide-react'
import type { ZoneStatus } from '@/types'

const STATES = ['All States', 'Tamil Nadu', 'Kerala', 'Karnataka']
const STATUSES: Array<{ value: ZoneStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ALERT', label: 'Alert' },
  { value: 'BREACH', label: 'Breach' },
  { value: 'INACTIVE', label: 'Inactive' },
]
type SortKey = 'lastInspected' | 'riskScore' | 'name'

export default function ZonesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ZoneStatus | 'ALL'>('ALL')
  const [stateFilter, setStateFilter] = useState('All States')
  const [sortBy, setSortBy] = useState<SortKey>('riskScore')

  const filtered = useMemo(() => {
    let zones = [...DEMO_ZONES]
    if (search) {
      const q = search.toLowerCase()
      zones = zones.filter(z => z.name.toLowerCase().includes(q) || z.region.toLowerCase().includes(q))
    }
    if (statusFilter !== 'ALL') zones = zones.filter(z => z.status === statusFilter)
    if (stateFilter !== 'All States') zones = zones.filter(z => z.state === stateFilter)
    zones.sort((a, b) => {
      if (sortBy === 'riskScore') return b.riskScore - a.riskScore
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'lastInspected') {
        return new Date(b.lastInspectedAt ?? 0).getTime() - new Date(a.lastInspectedAt ?? 0).getTime()
      }
      return 0
    })
    return zones
  }, [search, statusFilter, stateFilter, sortBy])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Boundary Zones</h1>
          <p className="text-sm text-gray-500 mt-1">{DEMO_ZONES.length} zones monitored</p>
        </div>
        <Button size="sm">
          <Plus size={14} />
          Add New Zone
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or region..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
        </div>
        <div className="flex gap-1">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s.value
                  ? 'bg-forest-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <select
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
        >
          {STATES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortKey)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
        >
          <option value="riskScore">Sort: Risk Score</option>
          <option value="lastInspected">Sort: Last Inspected</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No zones match the current filters</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(zone => <ZoneCard key={zone.id} zone={zone} />)}
        </div>
      )}
    </div>
  )
}
