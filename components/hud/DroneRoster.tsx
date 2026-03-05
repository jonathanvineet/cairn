"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { DroneRecord } from "../world/WorldOrchestrator";

interface DroneRosterProps {
  drones: DroneRecord[];
}

export function DroneRoster({ drones }: DroneRosterProps) {
  // Take only first 8 for display
  const displayDrones = drones.slice(0, 8);
  
  const getBatteryLevel = (drone: DroneRecord) => {
    // Mock battery calculation - in real app, this would come from drone data
    return 75 + Math.random() * 25;
  };
  
  const getBatteryColor = (level: number) => {
    if (level > 50) return "#00f5ff";
    if (level > 20) return "#f59e0b";
    return "#e94560";
  };
  
  return (
    <div className="w-80 max-h-96 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-[#8b5cf6]/30 scrollbar-track-transparent">
      <div className="text-[#8b5cf6] text-[10px] font-bold tracking-widest mb-3">
        ACTIVE PATROL UNITS
      </div>
      
      <AnimatePresence>
        {displayDrones.map((drone, i) => {
          const batteryLevel = getBatteryLevel(drone);
          const batteryColor = getBatteryColor(batteryLevel);
          
          return (
            <motion.div
              key={`${drone.evmAddress}-${drone.registeredAt}`}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex items-center gap-3 px-3 py-2 bg-[#0a1628]/80 border border-white/10 rounded backdrop-blur-sm"
            >
              {/* Plate ID */}
              <div className="flex-1 font-mono text-[11px] text-[#00f5ff] tracking-wider">
                {drone.cairnDroneId}
              </div>
              
              {/* Battery bar */}
              <div className="w-12 h-1.5 bg-black/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${batteryLevel}%`,
                    backgroundColor: batteryColor,
                  }}
                />
              </div>
              
              {/* Status */}
              <div className="flex items-center gap-1">
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: drone.status === "ACTIVE" ? "#10b981" : "#6b7280" }}
                />
                <span className="text-[9px] text-white/60 uppercase tracking-wider">
                  {drone.status === "ACTIVE" ? "PATROL" : "STANDBY"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
