"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import {
  X,
  MapPin,
  Camera,
  Shield,
  CheckCircle2,
  AlertTriangle,
  TreePine,
} from "lucide-react";

const demoCheckpoints = [
  { id: "CP#1", lat: "11.6854°N", lng: "76.0699°E", status: "intact" as const, note: "Fence intact. No encroachment." },
  { id: "CP#2", lat: "11.6861°N", lng: "76.0712°E", status: "intact" as const, note: "Concrete post in good condition." },
  { id: "CP#3", lat: "11.6870°N", lng: "76.0725°E", status: "anomaly" as const, note: "Minor vegetation overgrowth near post." },
  { id: "CP#4", lat: "11.6879°N", lng: "76.0738°E", status: "intact" as const, note: "Wire tension normal." },
  { id: "CP#5", lat: "11.6889°N", lng: "76.0750°E", status: "breach" as const, note: "Wire displaced 2m. Elephant crossing suspected." },
  { id: "CP#6", lat: "11.6895°N", lng: "76.0763°E", status: "intact" as const, note: "No issues detected." },
];

interface DemozoneProps {
  open: boolean;
  onClose: () => void;
}

export function Demozone({ open, onClose }: DemozoneProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-4 z-50 mx-auto my-auto max-w-2xl max-h-[80vh] overflow-auto rounded-2xl border border-white/10 bg-forest-900 shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-forest-900/95 backdrop-blur px-5 py-4">
              <div className="flex items-center gap-2">
                <TreePine className="h-5 w-5 text-green-400" />
                <h2 className="text-lg font-bold text-white">Demo Zone — Wayanad WY-11</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Zone summary */}
            <div className="px-5 py-4 border-b border-white/10">
              <div className="flex flex-wrap gap-3 text-xs">
                <Badge variant="outline" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  Wayanad, Kerala
                </Badge>
                <Badge variant="intact" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  4 Intact
                </Badge>
                <Badge variant="anomaly" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  1 Anomaly
                </Badge>
                <Badge variant="breach" className="gap-1">
                  <X className="h-3 w-3" />
                  1 Breach
                </Badge>
                <Badge variant="blockchain" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Blockchain Verified
                </Badge>
              </div>
            </div>

            {/* Checkpoints */}
            <div className="p-5 space-y-3">
              {demoCheckpoints.map((cp, i) => (
                <motion.div
                  key={cp.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className="bg-white/[0.03]">
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest-700 text-xs font-bold text-green-300">
                        {cp.id.replace("CP#", "")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-white">{cp.id}</span>
                          <StatusBadge status={cp.status} />
                          <span className="text-[10px] text-gray-500 font-mono">
                            {cp.lat}, {cp.lng}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">{cp.note}</p>
                        <div className="mt-2 flex gap-2">
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Camera className="h-3 w-3" />
                            Photo
                          </Badge>
                          <Badge variant="blockchain" className="text-[10px] gap-1">
                            <Shield className="h-3 w-3" />
                            Hash: 0x7f2a...
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Inline trigger hook ──
export function useDemozone() {
  const [open, setOpen] = useState(false);
  return { open, openDemo: () => setOpen(true), closeDemo: () => setOpen(false) };
}
