"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plane,
  MapPin,
  Shield,
  Activity,
  Plus,
  CheckCircle,
  AlertCircle,
  X,
  Copy,
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import { useWalletStore } from "@/stores/walletStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  hederaAccountId?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { connected, selectedAccount } = useWalletStore();
  const [drones, setDrones] = useState<Drone[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [droneBalance, setDroneBalance] = useState<string | null>(null);
  const [fetchedAccountId, setFetchedAccountId] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Wallet protection
  useEffect(() => {
    if (!connected) {
      alert("Please connect your HashPack wallet first");
      router.push("/");
    }
  }, [connected, router]);

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

  const handleViewDetails = async (drone: Drone) => {
    setSelectedDrone(drone);
    setDroneBalance(null);
    setFetchedAccountId(null);
    setLoadingBalance(true);
    setCopied(false);
    
    try {
      let response;
      
      if (drone.hederaAccountId) {
        response = await fetch(`/api/drones/balance?accountId=${drone.hederaAccountId}`);
      } else if (drone.evmAddress) {
        response = await fetch(`/api/drones/balance?evmAddress=${drone.evmAddress}`);
      } else {
        setDroneBalance("N/A");
        setLoadingBalance(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.balance !== undefined) {
          const balanceNum = parseFloat(data.balance);
          setDroneBalance(balanceNum.toFixed(2));
          if (data.accountId) {
            setFetchedAccountId(data.accountId);
          }
        } else {
          setDroneBalance("0.00");
        }
      } else {
        setDroneBalance("N/A");
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      setDroneBalance("Error");
    } finally {
      setLoadingBalance(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1e3a] to-[#0a1628] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-gray-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1e3a] to-[#0a1628]">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-gray-300 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">Dashboard</h1>
            </div>
          </div>
          <p className="text-sm text-gray-400 font-mono">
            Connected: <span className="text-cyan-400">{selectedAccount?.id.substring(0, 12)}...</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Drones", value: drones.length, icon: Plane, gradient: "from-cyan-500 to-blue-500" },
            { label: "Active", value: activeDrones.length, icon: Activity, gradient: "from-green-500 to-emerald-500" },
            { label: "Assigned", value: assignedDrones.length, icon: CheckCircle, gradient: "from-purple-500 to-pink-500" },
            { label: "Zones", value: zones.length, icon: MapPin, gradient: "from-orange-500 to-red-500" }
          ].map((stat, i) => (
            <div key={stat.label} className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-400/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link href="/register">
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-400/60 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Register New Drone</h3>
                  <p className="text-sm text-gray-400">Add a new drone to the registry</p>
                </div>
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/deploy">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 hover:border-purple-400/60 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Deploy Zone</h3>
                  <p className="text-sm text-gray-400">Create patrol boundaries</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MapPin className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Drones & Zones Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Drones List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Your Drones</h2>
            
            {drones.length === 0 ? (
              <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
                <Plane className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No drones registered yet</p>
                <Link href="/register">
                  <Button className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-500">
                    Register First Drone
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {drones.map((drone) => (
                  <div
                    key={drone.evmAddress}
                    className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-cyan-400/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-white text-lg mb-1">{drone.cairnDroneId}</h4>
                        <p className="text-xs text-gray-400">{drone.model}</p>
                      </div>
                      {drone.isAgent && (
                        <Badge className="bg-purple-500/20 border-purple-500/40 text-purple-400">
                          AI Agent
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Shield className="h-3 w-3 text-cyan-400" />
                        <span className="font-mono truncate">{drone.evmAddress.substring(0, 16)}...</span>
                      </div>
                      
                      {drone.assignedZoneId !== "UNASSIGNED" ? (
                        <div className="flex items-center gap-2 text-xs text-green-400">
                          <CheckCircle className="h-3 w-3" />
                          <span>Deployed: {drone.assignedZoneId}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-orange-400">
                          <AlertCircle className="h-3 w-3" />
                          <span>Awaiting Deployment</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <Badge 
                        className={drone.status === "ACTIVE" 
                          ? "bg-green-500/20 border-green-500/40 text-green-400" 
                          : "bg-gray-500/20 border-gray-500/40 text-gray-400"
                        }
                      >
                        {drone.status}
                      </Badge>
                      <Button
                        onClick={() => handleViewDetails(drone)}
                        variant="ghost"
                        size="sm"
                        className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Zones List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Zones</h2>
            
            {zones.length === 0 ? (
              <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No zones created</p>
              </div>
            ) : (
              <div className="space-y-3">
                {zones.map((zone) => {
                  // Extract zone name from zoneId or coordinates data
                  const zoneName = zone.zoneName || zone.zoneId.split('|')[0] || zone.zoneId.substring(0, 20);
                  return (
                    <div
                      key={zone.zoneId}
                      className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:border-purple-400/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white text-sm">{zoneName}</h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {zone.coordinates?.length || 0} points • {zone.assignedDrones?.length || 0} drones
                          </p>
                        </div>
                        <MapPin className="h-5 w-5 text-purple-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drone Details Modal */}
      {selectedDrone && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDrone(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-[#0f1e3a] to-[#0a1628] border border-cyan-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-black/50 backdrop-blur-xl border-b border-white/10 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedDrone.cairnDroneId}</h2>
                <p className="text-sm text-gray-400">Drone Details</p>
              </div>
              <button
                onClick={() => setSelectedDrone(null)}
                className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 rounded-lg flex items-center justify-center transition-all"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Hedera Account ID */}
              {(selectedDrone.hederaAccountId || fetchedAccountId) && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 flex items-center gap-2">
                    <Shield className="h-3 w-3 text-green-400" />
                    Hedera Account ID
                  </label>
                  <div className="bg-black/40 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                    <code className="text-sm text-white font-mono">{selectedDrone.hederaAccountId || fetchedAccountId}</code>
                    <button
                      onClick={() => copyToClipboard(selectedDrone.hederaAccountId || fetchedAccountId || '')}
                      className="ml-3 p-2 hover:bg-white/10 rounded transition-all"
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* EVM Address */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 flex items-center gap-2">
                  <Shield className="h-3 w-3 text-cyan-400" />
                  EVM Wallet Address
                </label>
                <div className="bg-black/40 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                  <code className="text-sm text-white font-mono break-all">{selectedDrone.evmAddress}</code>
                  <button
                    onClick={() => copyToClipboard(selectedDrone.evmAddress)}
                    className="ml-3 p-2 hover:bg-white/10 rounded transition-all"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Balance */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Account Balance</label>
                <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                  {loadingBalance ? (
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-4 h-4 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">{droneBalance || "0"}</span>
                      <span className="text-sm text-gray-400">HBAR</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Model & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Model</label>
                  <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                    <p className="text-sm font-semibold text-white">{selectedDrone.model}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Status</label>
                  <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                    <p className={`text-sm font-semibold ${selectedDrone.status === "ACTIVE" ? "text-green-400" : "text-gray-400"}`}>
                      {selectedDrone.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assignment */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-purple-400" />
                  Deployment Zone
                </label>
                <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                  {selectedDrone.assignedZoneId !== "UNASSIGNED" ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-semibold text-white">{selectedDrone.assignedZoneId}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-400">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Awaiting Deployment</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Coordinates */}
              {selectedDrone.registrationLat && selectedDrone.registrationLng && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Registration Coordinates</label>
                  <div className="bg-black/40 border border-white/10 rounded-lg p-4 grid grid-cols-2 gap-4 font-mono text-sm">
                    <div>
                      <span className="text-gray-400">LAT: </span>
                      <span className="text-white">{selectedDrone.registrationLat.toFixed(6)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">LNG: </span>
                      <span className="text-white">{selectedDrone.registrationLng.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Agent Topic */}
              {selectedDrone.isAgent && selectedDrone.agentTopicId && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 flex items-center gap-2">
                    <Activity className="h-3 w-3 text-purple-400" />
                    AI Agent Topic ID
                  </label>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 flex items-center justify-between">
                    <code className="text-sm text-purple-400 font-mono">{selectedDrone.agentTopicId}</code>
                    <a
                      href={`https://hashscan.io/testnet/topic/${selectedDrone.agentTopicId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 p-2 hover:bg-white/10 rounded transition-all"
                    >
                      <ExternalLink className="h-4 w-4 text-purple-400" />
                    </a>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <a
                  href={`https://hashscan.io/testnet/account/${fetchedAccountId || selectedDrone.hederaAccountId || selectedDrone.evmAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/60 rounded-lg text-sm font-semibold text-cyan-400 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on HashScan
                </a>
                <button
                  onClick={() => setSelectedDrone(null)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-lg text-sm font-semibold text-white transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
