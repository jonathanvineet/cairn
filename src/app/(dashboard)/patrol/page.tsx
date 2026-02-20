'use client'
import { usePatrolStore } from '@/stores/patrolStore'
import { DEMO_ZONES, DEMO_MISSIONS, getZoneById, DEMO_USERS } from '@/lib/placeholder'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatKm, formatGPS } from '@/lib/utils/format'
import Link from 'next/link'
import { Shield, MapPin, AlertCircle, Info, ChevronRight } from 'lucide-react'

export default function PatrolPage() {
  const { activeMission, setActiveMission } = usePatrolStore()

  const assignedZones = DEMO_ZONES.filter(z =>
    z.assignedOperatorIds.includes('user-003') || z.assignedOperatorIds.includes('user-004')
  )

  const handleStartPatrol = (zoneId: string) => {
    const zone = getZoneById(zoneId)
    if (!zone) return
    setActiveMission({
      id: `mission-live-${Date.now()}`,
      zoneId,
      operatorId: 'user-003',
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString(),
      checkpointCount: zone.checkpointCount,
      completedCheckpoints: 0,
      currentCheckpointIndex: 0,
      records: [],
    })
  }

  if (activeMission && activeMission.status === 'IN_PROGRESS') {
    const zone = getZoneById(activeMission.zoneId)
    const currentCp = zone?.checkpoints[activeMission.currentCheckpointIndex ?? 0]
    const progress = Math.round((activeMission.completedCheckpoints / activeMission.checkpointCount) * 100)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Field Operations</h1>
          <p className="text-sm text-green-600 font-medium mt-1">● Active Mission</p>
        </div>

        <Card accent="intact" className="border-2 border-green-300">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold text-lg text-gray-900">{zone?.name}</div>
                <div className="text-sm text-gray-500">{activeMission.id}</div>
              </div>
              <Shield className="text-green-600" size={28} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">
                  Checkpoint {activeMission.completedCheckpoints + 1} of {activeMission.checkpointCount}
                </span>
                <span className="text-gray-500">{progress}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {currentCp && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="font-semibold text-gray-900">{currentCp.name}</div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin size={13} />
                  <span>{formatGPS(currentCp.latitude, currentCp.longitude)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Link href="/checkpoints/submit" className="flex-1">
                <Button className="w-full" size="lg">
                  Capture Checkpoint
                </Button>
              </Link>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">Report Issue</Button>
              <Button variant="danger" size="sm" onClick={() => setActiveMission(null)}>Abort Mission</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Field Operations</h1>
        <p className="text-sm text-gray-500 mt-1">Select a zone to begin patrol</p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-sm text-blue-800">
              <p className="font-semibold">Patrol Rules</p>
              <p>• Do not start patrol if wind &gt; 25 km/h</p>
              <p>• Capture image within 10m of checkpoint GPS coordinates</p>
              <p>• All captures auto-submitted — do not close app mid-mission</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Assigned Zones</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {assignedZones.map(zone => (
            <div key={zone.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <div className="font-medium text-gray-900">{zone.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{formatKm(zone.lengthKm)} · {zone.checkpoints.length} checkpoints</div>
              </div>
              <Button size="sm" onClick={() => handleStartPatrol(zone.id)}>
                Start Patrol
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Scheduled Missions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {DEMO_MISSIONS.filter(m => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS').map(m => {
            const zone = getZoneById(m.zoneId)
            return (
              <div key={m.id} className="flex items-center justify-between text-sm py-2">
                <span className="text-gray-700">{zone?.name ?? m.zoneId}</span>
                <span className="text-gray-500">{m.status}</span>
              </div>
            )
          })}
          {DEMO_MISSIONS.filter(m => m.status === 'SCHEDULED').length === 0 && (
            <div className="text-sm text-gray-400 text-center py-4">No scheduled missions</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
