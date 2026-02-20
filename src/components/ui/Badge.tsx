import { cn } from '@/lib/utils/cn'
import type { CheckpointCondition, AnchorStatus, ZoneStatus } from '@/types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'
  className?: string
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'default', className, size = 'sm' }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center font-semibold rounded-full border',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      {
        'bg-gray-100 text-gray-800 border-gray-200': variant === 'default',
        'bg-green-100 text-green-800 border-green-200': variant === 'success',
        'bg-amber-100 text-amber-800 border-amber-200': variant === 'warning',
        'bg-red-100 text-red-800 border-red-200': variant === 'danger',
        'bg-teal-100 text-teal-800 border-teal-200': variant === 'info',
        'bg-gray-50 text-gray-500 border-gray-100': variant === 'muted',
      },
      className
    )}>
      {children}
    </span>
  )
}

export function ConditionBadge({ condition }: { condition: CheckpointCondition }) {
  const map = {
    INTACT: { variant: 'success' as const, label: '● INTACT' },
    ANOMALY: { variant: 'warning' as const, label: '◆ ANOMALY' },
    BREACH: { variant: 'danger' as const, label: '✕ BREACH' },
  }
  const { variant, label } = map[condition]
  return <Badge variant={variant}>{label}</Badge>
}

export function AnchorBadge({ status }: { status: AnchorStatus }) {
  const map = {
    ANCHORED: { variant: 'info' as const, label: 'ANCHORED ✓' },
    PENDING: { variant: 'warning' as const, label: 'PENDING...' },
    FAILED: { variant: 'danger' as const, label: 'FAILED ✕' },
  }
  const { variant, label } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function ZoneStatusBadge({ status }: { status: ZoneStatus }) {
  const map = {
    ACTIVE: { variant: 'success' as const },
    ALERT: { variant: 'warning' as const },
    BREACH: { variant: 'danger' as const },
    INACTIVE: { variant: 'muted' as const },
  }
  return <Badge variant={map[status].variant}>{status}</Badge>
}
