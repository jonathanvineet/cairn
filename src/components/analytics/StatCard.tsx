import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: { value: number; label: string }
  variant?: 'default' | 'green' | 'amber' | 'red' | 'teal'
}

export function StatCard({ title, value, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const colorMap = {
    default: 'text-[#F0EBDC]',
    green: 'text-green-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    teal: 'text-teal-400',
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="text-xs text-[#786E5F] uppercase tracking-wider">{title}</div>
          <Icon className={cn('w-4 h-4', colorMap[variant])} />
        </div>
        <div className={cn('text-3xl font-bold', colorMap[variant])}>{value}</div>
        {trend && (
          <div className="text-xs text-[#786E5F] mt-1">
            <span className={trend.value >= 0 ? 'text-green-400' : 'text-red-400'}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </span>
            {' '}{trend.label}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
