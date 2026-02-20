import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PatrolPage() {
  return (
    <div>
      <PageHeader
        title="Patrol Missions"
        description="Active and scheduled boundary patrol operations"
        actions={<Button size="sm"><Navigation className="w-4 h-4 mr-2" />Start Patrol</Button>}
      />
      <EmptyState
        icon={Navigation}
        title="No active patrol missions"
        description="No patrol missions are currently scheduled. Create a mission to begin boundary inspection."
      />
    </div>
  )
}
