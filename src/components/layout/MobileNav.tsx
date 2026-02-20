'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { Map, Shield, Camera, Archive, AlertTriangle } from 'lucide-react'

const mobileNavItems = [
  { href: '/zones', label: 'Zones', icon: Map },
  { href: '/patrol', label: 'Patrol', icon: Shield },
  { href: '/checkpoints/submit', label: 'Capture', icon: Camera },
  { href: '/evidence', label: 'Evidence', icon: Archive },
  { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex">
        {mobileNavItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/') && (pathname.length === href.length || pathname[href.length] === '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center py-2 text-xs',
                active ? 'text-forest-700' : 'text-gray-500'
              )}
            >
              <Icon size={20} />
              <span className="mt-0.5">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
