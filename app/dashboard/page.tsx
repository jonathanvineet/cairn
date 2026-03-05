"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plane,
  MapPin,
  Shield,
  Activity,
  Zap,
  ArrowRight,
  Plus,
  CheckCircle,
  AlertCircle,
  Battery
} from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import { useWalletStore } from "@/stores/walletStore";

interface Drone {
  cairnDroneId: string;
  evmAddress: string;
  model: string;
  assignedZoneId: string;
  status: string;
  registrationLat?: number;
  registrationLng?: number;
  agentTopicId?: string;
  isAgent?: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { connected, selectedAccount } = useWalletStore();
  const [drones, setDrones] = useState<Drone[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    setLoading(false);
  }, [connected]);

  const fetchData = async () => {
    try {
      const [dronesRes, zonesRes] = await Promise.all([
        fetch("/api/drones"),
        fetch("/api/zones")
      ]);

      if (dronesRes.ok) {
        const dronesData = await dronesRes.json();
        setDrones(dronesData.drones || []);
      }

      if (zonesRes.ok) {
        const zonesData = await zonesRes.json();
        setZones(zonesData.zones || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const activeDrones = drones.filter(d => d.status === "ACTIVE");
  const assignedDrones = drones.filter(d => d.assignedZoneId !== "UNASSIGNED");
  const unassignedDrones = drones.filter(d => d.assignedZoneId === "UNASSIGNED");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-gray-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#0a0e27]">
        <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">CAIRN</h1>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Dashboard</p>
                </div>
              </Link>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 rounded-2xl blur-2xl" />
              <div className="relative bg-[#0f1729] border border-white/10 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Connect Your Wallet
                </h2>
                <p className="text-gray-400 mb-8">
                  Connect your wallet to access the dashboard
                </p>
                <WalletConnect />
                <Link href="/" className="block mt-4 text-sm text-gray-400 hover:text-white transition">
                  Back to Home
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050810] text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>
      {/* HUD-style background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1f3a_1px,transparent_1px),linear-gradient(to_bottom,#1a1f3a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/0 via-[#0a1628]/10 to-[#0a1628]/60" />
        <div className="absolute inset-0 scanline-effect opacity-5 pointer-events-none" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 border-b border-[#00f5ff]/20 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#00f5ff]/10 border border-[#00f5ff]/40 rounded-lg flex items-center justify-center group-hover:bg-[#00f5ff]/20 transition-all">
              <Shield className="h-6 w-6 text-[#00f5ff]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-[0.2em] uppercase">CAIRN</h1>
              <p className="text-[9px] text-[#00f5ff]/60 uppercase tracking-[0.3em] font-mono">Operator Dashboard</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 bg-[#00f5ff]/5 border border-[#00f5ff]/20 rounded font-mono text-[11px] text-[#00f5ff]/80">
              <span className="opacity-50 mr-2">//</span>
              {selectedAccount?.id.slice(0, 6)}...{selectedAccount?.id.slice(-4)}
            </div>
            <Link
              href="/"
              className="px-4 py-1.5 border border-white/10 hover:border-white/30 rounded text-xs font-bold tracking-widest uppercase transition-all"
            >
              Return to HUD
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 border-l-2 border-[#00f5ff] pl-6"
        >
          <div className="text-[#00f5ff] text-xs font-bold tracking-[0.4em] uppercase mb-2">FLEET_OVERVIEW_V1.0</div>
          <h1 className="text-4xl font-bold text-white tracking-widest uppercase mb-2">Operational Status</h1>
          <p className="text-white/40 font-mono text-sm tracking-tighter">TIMESTAMP: {new Date().toISOString().replace('T', ' ').slice(0, 19)} // ZONE: DELTA-7</p>
        </motion.div>

        {/* HUD Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Total Asset Count", value: drones.length, icon: Plane, color: "#00f5ff", id: "DRN" },
            { label: "Active Drones", value: activeDrones.length, icon: Activity, color: "#10b981", id: "ACT" },
            { label: "Assigned Assets", value: assignedDrones.length, icon: CheckCircle, color: "#8b5cf6", id: "ASG" },
            { label: "Patrol Sectors", value: zones.length, icon: MapPin, color: "#f59e0b", id: "SCT" }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#0a1628]/40 border border-white/10 group-hover:border-[#00f5ff]/40 transition-all rounded" />
              <div className="relative p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-[10px] font-mono opacity-40">[{stat.id}-00X]</div>
                  <stat.icon size={18} style={{ color: stat.color }} className="opacity-80" />
                </div>
                <div className="text-3xl font-bold tracking-wider mb-1">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/40">{stat.label}</div>
              </div>
              <div className="absolute bottom-0 left-0 h-0.5 bg-[#00f5ff]/20 group-hover:w-full transition-all w-0" />
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link href="/register">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative group overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-[#00f5ff]/5 border border-[#00f5ff]/30 group-hover:bg-[#00f5ff]/10 group-hover:border-[#00f5ff]/60 transition-all rounded-lg" />
              <div className="relative p-8 flex justify-between items-center">
                <div className="space-y-2">
                  <div className="text-[#00f5ff] text-[10px] font-bold tracking-[0.3em] uppercase">SYSTEM_ACTION</div>
                  <h3 className="text-2xl font-bold uppercase tracking-widest">Register New Asset</h3>
                  <p className="text-white/40 text-sm font-mono tracking-tighter">Add encrypted drone identifiers to the Hedera ledger</p>
                </div>
                <div className="w-14 h-14 bg-[#00f5ff]/10 border border-[#00f5ff]/30 rounded flex items-center justify-center group-hover:rotate-90 transition-all">
                  <Plus className="text-[#00f5ff]" />
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/deploy">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative group overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-[#8b5cf6]/5 border border-[#8b5cf6]/30 group-hover:bg-[#8b5cf6]/10 group-hover:border-[#8b5cf6]/60 transition-all rounded-lg" />
              <div className="relative p-8 flex justify-between items-center">
                <div className="space-y-2">
                  <div className="text-[#8b5cf6] text-[10px] font-bold tracking-[0.3em] uppercase">NETWORK_ACTION</div>
                  <h3 className="text-2xl font-bold uppercase tracking-widest">Create Patrol Zone</h3>
                  <p className="text-white/40 text-sm font-mono tracking-tighter">Define geo-fenced boundaries for autonomous monitoring</p>
                </div>
                <div className="w-14 h-14 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded flex items-center justify-center group-hover:scale-110 transition-all">
                  <MapPin className="text-[#8b5cf6]" />
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Data Grid Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Drones Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-end pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#00f5ff] rounded-full animate-pulse" />
                  Asset Inventory
                </h2>
                <div className="text-[10px] font-mono text-white/30 uppercase mt-1">LATEST_SYNC // {activeDrones.length} ONLINE</div>
              </div>
            </div>

            {drones.length === 0 ? (
              <div className="text-center py-20 border border-white/5 bg-white/[0.02] rounded-xl">
                <div className="text-white/20 mb-4 flex justify-center"><Plane size={48} /></div>
                <p className="text-white/40 font-mono text-sm">NO ASSETS DETECTED IN LOCAL RANGE</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {drones.map((drone, i) => (
                  <motion.div
                    key={drone.evmAddress}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-[#0a1628]/60 border border-white/5 group-hover:border-[#00f5ff]/30 transition-all rounded" />
                    <div className="relative p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="min-w-0">
                          <h4 className="font-bold text-white truncate text-base tracking-wider uppercase">{drone.cairnDroneId}</h4>
                          <div className="text-[10px] font-mono text-white/40 uppercase mb-2">MODEL: {drone.model}</div>
                        </div>
                        {drone.isAgent && (
                          <div className="px-2 py-0.5 bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 rounded text-[9px] text-[#8b5cf6] font-bold tracking-tighter">AI_UNIT</div>
                        )}
                      </div>

                      <div className="space-y-2.5 mb-6">
                        <div className="flex items-center gap-3 text-[10px] font-mono text-white/50">
                          <Shield size={12} className="text-[#00f5ff]" />
                          <span className="truncate">{drone.evmAddress}</span>
                        </div>
                        {drone.assignedZoneId !== "UNASSIGNED" ? (
                          <div className="flex items-center gap-3 text-[10px] font-mono text-[#10b981]">
                            <CheckCircle size={12} />
                            <span className="uppercase">DEPLOYED: {drone.assignedZoneId}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-[10px] font-mono text-[#f59e0b]">
                            <AlertCircle size={12} />
                            <span className="uppercase">AWAITING DEPLOYMENT</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <div className="text-[9px] font-mono text-white/30 tracking-[0.2em] uppercase">STATUS_OPE</div>
                        <div className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded ${drone.status === "ACTIVE" ? "text-[#10b981] bg-[#10b981]/10" : "text-white/30 bg-white/5"
                          }`}>
                          {drone.status}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Zones Column */}
          <div className="space-y-6">
            <div className="pb-4 border-b border-white/10">
              <h2 className="text-xl font-bold uppercase tracking-[0.2em]">Sector Data</h2>
              <div className="text-[10px] font-mono text-white/30 uppercase mt-1">AVAILABLE_ZONES // {zones.length} TOTAL</div>
            </div>

            <div className="space-y-3">
              {zones.map((zone, i) => (
                <motion.div
                  key={zone.zoneId}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="p-4 bg-white/[0.03] border border-white/5 hover:border-[#8b5cf6]/30 transition-all rounded flex justify-between items-center group"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">{zone.zoneName || zone.zoneId}</h4>
                    <div className="text-[10px] font-mono text-white/40 mt-1 uppercase">
                      PTS: {zone.coordinates?.length || 0} // ASSETS: {zone.assignedDrones?.length || 0}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded border border-white/10 flex items-center justify-center group-hover:bg-[#8b5cf6]/10 group-hover:border-[#8b5cf6]/40 transition-all">
                    <MapPin size={14} className="text-[#8b5cf6]" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
