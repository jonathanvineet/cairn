'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, MapPin, Navigation, AlertTriangle, FileText } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const mobileNav = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/zones', label: 'Zones', icon: MapPin },
  { href: '/patrol', label: 'Patrol', icon: Navigation },
  { href: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { href: '/evidence', label: 'Evidence', icon: FileText },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1C140A] border-t border-[#3C3223] z-50">
      <div className="grid grid-cols-5">
        {mobileNav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors',
                isActive ? 'text-green-400' : 'text-[#786E5F]'
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
