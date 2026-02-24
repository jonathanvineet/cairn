"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const InteractiveMap = dynamic(
  () => import("@/components/InteractiveMap").then((mod) => mod.InteractiveMap),
  { ssr: false }
);

export default function DeployPage() {
  return (
    <div className="h-screen w-screen bg-forest-900 flex flex-col">
      {/* Minimal header */}
      <header className="border-b border-green-500/20 glass-dark backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-lg font-bold text-green-400">Deploy Mission</h1>
        <div className="w-24"></div> {/* Spacer for centering */}
      </header>
      
      {/* Full map */}
      <div className="flex-1">
        <InteractiveMap />
      </div>
    </div>
  );
}
