import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { Plus, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function ZonesPage() {
  return (
    <div>
      <PageHeader
        title="Boundary Zones"
        description="All enrolled forest and plantation boundary zones"
        actions={
          <Link href="/zones/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Zone
            </Button>
          </Link>
        }
      />
      <EmptyState
        icon={MapPin}
        title="No boundary zones configured"
        description="Create your first boundary zone to start logging inspection evidence."
        action={
          <Link href="/zones/new">
            <Button>Create Zone</Button>
          </Link>
        }
      />
    </div>
  )
}
