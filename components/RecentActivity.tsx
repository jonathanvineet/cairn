"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge, type InspectionStatus } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Camera, Download, Bell, TrendingUp } from "lucide-react";
import { MagneticCard } from "@/components/MagneticCard";

interface TimelineEvent {
  id: string;
  timestamp: string;
  checkpoint: string;
  status: InspectionStatus;
  hasPhoto: boolean;
  hasCertificate: boolean;
  note?: string;
}

const events: TimelineEvent[] = [
  {
    id: "1",
    timestamp: "2026-02-21 09:00",
    checkpoint: "CP#5",
    status: "intact",
    hasPhoto: true,
    hasCertificate: true,
  },
  {
    id: "2",
    timestamp: "2026-02-21 08:45",
    checkpoint: "CP#12",
    status: "breach",
    hasPhoto: true,
    hasCertificate: false,
    note: "Wire fence displaced 2m. Alert raised.",
  },
  {
    id: "3",
    timestamp: "2026-02-21 08:30",
    checkpoint: "CP#9",
    status: "intact",
    hasPhoto: true,
    hasCertificate: true,
  },
  {
    id: "4",
    timestamp: "2026-02-21 08:15",
    checkpoint: "CP#3",
    status: "anomaly",
    hasPhoto: true,
    hasCertificate: true,
    note: "Minor vegetation overgrowth near post.",
  },
  {
    id: "5",
    timestamp: "2026-02-21 08:00",
    checkpoint: "CP#1",
    status: "intact",
    hasPhoto: true,
    hasCertificate: true,
  },
];

function TimelineItem({ event, index }: { event: TimelineEvent; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30, scale: 0.95 }}
      animate={
        isInView
          ? { opacity: 1, x: 0, scale: 1 }
          : { opacity: 0, x: -30, scale: 0.95 }
      }
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      className="flex gap-3 group"
    >
      {/* Timeline dot & line */}
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
          className={`mt-1.5 h-3 w-3 rounded-full shrink-0 shadow-lg ${
            event.status === "intact"
              ? "bg-green-400 shadow-green-400/50"
              : event.status === "anomaly"
              ? "bg-amber-400 shadow-amber-400/50"
              : "bg-red-400 shadow-red-400/50 animate-pulse"
          }`}
        />
        {index < events.length - 1 && (
          <motion.div
            initial={{ height: 0 }}
            animate={isInView ? { height: "100%" } : { height: 0 }}
            transition={{ delay: index * 0.1 + 0.4, duration: 0.4 }}
            className="w-px bg-gradient-to-b from-green-500/50 to-transparent mt-1"
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-6 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 font-mono">{event.timestamp}</span>
          <span className="text-sm font-bold text-white">{event.checkpoint}</span>
          <StatusBadge status={event.status} />
        </div>

        {event.note && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="mt-1.5 text-xs text-gray-400 leading-relaxed"
          >
            {event.note}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ delay: index * 0.1 + 0.4 }}
          className="mt-2 flex flex-wrap items-center gap-2"
        >
          {event.hasPhoto && (
            <Badge
              variant="outline"
              className="text-[10px] gap-1 cursor-pointer hover:bg-white/10 hover:scale-105 transition-all"
            >
              <Camera className="h-3 w-3" />
              Photo
            </Badge>
          )}
          {event.hasCertificate && (
            <Badge
              variant="blockchain"
              className="text-[10px] gap-1 cursor-pointer hover:bg-purple-500/25 hover:scale-105 transition-all"
            >
              <Download className="h-3 w-3" />
              §65B Cert
            </Badge>
          )}
          {event.status === "breach" && (
            <Badge
              variant="breach"
              className="text-[10px] gap-1 animate-pulse"
            >
              <Bell className="h-3 w-3" />
              Alert!
            </Badge>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export function RecentActivity() {
  return (
    <MagneticCard strength={0.15}>
      <Card className="glass-strong border-2 border-green-500/20 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 opacity-50" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="h-5 w-5 text-green-400" />
            </motion.div>
            <span>Recent Activity</span>
            <Badge variant="info" className="ml-auto text-[10px]">
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-0">
            {events.map((event, i) => (
              <TimelineItem key={event.id} event={event} index={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    </MagneticCard>
  );
}
