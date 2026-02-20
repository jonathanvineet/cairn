import { DEMO_ZONES, DEMO_ALERTS, DEMO_RECORDS, DEMO_INCIDENTS } from '@/lib/placeholder'
import { ZoneStatusBadge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatRelativeTime } from '@/lib/utils/format'
import Link from 'next/link'
import { Map, AlertTriangle, Shield, Archive } from 'lucide-react'

export default function DashboardPage() {
  const activeBreaches = DEMO_ZONES.filter(z => z.status === 'BREACH').length
  const openAlerts = DEMO_ALERTS.filter(a => !a.acknowledged).length
  const pendingRecords = DEMO_RECORDS.filter(r => r.anchorStatus === 'PENDING').length
  const totalPatrols = DEMO_ZONES.reduce((sum, z) => sum + z.patrolsThisWeek, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Forest boundary monitoring overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Breaches', value: activeBreaches, icon: AlertTriangle, color: 'text-red-600 bg-red-50', href: '/zones' },
          { label: 'Open Alerts', value: openAlerts, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50', href: '/alerts' },
          { label: 'Patrols This Week', value: totalPatrols, icon: Shield, color: 'text-green-600 bg-green-50', href: '/patrol' },
          { label: 'Pending Anchors', value: pendingRecords, icon: Archive, color: 'text-teal-600 bg-teal-50', href: '/evidence' },
        ].map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4">
                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
                  <Icon size={20} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Zone Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEMO_ZONES.map(zone => (
              <Link key={zone.id} href={`/zones/${zone.id}`} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-1 -mx-1">
                <div>
                  <div className="text-sm font-medium text-gray-900">{zone.name}</div>
                  <div className="text-xs text-gray-500">{zone.region}, {zone.state}</div>
                </div>
                <ZoneStatusBadge status={zone.status} />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEMO_ALERTS.filter(a => !a.acknowledged).slice(0, 5).map(alert => (
              <div key={alert.id} className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
                <span className="text-lg mt-0.5">
                  {alert.type === 'BREACH' ? '🔴' : alert.type === 'ANOMALY' ? '🟡' : alert.type === 'MISSED_PATROL' ? '⚪' : '🔵'}
                </span>
                <div>
                  <div className="text-sm text-gray-800">{alert.message}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(alert.timestamp)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
