'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  Map, Shield, Camera, Archive, AlertTriangle,
  BarChart2, Wallet, Home, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/zones', label: 'Zones', icon: Map },
  { href: '/patrol', label: 'Patrol', icon: Shield },
  { href: '/checkpoints/submit', label: 'Capture', icon: Camera },
  { href: '/evidence', label: 'Evidence', icon: Archive },
  { href: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn(
      'h-screen bg-forest-900 text-white flex flex-col transition-all duration-200 hidden md:flex',
      collapsed ? 'w-16' : 'w-56'
    )}>
      <div className="flex items-center justify-between p-4 border-b border-forest-800">
        {!collapsed && (
          <div>
            <span className="font-bold text-white text-lg">cairn</span>
            <p className="text-forest-300 text-xs">Forest Boundary Intelligence</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-forest-800 text-forest-300">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/') && (pathname.length === href.length || pathname[href.length] === '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-forest-700 text-white'
                  : 'text-forest-300 hover:bg-forest-800 hover:text-white'
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-forest-800">
        {!collapsed && (
          <div className="text-xs text-forest-400 text-center">
            Hedera Testnet
          </div>
        )}
      </div>
    </aside>
  )
}
