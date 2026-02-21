"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MagneticCard } from "@/components/MagneticCard";
import { Map } from "lucide-react";

export function MapWidget() {
  return (
    <MagneticCard strength={0.15}>
      <Card className="glass-strong border-2 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Map className="h-5 w-5 text-blue-400" />
            </motion.div>
            <span>Fence Map — Wayanad Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
        <div className="relative h-52 sm:h-64 rounded-lg bg-forest-800 border border-white/10 overflow-hidden">
          <svg
            viewBox="0 0 400 200"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background terrain */}
            <defs>
              <pattern id="mapGrid" width="25" height="25" patternUnits="userSpaceOnUse">
                <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(34,197,94,0.06)" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="fenceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B4513" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#cd853f" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8B4513" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <rect width="400" height="200" fill="url(#mapGrid)" />

            {/* Terrain contours */}
            <path d="M 0,160 Q 80,140 160,150 T 320,130 400,145" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="1" />
            <path d="M 0,180 Q 100,165 200,170 T 400,160" fill="none" stroke="rgba(34,197,94,0.08)" strokeWidth="1" />

            {/* Fence line */}
            <polyline
              points="20,150 50,120 90,100 130,80 170,75 210,85 250,70 290,60 330,75 370,90"
              fill="none"
              stroke="url(#fenceGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Fence posts */}
            {[
              [20, 150], [50, 120], [90, 100], [130, 80],
              [170, 75], [210, 85], [250, 70], [290, 60],
              [330, 75], [370, 90],
            ].map(([x, y], i) => (
              <g key={i}>
                <line x1={x} y1={y! - 3} x2={x} y2={y! + 8} stroke="#8B4513" strokeWidth="2" />
              </g>
            ))}

            {/* Checkpoints */}
            {[
              { x: 50, y: 120, status: "intact" },
              { x: 90, y: 100, status: "intact" },
              { x: 130, y: 80, status: "intact" },
              { x: 170, y: 75, status: "anomaly" },
              { x: 210, y: 85, status: "intact" },
              { x: 250, y: 70, status: "breach" },
              { x: 290, y: 60, status: "intact" },
              { x: 330, y: 75, status: "intact" },
            ].map((cp, i) => (
              <g key={i}>
                {cp.status === "breach" && (
                  <circle cx={cp.x} cy={cp.y} r="12" fill="rgba(239,68,68,0.15)" stroke="none">
                    <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                {cp.status === "anomaly" && (
                  <circle cx={cp.x} cy={cp.y} r="10" fill="rgba(245,158,11,0.12)" stroke="none" />
                )}
                <circle
                  cx={cp.x}
                  cy={cp.y}
                  r="5"
                  fill={
                    cp.status === "intact"
                      ? "#22c55e"
                      : cp.status === "anomaly"
                      ? "#f59e0b"
                      : "#ef4444"
                  }
                  stroke="#0a1a0f"
                  strokeWidth="1.5"
                />
                <text
                  x={cp.x}
                  y={cp.y - 10}
                  textAnchor="middle"
                  fill="#9ca3af"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  CP#{i + 1}
                </text>
              </g>
            ))}

            {/* Zone label */}
            <text x="200" y="190" textAnchor="middle" fill="#6b7280" fontSize="10">
              Wayanad Wildlife Sanctuary — Zone WY-11
            </text>

            {/* Legend */}
            <g transform="translate(10, 15)">
              <circle cx="6" cy="0" r="4" fill="#22c55e" />
              <text x="14" y="3" fill="#9ca3af" fontSize="8">Intact</text>
              <circle cx="56" cy="0" r="4" fill="#f59e0b" />
              <text x="64" y="3" fill="#9ca3af" fontSize="8">Anomaly</text>
              <circle cx="116" cy="0" r="4" fill="#ef4444" />
              <text x="124" y="3" fill="#9ca3af" fontSize="8">Breach</text>
            </g>
          </svg>
        </div>
      </CardContent>
    </Card>
    </MagneticCard>
  );
}
