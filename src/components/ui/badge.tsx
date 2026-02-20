import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-green-700/50 bg-green-900/40 text-green-300',
        secondary: 'border-[#3C3223] bg-[#241808] text-[#B4AA96]',
        destructive: 'border-red-700/50 bg-red-900/40 text-red-300',
        outline: 'border-[#3C3223] text-[#B4AA96]',
        amber: 'border-amber-700/50 bg-amber-900/40 text-amber-300',
        teal: 'border-teal-700/50 bg-teal-900/40 text-teal-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
