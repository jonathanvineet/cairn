"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Leaf,
  MapPin,
  Clock,
  Shield,
  ArrowLeft,
  Lock,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletConnect } from "@/components/WalletConnect";
import { ZoneOverview } from "@/components/ZoneOverview";
import { RecentActivity } from "@/components/RecentActivity";
import { ActiveMission } from "@/components/ActiveMission";
import { MapWidget } from "@/components/MapWidget";

async function fetchPatrols() {
  const res = await fetch("/api/mock-patrols");
  if (!res.ok) throw new Error("Failed to fetch patrols");
  return res.json();
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["patrols"],
    queryFn: fetchPatrols,
  });

  return (
    <div className="min-h-screen bg-forest-900 text-white">
      {/* Dashboard Header - ENHANCED VISIBILITY */}
      <header className="sticky top-0 z-50 border-b border-green-500/20 glass-dark backdrop-blur-2xl shadow-lg shadow-green-500/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Leaf className="h-7 w-7 text-green-400" />
            </motion.div>
            <span className="text-xl font-bold hidden sm:inline bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              BoundaryTruth
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge
                variant="outline"
                className="shrink-0 gap-2 glass-strong border-green-500/30 text-sm px-3 py-1.5"
              >
                <MapPin className="h-4 w-4 text-green-400" />
                <span className="font-semibold">Wayanad</span>
              </Badge>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Badge
                variant="outline"
                className="shrink-0 gap-2 glass-strong border-blue-500/30 text-sm px-3 py-1.5"
              >
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="hidden sm:inline">2h ago</span>
              </Badge>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="shrink-0"
            >
              <WalletConnect />
            </motion.div>
          </div>
        </div>

        {/* Live status indicator */}
        <div className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 text-xs font-medium"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="text-green-400">LIVE MONITORING</span>
              <span className="hidden sm:inline text-gray-500">•</span>
              <span className="hidden sm:inline text-gray-400">
                14/16 Checkpoints Intact ✓
              </span>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Inspection Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Wayanad Wildlife Sanctuary — Zone WY-11
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/deploy">
              <Button className="gap-2 bg-green-600 hover:bg-green-700">
                <Send className="h-4 w-4" />
                Deploy
              </Button>
            </Link>
            <Badge variant="blockchain" className="hidden sm:flex gap-1">
              <Lock className="h-3 w-3" />
              Blockchain Verified
            </Badge>
          </div>
        </motion.div>

        {/* ROW 1: Zone Overview (4 KPI Cards) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <ZoneOverview />
        </motion.div>

        {/* ROW 2: Map + Active Mission */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <MapWidget />
          </motion.div>
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <ActiveMission />
          </motion.div>
        </div>

        {/* ROW 3: Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <RecentActivity />
        </motion.div>

        {/* Patrol Data Summary (from API) */}
        {data && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="rounded-xl border border-white/10 glass p-5"
          >
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              Latest Patrol Records
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.patrols?.map(
                (patrol: {
                  id: string;
                  zone: string;
                  timestamp: string;
                  checkpoints: number;
                  status: string;
                }) => (
                  <div
                    key={patrol.id}
                    className="rounded-lg border border-white/5 glass p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-gray-500">
                        {patrol.id}
                      </span>
                      <Badge
                        variant={
                          patrol.status === "complete"
                            ? "intact"
                            : patrol.status === "in-progress"
                            ? "info"
                            : "anomaly"
                        }
                      >
                        {patrol.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-white font-medium">{patrol.zone}</p>
                    <p className="text-xs text-gray-500">
                      {patrol.checkpoints} checkpoints · {patrol.timestamp}
                    </p>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* Dashboard footer */}
      <footer className="border-t border-white/10 glass-dark px-6 py-4 mt-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between text-xs text-gray-500">
          <span>BoundaryTruth — Tamper-Proof Evidence Infrastructure</span>
          <Badge variant="blockchain" className="gap-1 text-[10px]">
            <Lock className="h-2.5 w-2.5" />
            Hedera Testnet
          </Badge>
        </div>
      </footer>
    </div>
  );
}
