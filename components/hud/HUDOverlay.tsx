"use client";

import Link from "next/link";
import { RadarMinimap } from "./RadarMinimap";
import { DroneRoster } from "./DroneRoster";
import { BreachCounter } from "./BreachCounter";
import { VoiceInputIndicator } from "./VoiceInputIndicator";
import { OperatorStatus } from "./OperatorStatus";
import { useWorldStore } from "@/stores/worldStore";
import { useUIStore } from "@/stores/uiStore";
import type { DroneRecord } from "../world/WorldOrchestrator";

interface HUDOverlayProps {
  drones?: DroneRecord[];
}

export function HUDOverlay({ drones = [] }: HUDOverlayProps) {
  const thermalMode = useWorldStore((state) => state.thermalMode);
  const voiceInput = useUIStore((state) => state.voiceInput);
  const breachCount = useUIStore((state) => state.breachCount);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-10"
      style={{ fontFamily: "Rajdhani, sans-serif" }}
    >
      {/* Top Left */}
      <div className="absolute top-6 left-6 space-y-3">
        <div className="space-y-1">
          <div className="text-[#00f5ff] text-xs font-bold tracking-[0.3em] uppercase">
            CAIRN
          </div>
          <div className="text-white/60 text-[9px] font-mono tracking-wider">
            AIRSPACE REGISTRY // HEDERA TESTNET
          </div>
        </div>

        {/* Quick Access Menu */}
        <div className="space-y-1 pointer-events-auto">
          <div className="text-[#8b5cf6]/60 text-[9px] font-bold tracking-widest mb-2">
            QUICK ACCESS
          </div>
          <Link
            href="/dashboard"
            className="block px-3 py-1.5 bg-[#0a1628]/80 hover:bg-[#8b5cf6]/20 border border-white/10 hover:border-[#8b5cf6]/50 rounded text-white/70 hover:text-[#8b5cf6] text-[10px] font-mono tracking-wider transition-all duration-200"
          >
            → Dashboard
          </Link>
          <Link
            href="/register"
            className="block px-3 py-1.5 bg-[#0a1628]/80 hover:bg-[#00f5ff]/20 border border-white/10 hover:border-[#00f5ff]/50 rounded text-white/70 hover:text-[#00f5ff] text-[10px] font-mono tracking-wider transition-all duration-200"
          >
            → Register Drone
          </Link>
          <Link
            href="/analyse-drone"
            className="block px-3 py-1.5 bg-[#0a1628]/80 hover:bg-[#10b981]/20 border border-white/10 hover:border-[#10b981]/50 rounded text-white/70 hover:text-[#10b981] text-[10px] font-mono tracking-wider transition-all duration-200"
          >
            → Analyse Drone
          </Link>
          <Link
            href="/analysis"
            className="block px-3 py-1.5 bg-[#0a1628]/80 hover:bg-[#f59e0b]/20 border border-white/10 hover:border-[#f59e0b]/50 rounded text-white/70 hover:text-[#f59e0b] text-[10px] font-mono tracking-wider transition-all duration-200"
          >
            → Analysis Reports
          </Link>
        </div>
      </div>

      {/* Top Right */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-3">
        {/* Navigation Menu */}
        <div className="flex gap-2 pointer-events-auto">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/40 border border-[#8b5cf6]/50 hover:border-[#8b5cf6] rounded text-[#8b5cf6] hover:text-white text-[11px] font-bold tracking-widest uppercase transition-all duration-200"
          >
            Dashboard
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-[#00f5ff]/20 hover:bg-[#00f5ff]/40 border border-[#00f5ff]/50 hover:border-[#00f5ff] rounded text-[#00f5ff] hover:text-white text-[11px] font-bold tracking-widest uppercase transition-all duration-200"
          >
            Register Drone
          </Link>
        </div>

        <OperatorStatus />
        {thermalMode && (
          <div className="inline-block px-3 py-1 bg-[#e94560]/20 border border-[#e94560]/50 rounded text-[#e94560] text-[10px] font-bold tracking-widest">
            THERMAL MODE ACTIVE
          </div>
        )}
      </div>

      {/* Bottom Left */}
      <div className="absolute bottom-6 left-6">
        <RadarMinimap />
      </div>

      {/* Bottom Right */}
      <div className="absolute bottom-6 right-6">
        <DroneRoster drones={drones} />
      </div>

      {/* Center Bottom */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <BreachCounter count={breachCount} />
      </div>

      {/* Voice Input Indicator */}
      {voiceInput.isListening && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <VoiceInputIndicator />
        </div>
      )}
    </div>
  );
}
