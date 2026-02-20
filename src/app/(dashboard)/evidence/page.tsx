import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { FileText } from 'lucide-react'

export default function EvidencePage() {
  return (
    <div>
      <PageHeader
        title="Evidence Vault"
        description="All HCS-anchored inspection records"
      />
      <EmptyState
        icon={FileText}
        title="No evidence records"
        description="Evidence records will appear here once patrol missions are conducted and anchored to the Hedera Consensus Service."
      />
    </div>
  )
}
