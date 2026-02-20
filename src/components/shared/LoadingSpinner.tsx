import { cn } from '@/lib/utils/cn'

export function LoadingSpinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={cn(
      'animate-spin rounded-full border-2 border-gray-200 border-t-forest-600',
      { 'w-4 h-4': size === 'sm', 'w-6 h-6': size === 'md', 'w-10 h-10': size === 'lg' },
      className
    )} />
  )
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner size="lg" />
    </div>
  )
}
