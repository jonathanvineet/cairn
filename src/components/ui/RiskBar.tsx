import { cn } from '@/lib/utils/cn'
import { getRiskLabel } from '@/lib/utils/format'

interface RiskBarProps {
  score: number
  showLabel?: boolean
  className?: string
}

export function RiskBar({ score, showLabel = true, className }: RiskBarProps) {
  const color = score >= 75 ? 'bg-red-500' : score >= 50 ? 'bg-orange-400' : score >= 25 ? 'bg-yellow-400' : 'bg-green-500'
  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>Risk Score</span>
          <span className="font-semibold">{score} — {getRiskLabel(score)}</span>
        </div>
      )}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}
