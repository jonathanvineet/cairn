import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/analytics/StatCard'
import { Shield, MapPin, Navigation, AlertTriangle, FileText, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of boundary inspection evidence system"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Boundary Zones" value="—" icon={MapPin} variant="green" />
        <StatCard title="Active Missions" value="—" icon={Navigation} variant="teal" />
        <StatCard title="Open Incidents" value="—" icon={AlertTriangle} variant="amber" />
        <StatCard title="Evidence Records" value="—" icon={FileText} variant="default" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-green-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'No recent activity', sub: 'Start by creating a boundary zone', type: 'info' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-[#241808] last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#786E5F] mt-2 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-[#B4AA96]">{item.label}</div>
                    <div className="text-xs text-[#786E5F]">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* HCS Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-teal-500" />
              Hedera Consensus Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#786E5F]">Network</span>
              <Badge variant="teal">Testnet</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#786E5F]">Inspection Topic</span>
              <span className="font-mono text-xs text-[#B4AA96]">Not configured</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#786E5F]">Alert Topic</span>
              <span className="font-mono text-xs text-[#B4AA96]">Not configured</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#786E5F]">Wallet</span>
              <Badge variant="secondary">Not connected</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
