import { cn } from '@/lib/utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn('border-2 border-[#3C3223] border-t-green-500 rounded-full animate-spin', sizes[size])} />
    </div>
  )
}
