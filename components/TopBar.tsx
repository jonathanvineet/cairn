"use client";

import { usePathname } from "next/navigation";
import { Bell, Leaf } from "lucide-react";

function buildBreadcrumb(pathname: string): string {
  const segments = pathname.replace(/^\//, "").split("/");
  return segments
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " "))
    .join(" / ");
}

export default function TopBar() {
  const pathname = usePathname();
  const breadcrumb = buildBreadcrumb(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-white/10 bg-[#0a1a0f]/80 backdrop-blur px-6">
      <span className="text-sm text-gray-400">{breadcrumb}</span>
      <div className="flex items-center gap-4">
        <button className="relative text-gray-400 hover:text-white transition">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black">
            3
          </span>
        </button>
        <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1">
          <Leaf className="h-3.5 w-3.5 text-green-400" />
          <span className="text-xs font-mono text-green-400">0.0.4821904</span>
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
        </div>
      </div>
    </header>
  );
}
