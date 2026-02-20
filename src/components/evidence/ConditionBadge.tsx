import { Badge } from '@/components/ui/badge'
import { ConditionClassification } from '@/types/inspection.types'

interface ConditionBadgeProps {
  condition: ConditionClassification
}

export function ConditionBadge({ condition }: ConditionBadgeProps) {
  const variants: Record<ConditionClassification, 'default' | 'amber' | 'destructive'> = {
    INTACT: 'default',
    ANOMALY: 'amber',
    BREACH: 'destructive',
  }
  return <Badge variant={variants[condition]}>{condition}</Badge>
}
