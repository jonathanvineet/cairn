"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { MagneticCard } from "@/components/MagneticCard";
import { CountUp } from "@/components/CountUp";

const kpis = [
  {
    label: "Total Checkpoints",
    value: 16,
    icon: <MapPin className="h-6 w-6" />,
    color: "text-blue-400",
    glowColor: "#3b82f6",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    label: "Intact",
    value: 14,
    sub: "87%",
    icon: <CheckCircle2 className="h-6 w-6" />,
    color: "text-green-400",
    glowColor: "#4ade80",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    pulse: true,
  },
  {
    label: "Anomalies",
    value: 2,
    icon: <AlertTriangle className="h-6 w-6" />,
    color: "text-amber-400",
    glowColor: "#fbbf24",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    shake: true,
  },
  {
    label: "Missed Patrols",
    value: 0,
    icon: <Clock className="h-6 w-6" />,
    color: "text-gray-400",
    glowColor: "#9ca3af",
    bgColor: "bg-white/5",
    borderColor: "border-white/10",
  },
];

export function ZoneOverview() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {kpis.map((kpi, i) => (
        <MagneticCard key={kpi.label} strength={0.2} breathe>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Card
              className={`${kpi.bgColor} ${kpi.borderColor} border-2 glass-strong relative overflow-hidden group`}
            >
              {/* Gradient overlay on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${kpi.glowColor}, transparent)`,
                }}
              />

              <CardContent className="p-5 relative z-10">
                {/* Icon with pulse animation */}
                <motion.div
                  className={`mb-3 ${kpi.color}`}
                  animate={
                    kpi.pulse
                      ? {
                          scale: [1, 1.1, 1],
                          opacity: [1, 0.8, 1],
                        }
                      : kpi.shake
                      ? {
                          x: [0, -2, 2, -2, 2, 0],
                        }
                      : {}
                  }
                  transition={{
                    duration: kpi.pulse ? 2 : 0.5,
                    repeat: Infinity,
                    repeatDelay: kpi.pulse ? 1 : 3,
                  }}
                >
                  {kpi.icon}
                </motion.div>

                {/* Count-up number */}
                <p
                  className={`text-3xl sm:text-4xl font-extrabold ${kpi.color} tracking-tight`}
                >
                  <CountUp end={kpi.value} duration={2.5} />
                  {kpi.sub && (
                    <span className="ml-2 text-base font-medium opacity-70">
                      {kpi.sub}
                    </span>
                  )}
                </p>

                {/* Label */}
                <p className="mt-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  {kpi.label}
                </p>

                {/* Glow effect on hover */}
                <div
                  className="absolute -bottom-2 -right-2 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                  style={{ background: kpi.glowColor }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </MagneticCard>
      ))}
    </div>
  );
}
