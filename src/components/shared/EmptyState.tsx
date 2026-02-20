import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-[#1C140A] border border-[#3C3223] rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#786E5F]" />
      </div>
      <h3 className="font-semibold text-[#F0EBDC] mb-2">{title}</h3>
      {description && <p className="text-sm text-[#786E5F] max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  )
}
