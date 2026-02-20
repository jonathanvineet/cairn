import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/analytics/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, MapPin, Navigation, AlertTriangle, Shield } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Boundary inspection trends and risk scores" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Patrols" value="—" icon={Navigation} variant="teal" />
        <StatCard title="Anomalies (30d)" value="—" icon={AlertTriangle} variant="amber" />
        <StatCard title="Breaches (30d)" value="—" icon={AlertTriangle} variant="red" />
        <StatCard title="Evidence Anchored" value="—" icon={Shield} variant="green" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4 text-green-500" />Patrol Frequency</CardTitle></CardHeader>
          <CardContent className="h-48 flex items-center justify-center text-[#786E5F] text-sm">
            Connect boundary zones to view patrol frequency data
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-500" />Zone Risk Scores</CardTitle></CardHeader>
          <CardContent className="h-48 flex items-center justify-center text-[#786E5F] text-sm">
            Configure zones to view risk score trends
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
