'use client'
import { useState, useEffect } from 'react'
import { DEMO_ALERTS } from '@/lib/placeholder'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatRelativeTime } from '@/lib/utils/format'
import { CheckCheck, Bell } from 'lucide-react'
import type { Alert } from '@/types'
import Link from 'next/link'

const alertIcon: Record<Alert['type'], string> = {
  BREACH: '🔴',
  ANOMALY: '🟡',
  MISSED_PATROL: '⚪',
  HCS_PENDING: '🔵',
  RESOLVED: '🟢',
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(DEMO_ALERTS)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const acknowledge = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a))
  }

  const acknowledgeAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })))
  }

  const unacknowledged = alerts.filter(a => !a.acknowledged)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unacknowledged.length} unacknowledged · Auto-refreshes every 30s · Last: {formatRelativeTime(lastRefresh.toISOString())}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={acknowledgeAll}>
          <CheckCheck size={14} />
          Acknowledge All
        </Button>
      </div>

      <div className="space-y-3">
        {alerts.map(alert => (
          <Card key={alert.id} className={alert.acknowledged ? 'opacity-60' : ''}>
            <CardContent className="py-3">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{alertIcon[alert.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{alert.message}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{formatRelativeTime(alert.timestamp)}</span>
                    {alert.zoneId && (
                      <Link href={`/zones/${alert.zoneId}`} className="text-xs text-forest-600 hover:underline">
                        View Zone
                      </Link>
                    )}
                    {alert.recordId && (
                      <Link href={`/evidence/${alert.recordId}`} className="text-xs text-forest-600 hover:underline">
                        View Evidence
                      </Link>
                    )}
                  </div>
                </div>
                {!alert.acknowledged && (
                  <Button variant="ghost" size="sm" onClick={() => acknowledge(alert.id)}>
                    Acknowledge
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
