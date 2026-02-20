import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Scale } from 'lucide-react'

export default function DisputesPage() {
  return (
    <div>
      <PageHeader title="Disputes" description="Active boundary dispute cases" />
      <EmptyState
        icon={Scale}
        title="No active disputes"
        description="No boundary disputes have been filed. Disputes can reference evidence records for resolution."
      />
    </div>
  )
}
