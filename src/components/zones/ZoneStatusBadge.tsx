import { Badge } from '@/components/ui/badge'
import { ZoneStatus } from '@/types/zone.types'

interface ZoneStatusBadgeProps {
  status: ZoneStatus
}

export function ZoneStatusBadge({ status }: ZoneStatusBadgeProps) {
  const config: Record<ZoneStatus, { variant: 'default' | 'amber' | 'destructive' | 'secondary' | 'teal'; label: string }> = {
    ACTIVE: { variant: 'default', label: 'Active' },
    ALERT: { variant: 'amber', label: 'Alert' },
    BREACH: { variant: 'destructive', label: 'Breach' },
    INACTIVE: { variant: 'secondary', label: 'Inactive' },
    MAINTENANCE: { variant: 'teal', label: 'Maintenance' },
  }
  const { variant, label } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}
