'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Bell } from 'lucide-react'
import { useAlertStore } from '@/stores/alertStore'

export default function AlertsPage() {
  const { alerts } = useAlertStore()

  return (
    <div>
      <PageHeader title="Alert Feed" description="Anomaly detections and breach notifications" />
      {alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts"
          description="Alert notifications will appear here when anomalies or breaches are detected during patrols."
        />
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-4 rounded border ${alert.read ? 'border-[#3C3223] bg-[#1C140A]' : 'border-amber-700/40 bg-amber-900/10'}`}>
              <div className="text-sm text-[#F0EBDC]">{alert.message}</div>
              <div className="text-xs text-[#786E5F] mt-1">{new Date(alert.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
