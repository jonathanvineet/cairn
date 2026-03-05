"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useWalletStore } from "@/stores/walletStore";
import Link from "next/link";
import {
  Plane,
  MapPin,
  Shield,
  Activity,
  Zap,
  ArrowRight,
  Wallet,
  Plus,
  CheckCircle,
  AlertCircle,
  Battery,
  Coins
} from "lucide-react";

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
  hederaAccountId?: string | null;
  hbarBalance?: number | null;
  hbarLoading?: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { connected, selectedAccount, connect } = useWalletStore();
  const [drones, setDrones] = useState<Drone[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (connected) {
      fetchData();
    }
    setLoading(false);
  }, [connected]);

  const fetchHbarBalance = async (accountId: string): Promise<number | null> => {
    try {
      const res = await fetch(`/api/drones/balance?accountId=${encodeURIComponent(accountId)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.success ? data.balance : null;
    } catch {
      return null;
    }
  };

  const fetchData = async () => {
    try {
      const [dronesRes, zonesRes] = await Promise.all([
        fetch("/api/drones"),
        fetch("/api/zones")
      ]);

      let loadedDrones: Drone[] = [];

      if (dronesRes.ok) {
        const dronesData = await dronesRes.json();
        loadedDrones = (dronesData.drones || []).map((d: Drone) => ({
          ...d,
          hbarBalance: null,
          hbarLoading: !!d.hederaAccountId,
        }));
        setDrones(loadedDrones);
      }

      if (zonesRes.ok) {
        const zonesData = await zonesRes.json();
        setZones(zonesData.zones || []);
      }

      // Fetch HBAR balances in parallel for drones that have a hederaAccountId
      const dronesWithAccount = loadedDrones.filter(d => d.hederaAccountId);
      if (dronesWithAccount.length > 0) {
        const balanceResults = await Promise.all(
          dronesWithAccount.map(async (drone) => {
            const balance = await fetchHbarBalance(drone.hederaAccountId!);
            return { evmAddress: drone.evmAddress, balance };
          })
        );

        setDrones(prev =>
          prev.map(drone => {
            const result = balanceResults.find(r => r.evmAddress.toLowerCase() === drone.evmAddress.toLowerCase());
            if (result) {
              return { ...drone, hbarBalance: result.balance, hbarLoading: false };
            }
            return { ...drone, hbarLoading: false };
          })
        );
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
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Connect Your Wallet
                </h2>
                <p className="text-gray-400 mb-8">
                  Connect your wallet to access the dashboard
                </p>
                <button
                  onClick={() => connect()}
                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  Connect HashPack
                </button>
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
    <div className="min-h-screen bg-[#0a0e27]">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1a1f3a_1px,transparent_1px),linear-gradient(to_bottom,#1a1f3a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      <motion.div
        className="fixed top-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Navigation */}
      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">
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

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-sm text-emerald-400 font-medium">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Fleet Overview</h1>
          <p className="text-gray-400">Monitor and manage your drone network</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Drones", value: drones.length, icon: Plane, color: "cyan" },
            { label: "Active Drones", value: activeDrones.length, icon: Activity, color: "emerald" },
            { label: "Assigned", value: assignedDrones.length, icon: CheckCircle, color: "violet" },
            { label: "Patrol Zones", value: zones.length, icon: MapPin, color: "fuchsia" }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/10 rounded-xl blur-xl group-hover:blur-2xl transition`} />
              <div className="relative bg-[#0f1729] border border-white/10 rounded-xl p-6 hover:border-white/20 transition">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`h-8 w-8 text-${stat.color}-400`} />
                  <span className={`text-3xl font-bold text-${stat.color}-400`}>{stat.value}</span>
                </div>
                <p className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => router.push("/register")}
            className="group relative cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl blur-xl group-hover:blur-2xl transition" />
            <div className="relative bg-[#0f1729] border border-white/10 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Register New Drone</h3>
                  <p className="text-gray-400 text-sm">Add a drone to the registry</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Plus className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => router.push("/deploy")}
            className="group relative cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-xl blur-xl group-hover:blur-2xl transition" />
            <div className="relative bg-[#0f1729] border border-white/10 rounded-xl p-6 hover:border-violet-500/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Create Patrol Zone</h3>
                  <p className="text-gray-400 text-sm">Define new boundary zones</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Drones List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl blur-2xl" />
          <div className="relative bg-[#0f1729] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Registered Drones</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-400">{activeDrones.length} Active</span>
              </div>
            </div>

            {drones.length === 0 ? (
              <div className="text-center py-12">
                <Plane className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-6">No drones registered yet</p>
                <button
                  onClick={() => router.push("/register")}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  Register Your First Drone
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drones.map((drone, i) => (
                  <motion.div
                    key={drone.evmAddress}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-cyan-500/50 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold truncate flex items-center gap-2">
                          <Plane className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                          {drone.cairnDroneId}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">{drone.model}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        {/* HBAR Balance Badge */}
                        {drone.hbarLoading ? (
                          <div className="h-6 w-20 bg-white/10 rounded-lg animate-pulse" />
                        ) : (
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${drone.hbarBalance !== null && drone.hbarBalance !== undefined
                              ? "bg-amber-500/15 border-amber-500/30"
                              : "bg-teal-500/15 border-teal-500/30"
                            }`}>
                            <Coins className={`h-3 w-3 ${drone.hbarBalance !== null && drone.hbarBalance !== undefined
                                ? "text-amber-400"
                                : "text-teal-400"
                              }`} />
                            <span className={`text-xs font-bold ${drone.hbarBalance !== null && drone.hbarBalance !== undefined
                                ? "text-amber-300"
                                : "text-teal-300"
                              }`}>
                              ℏ {drone.hbarBalance !== null && drone.hbarBalance !== undefined
                                ? drone.hbarBalance.toFixed(2)
                                : "20.00"}
                            </span>
                          </div>
                        )}
                        {drone.isAgent && (
                          <div className="px-2 py-1 bg-violet-500/20 border border-violet-500/30 rounded text-[10px] text-violet-300 font-bold">
                            AI
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Shield className="h-3 w-3" />
                        <span className="text-xs truncate">{drone.evmAddress.slice(0, 6)}...{drone.evmAddress.slice(-4)}</span>
                      </div>

                      {drone.registrationLat && drone.registrationLng && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs">
                            {drone.registrationLat.toFixed(4)}, {drone.registrationLng.toFixed(4)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {drone.assignedZoneId === "UNASSIGNED" ? (
                          <>
                            <AlertCircle className="h-3 w-3 text-yellow-400" />
                            <span className="text-xs text-yellow-400">Unassigned</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3 text-emerald-400" />
                            <span className="text-xs text-emerald-400 truncate">{drone.assignedZoneId}</span>
                          </>
                        )}
                      </div>

                      {/* HBAR Balance label row */}
                      <div className="flex items-center gap-2 text-gray-500">
                        <Coins className="h-3 w-3" />
                        <span className="text-xs">
                          {drone.hederaAccountId
                            ? drone.hederaAccountId
                            : "Wallet: ℏ 20.00 initial"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Status</span>
                        <span className={`px-2 py-1 rounded ${drone.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-gray-500/20 text-gray-400"
                          }`}>
                          {drone.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Patrol Zones Section */}
        {zones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative mt-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl blur-2xl" />
            <div className="relative bg-[#0f1729] border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Patrol Zones</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zones.map((zone, i) => (
                  <div
                    key={zone.zoneId}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-violet-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-white font-bold">{zone.zoneName || zone.zoneId}</h3>
                      <MapPin className="h-5 w-5 text-violet-400" />
                    </div>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p>{zone.coordinates?.length || 0} boundary points</p>
                      <p>{zone.assignedDrones?.length || 0} drone{zone.assignedDrones?.length !== 1 ? 's' : ''} assigned</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
