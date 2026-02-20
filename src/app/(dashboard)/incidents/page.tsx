import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { AlertTriangle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function IncidentsPage() {
  return (
    <div>
      <PageHeader
        title="Incidents"
        description="Reported boundary breaches and anomalies"
        actions={
          <Link href="/incidents/report">
            <Button size="sm"><Plus className="w-4 h-4 mr-2" />Report Incident</Button>
          </Link>
        }
      />
      <EmptyState
        icon={AlertTriangle}
        title="No incidents reported"
        description="No boundary incidents have been filed yet. Report a new incident if you detect a breach."
      />
    </div>
  )
}
