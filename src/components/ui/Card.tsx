import { cn } from '@/lib/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  accent?: 'none' | 'breach' | 'anomaly' | 'intact' | 'hedera'
}

export function Card({ children, className, accent = 'none' }: CardProps) {
  return (
    <div className={cn(
      'bg-white rounded-xl border shadow-sm',
      {
        'border-gray-200': accent === 'none',
        'border-l-4 border-l-red-500 border-gray-200': accent === 'breach',
        'border-l-4 border-l-amber-500 border-gray-200': accent === 'anomaly',
        'border-l-4 border-l-green-500 border-gray-200': accent === 'intact',
        'border-l-4 border-l-teal-500 border-gray-200': accent === 'hedera',
      },
      className
    )}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 py-4 border-b border-gray-100', className)}>{children}</div>
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('font-semibold text-gray-900', className)}>{children}</h3>
}
