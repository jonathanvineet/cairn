"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Leaf,
  LayoutDashboard,
  Bell,
  Map,
  BarChart3,
  Navigation,
  History,
  MapPin,
  FolderLock,
  AlertTriangle,
  Gavel,
  Settings,
  Globe,
  Users,
  Wallet,
  LogOut,
} from "lucide-react";

const user = { name: "Arjun Mehta", role: "SUPER_ADMIN", avatar: "AM" };
const walletId = "0.0.4821904";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
  roles?: string[];
}

const navSections: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard" },
      { href: "/dashboard/alerts", icon: <Bell className="h-4 w-4" />, label: "Alerts", badge: 3 },
    ],
  },
  {
    title: "BOUNDARY ZONES",
    items: [
      { href: "/dashboard/zones", icon: <Map className="h-4 w-4" />, label: "All Zones" },
      { href: "/dashboard/analytics", icon: <BarChart3 className="h-4 w-4" />, label: "Analytics" },
    ],
  },
  {
    title: "OPERATIONS",
    roles: ["OPERATOR", "RANGER", "SUPER_ADMIN"],
    items: [
      { href: "/dashboard/patrol/active", icon: <Navigation className="h-4 w-4" />, label: "Active Patrol" },
      { href: "/dashboard/patrol/history", icon: <History className="h-4 w-4" />, label: "Patrol History" },
      { href: "/dashboard/checkpoints", icon: <MapPin className="h-4 w-4" />, label: "Checkpoints" },
    ],
  },
  {
    title: "EVIDENCE",
    items: [
      { href: "/dashboard/evidence", icon: <FolderLock className="h-4 w-4" />, label: "Evidence Vault" },
      { href: "/dashboard/incidents", icon: <AlertTriangle className="h-4 w-4" />, label: "Incidents" },
      { href: "/dashboard/disputes", icon: <Gavel className="h-4 w-4" />, label: "Disputes" },
    ],
  },
  {
    title: "ADMIN",
    roles: ["SUPER_ADMIN"],
    items: [
      { href: "/dashboard/settings", icon: <Settings className="h-4 w-4" />, label: "Settings" },
      { href: "/dashboard/zone-management", icon: <Globe className="h-4 w-4" />, label: "Zone Management" },
      { href: "/dashboard/users", icon: <Users className="h-4 w-4" />, label: "User Management" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const visibleSections = navSections.filter(
    (s) => !s.roles || s.roles.includes(user.role)
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-[#0d1f12] border-r border-white/10">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <Leaf className="h-6 w-6 text-green-400" />
        <span className="text-base font-bold text-white">BoundaryTruth</span>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm font-semibold">
            {user.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold bg-green-500/20 text-green-400">
              {user.role}
            </span>
          </div>
        </div>
        {/* Wallet status */}
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-xs text-gray-400 font-mono">{walletId}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {visibleSections.map((section) => (
          <div key={section.title}>
            <p className="px-2 mb-1 text-[10px] font-semibold tracking-wider text-gray-600">
              {section.title}
            </p>
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-green-500/15 text-green-400"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {item.icon}
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-white/10 px-3 py-3 space-y-1">
        <Link
          href="/dashboard/wallet"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition"
        >
          <Wallet className="h-4 w-4" />
          Wallet
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-red-400 transition"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
