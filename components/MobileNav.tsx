"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, Navigation, FolderLock, Menu } from "lucide-react";

const items = [
  { href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "Home" },
  { href: "/dashboard/zones", icon: <Map className="h-5 w-5" />, label: "Zones" },
  { href: "/dashboard/patrol/active", icon: <Navigation className="h-5 w-5" />, label: "Patrol" },
  { href: "/dashboard/evidence", icon: <FolderLock className="h-5 w-5" />, label: "Evidence" },
  { href: "/dashboard/menu", icon: <Menu className="h-5 w-5" />, label: "Menu" },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex border-t border-white/10 bg-[#0d1f12] md:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] transition ${
              active ? "text-green-400" : "text-gray-500 hover:text-white"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
