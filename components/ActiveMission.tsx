"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMissionStore } from "@/stores/missionStore";
import { Play, Pause, XCircle, Crosshair, Navigation } from "lucide-react";
import { MagneticCard } from "@/components/MagneticCard";
import { RippleButton } from "@/components/RippleButton";

export function ActiveMission() {
  const {
    status,
    completedCheckpoints,
    totalCheckpoints,
    etaMinutes,
    dronePosition,
    pause,
    resume,
    abort,
    tick,
  } = useMissionStore();

  // Auto-tick every 8 seconds while active
  useEffect(() => {
    if (status !== "active") return;
    const interval = setInterval(tick, 8000);
    return () => clearInterval(interval);
  }, [status, tick]);

  const pct = (completedCheckpoints / totalCheckpoints) * 100;

  return (
    <MagneticCard strength={0.2} breathe={status === "active"}>
      <Card
        className={`glass-strong border-2 relative overflow-hidden ${
          status === "active"
            ? "border-green-500/40 shadow-lg shadow-green-500/20"
            : "border-white/10"
        }`}
      >
        {/* Gradient overlay for active missions */}
        {status === "active" && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10 opacity-60" />
        )}

        <CardHeader className="flex flex-row items-center justify-between relative z-10">
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={
                status === "active"
                  ? { rotate: [0, 360] }
                  : {}
              }
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Crosshair className="h-5 w-5 text-green-400" />
            </motion.div>
            <span>Active Mission</span>
          </CardTitle>
          <Badge
            variant={
              status === "active"
                ? "intact"
                : status === "paused"
                ? "anomaly"
                : status === "completed"
                ? "info"
                : "breach"
            }
            className="text-xs"
          >
            {status === "active" && (
              <span className="relative flex h-2 w-2 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
            )}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {/* Mini-map */}
        <div className="relative h-40 rounded-lg bg-forest-800/80 border-2 border-green-500/20 overflow-hidden backdrop-blur-sm">
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(34,197,94,0.12)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* Fence path */}
            <polyline
              points="10,120 30,90 60,70 100,50 140,45 180,55 220,40 260,50 290,70"
              fill="none"
              stroke="rgba(139,69,19,0.7)"
              strokeWidth="3"
              strokeDasharray="6,3"
            />
            {/* Checkpoint dots */}
            {[
              [30, 90], [60, 70], [100, 50], [140, 45],
              [180, 55], [220, 40], [260, 50],
            ].map(([cx, cy], i) => (
              <g key={i}>
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={i < completedCheckpoints ? 6 : 4}
                  fill={i < completedCheckpoints ? "#22c55e" : "#374151"}
                  stroke={i < completedCheckpoints ? "#22c55e" : "#6b7280"}
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
                {i < completedCheckpoints && (
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r="10"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="1"
                    opacity="0.3"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Drone icon with breathing glow */}
          {status !== "aborted" && (
            <motion.div
              className="absolute"
              animate={{
                left: `${Math.min(90, Math.max(5, dronePosition.x))}%`,
                top: `${Math.min(80, Math.max(10, dronePosition.y))}%`,
              }}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
            >
              <motion.div
                animate={
                  status === "active"
                    ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }
                    : {}
                }
                transition={{ duration: 2, repeat: Infinity }}
                className="relative"
              >
                <Navigation className="h-6 w-6 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)] -rotate-45" />
                {status === "active" && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-green-400/30 blur-md"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Label */}
          <div className="absolute bottom-2 left-2 text-[10px] text-gray-500 font-mono">
            Wayanad Zone — Sector B
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            <motion.span
              className="text-white font-bold text-lg"
              key={completedCheckpoints}
              initial={{ scale: 1.5, color: "#4ade80" }}
              animate={{ scale: 1, color: "#ffffff" }}
              transition={{ duration: 0.5 }}
            >
              {completedCheckpoints}
            </motion.span>
            /{totalCheckpoints} checkpoints
          </span>
          <span className="text-gray-400">
            ETA: <span className="text-white font-bold">{etaMinutes}min</span>
          </span>
        </div>

        <Progress value={completedCheckpoints} max={totalCheckpoints} />

        {/* Controls */}
        <div className="flex gap-2">
          {status === "active" ? (
            <RippleButton
              onClick={pause}
              className="flex-1 h-10 px-4 rounded-lg border border-white/20 bg-transparent text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
            >
              <Pause className="h-4 w-4" />
              Pause
            </RippleButton>
          ) : status === "paused" ? (
            <RippleButton
              onClick={resume}
              className="flex-1 h-10 px-4 rounded-lg bg-green-500 text-black hover:bg-green-400 shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
            >
              <Play className="h-4 w-4" />
              Resume
            </RippleButton>
          ) : null}

          {(status === "active" || status === "paused") && (
            <RippleButton
              onClick={abort}
              className="flex-1 h-10 px-4 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
            >
              <XCircle className="h-4 w-4" />
              Abort
            </RippleButton>
          )}

          {status === "completed" && (
            <Badge variant="intact" className="w-full justify-center py-3 text-sm">
              ✅ Mission Complete — All checkpoints inspected
            </Badge>
          )}

          {status === "aborted" && (
            <Badge variant="breach" className="w-full justify-center py-3 text-sm">
              Mission Aborted
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
    </MagneticCard>
  );
}
