'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Shield, 
  LayoutDashboard, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  FileText, 
  Scale, 
  BarChart3, 
  Bell, 
  Wallet, 
  Settings,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/zones', label: 'Boundary Zones', icon: MapPin },
  { href: '/patrol', label: 'Patrol Missions', icon: Navigation },
  { href: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { href: '/evidence', label: 'Evidence Vault', icon: FileText },
  { href: '/disputes', label: 'Disputes', icon: Scale },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/wallet', label: 'Wallet / HCS', icon: Wallet },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#1C140A] border-r border-[#3C3223] min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[#3C3223]">
        <Shield className="w-7 h-7 text-green-500 flex-shrink-0" />
        <div>
          <div className="font-bold text-sm tracking-wide text-[#F0EBDC]">BOUNDARY TRUTH</div>
          <div className="text-[10px] text-[#786E5F] uppercase tracking-wider">Evidence Infrastructure</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors',
                isActive
                  ? 'bg-green-900/40 text-green-300 font-medium'
                  : 'text-[#B4AA96] hover:bg-[#241808] hover:text-[#F0EBDC]'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
              {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Network indicator */}
      <div className="px-4 py-3 border-t border-[#3C3223]">
        <div className="flex items-center gap-2 text-xs text-[#786E5F]">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          Hedera Testnet
        </div>
      </div>
    </aside>
  )
}
