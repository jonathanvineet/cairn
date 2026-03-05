"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, CheckCircle2, Loader2, Send, Zap, Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DRONE_REGISTRY_ADDRESS, BOUNDARY_ZONE_REGISTRY_ADDRESS, BOUNDARY_ZONE_REGISTRY_ABI } from "@/lib/contracts";
import SkyvaultShell from "../../components/world/SkyvaultShell";
import { WalletConnect } from "@/components/WalletConnect";
import { useWalletStore } from "@/stores/walletStore";
import { useHederaWallet } from "@/lib/useHederaWallet";

const InteractiveMap = dynamic(
  () => import("@/components/InteractiveMap").then((mod) => mod.InteractiveMap),
  { ssr: false }
);

interface Coordinate {
  lat: number;
  lng: number;
}

interface DeployZone {
  zoneId: string;
  drones: string[];
}

interface DeployDrone {
  evmAddress: string;
  cairnDroneId: string;
  isAgent?: boolean;
  agentTopicId?: string;
  model?: string;
  assignedZoneId?: string;
  registrationLat?: number;
  registrationLng?: number;
}

export default function DeployPage() {
  const { connected: walletConnected, selectedAccount } = useWalletStore();
  const { signAndExecuteTransaction } = useHederaWallet();
  const walletAddress = selectedAccount?.id ?? null;
  const [boundaryCoords, setBoundaryCoords] = useState<Coordinate[] | null>(null);
  const [zoneId, setZoneId] = useState("");
  const [savedZoneId, setSavedZoneId] = useState<string | null>(null);
  const [autoAssignedDrones, setAutoAssignedDrones] = useState<string[]>([]);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any | null>(null);

  // Drone selection states
  const [isSelectingDrone, setIsSelectingDrone] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState<any | null>(null);
  const [selectionReport, setSelectionReport] = useState<any | null>(null);

  // Auto-sync drones from blockchain on mount
  useEffect(() => {
    fetch("/api/sync-blockchain", { method: "POST" })
      .then(() => refetchDrones())
      .catch((e) => console.warn("Background sync failed:", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch all zones
  const { data: zonesData, refetch: refetchZones } = useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const res = await fetch("/api/zones");
      const data = await res.json();
      return data;
    },
  });

  // Fetch all drones
  const { data: dronesData, isLoading: dronesLoading, error: dronesError, refetch: refetchDrones } = useQuery({
    queryKey: ["drones"],
    queryFn: async () => {
      console.log("🔍 Fetching drones from /api/drones...");
      const res = await fetch("/api/drones");
      const data = await res.json();
      console.log("📦 Drones API response:", data);
      if (!res.ok) throw new Error("Failed to fetch drones");
      return data;
    },
  });

  const handleBoundaryComplete = (coordinates: Coordinate[]) => {
    console.log("✅ Boundary completed callback received:", coordinates);
    setBoundaryCoords(coordinates);
  };

  const handleSaveBoundary = async () => {
    if (!zoneId.trim()) {
      alert("Please enter a Zone ID");
      return;
    }
    if (!boundaryCoords || boundaryCoords.length < 3) {
      alert("Please draw a boundary first (click 'Create Boundary', add points, then click 'Complete')");
      return;
    }
    if (!walletConnected) {
      alert("Please connect your wallet first — coordinates are saved directly to the blockchain.");
      return;
    }

    setIsPaymentProcessing(true);
    try {
      // Import Hedera SDK
      const { ContractExecuteTransaction, ContractFunctionParameters, ContractId } = 
        await import("@hiero-ledger/sdk");
      const { ethers } = await import("ethers");

      // Convert zone ID to bytes32
      const zoneIdBytes32 = ethers.id(zoneId);

      // Check if zone already exists on-chain using JSON-RPC
      const provider = new ethers.JsonRpcProvider("https://testnet.hashio.io/api");
      const contract = new ethers.Contract(
        BOUNDARY_ZONE_REGISTRY_ADDRESS,
        BOUNDARY_ZONE_REGISTRY_ABI,
        provider
      );
      const [, timestamp] = await contract.getZone(zoneIdBytes32);
      if (Number(timestamp) > 0) {
        setIsPaymentProcessing(false);
        alert(`❌ Zone ID "${zoneId}" already exists on blockchain!\n\nPlease choose a different Zone ID. Try adding a number or timestamp:\n• ${zoneId}-2\n• ${zoneId}-${Date.now()}\n• ${zoneId}-patrol-1`);
        return;
      }

      // Encode as bytes: "zoneName|lat0,lng0,lat1,lng1,..." (int * 1e6)
      const coordsStr = zoneId + "|" + boundaryCoords
        .flatMap(c => [
          Math.round(c.lat * 1_000_000).toString(),
          Math.round(c.lng * 1_000_000).toString(),
        ])
        .join(",");
      const coordsBytes = ethers.toUtf8Bytes(coordsStr);

      console.log(`⛓️ Creating boundary zone "${zoneId}" with ${boundaryCoords.length} points...`);
      console.log("📱 Please approve the transaction in HashPack...");

      // Create contract transaction for HashPack
      const zoneTx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromEvmAddress(0, 0, BOUNDARY_ZONE_REGISTRY_ADDRESS))
        .setGas(500000)
        .setFunction(
          "createBoundaryZone",
          new ContractFunctionParameters()
            .addBytes32(Array.from(ethers.getBytes(zoneIdBytes32)))
            .addBytes(Array.from(coordsBytes))
        );

      // Sign and execute with HashPack (user pays transaction fee)
      const txResult = await signAndExecuteTransaction(zoneTx);
      
      if (!txResult || !txResult.transactionId) {
        throw new Error("Transaction failed - no transaction ID returned");
      }

      const txId = txResult.transactionId.toString();
      console.log("✅ Zone saved on-chain! TX:", txId);

      // Fetch assigned drones for this zone from chain
      const zonesRes = await fetch("/api/zones/boundary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneId }),
      });
      const zonesResData = await zonesRes.json();

      setSavedZoneId(zoneId);
      setAutoAssignedDrones(zonesResData.autoAssignedDrones || []);
      setIsPaymentProcessing(false);

      // Refetch both zones and drones to show updated assignments
      refetchZones();
      refetchDrones();

      alert(`✅ Zone "${zoneId}" saved on blockchain!\n${zonesResData.autoAssignedCount || 0} drone(s) assigned.`);
    } catch (err: unknown) {
      const error = err as any;
      setIsPaymentProcessing(false);
      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        alert("Transaction cancelled.");
      } else if (error.message?.includes("execution reverted") && error.message?.includes("require(false)")) {
        console.error("❌ Error saving zone:", error);
        alert(`❌ Zone creation failed!\n\nThis usually means the Zone ID "${zoneId}" already exists on the blockchain.\n\nPlease try a different Zone ID:\n• ${zoneId}-2\n• ${zoneId}-${new Date().toISOString().slice(0, 10)}\n• ${zoneId}-patrol-${Math.floor(Math.random() * 1000)}`);
      } else {
        console.error("❌ Error saving zone:", error);
        alert("Error: " + (error.reason || error.message));
      }
    }
  };

  const handleConfirmAndProceed = async () => {
    // Can work with either a selected existing zone OR a newly saved zone
    const activeZoneId = selectedZone?.zoneId || savedZoneId;
    const activeBoundary = selectedZone?.coordinates || boundaryCoords;

    if (!activeZoneId || !activeBoundary || activeBoundary.length === 0) {
      alert("Please select an existing zone or create and save a new boundary first");
      return;
    }

    // Store zone data for the analysis page to use
    sessionStorage.setItem("pendingZoneId", activeZoneId);
    sessionStorage.setItem("pendingBoundary", JSON.stringify(activeBoundary));

    // Redirect to the analysis page
    window.location.href = "/analyse-drone";
  };

  return (
    <SkyvaultShell title="DEPLOY MISSION">
      <div className="h-screen w-screen flex flex-col" style={{ paddingTop: 0 }}>
        {/* Wallet + tools bar */}
        <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl px-4 py-2 flex items-center justify-end gap-3 shrink-0">
          <WalletConnect />
          <Link href="/eliza-thinking">
            <Button variant="outline" size="sm" className="gap-2 bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20">
              <Brain className="h-4 w-4" />
              Eliza AI
            </Button>
          </Link>
        </div>

        {/* Full map with side panel */}
        <div className="flex-1 flex">
          <div className="flex-1">
            <InteractiveMap
              onBoundaryComplete={handleBoundaryComplete}
              drones={dronesData?.drones || []}
              selectedZone={selectedZone}
            />
          </div>

          {/* Right sidebar for boundary management */}
          <div className="w-80 bg-[#0f1729] border-l border-white/10 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Wallet Connection */}
              {!walletConnected && (
                <Card className="bg-white/5 border-cyan-500/30">
                  <CardContent className="pt-6">
                    <div className="text-center mb-3">
                      <p className="text-sm font-semibold text-cyan-400 mb-1">Connect Wallet</p>
                      <p className="text-xs text-gray-400">Required to save zones to blockchain</p>
                    </div>
                    <WalletConnect />
                  </CardContent>
                </Card>
              )}

              {/* Select Existing Zone for Deployment */}
              <Card className="bg-white/5 border-violet-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-violet-400">Step 1: Select Existing Zone</CardTitle>
                    <div className="flex items-center gap-1.5">
                      {selectedZone && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedZone(null)}
                          className="h-6 text-xs text-gray-400 hover:text-white px-2"
                        >
                          ✕ Clear
                        </Button>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {zonesData?.count ?? 0}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!zonesData || zonesData.count === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-2">No zones saved yet</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {zonesData.zones?.map((zone: DeployZone) => {
                        const isSelected = selectedZone?.zoneId === zone.zoneId;
                        return (
                          <div
                            key={zone.zoneId}
                            onClick={() => setSelectedZone(isSelected ? null : zone)}
                            className={`p-2.5 rounded border transition-colors cursor-pointer ${isSelected
                                ? "bg-violet-500/20 border-violet-500/60"
                                : "bg-white/5 border-white/10 hover:border-violet-500/30"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{zone.zoneName || zone.zoneId}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{zone.coordinates?.length ?? 0} boundary points</p>
                              </div>
                              <div className="flex items-center gap-1.5 ml-2 shrink-0">
                                {isSelected && (
                                  <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-400/50">
                                    Viewing
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                                  {zone.assignedDrones?.length ?? 0} drones
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>



              {/* OR Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0f1729] px-2 text-gray-500">OR Create New</span>
                </div>
              </div>

              <Card className="bg-white/5 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-sm text-cyan-400">Step 1 (Alternative): Create New Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">


                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Zone ID
                      {zonesData && zonesData.count > 0 && (
                        <span className="ml-2 text-yellow-400">
                          (Must be unique - {zonesData.count} zones exist)
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={zoneId}
                      onChange={(e) => setZoneId(e.target.value)}
                      placeholder="e.g., Wayanad-01, Patrol-North, Zone-Alpha"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm"
                      disabled={!!savedZoneId}
                    />
                    {!zoneId && (
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Tip: Use unique IDs. Add dates or numbers to make them unique: Wayanad-01, Patrol-2026-03-04, Zone-A, etc.
                      </p>
                    )}
                  </div>

                  {/* Status indicator */}
                  {boundaryCoords && (
                    <Badge variant="outline" className="w-full justify-center bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                      ✓ {boundaryCoords.length} points
                    </Badge>
                  )}

                  <Button
                    onClick={handleSaveBoundary}
                    disabled={!boundaryCoords || !zoneId || isPaymentProcessing || !!savedZoneId}
                    className="w-full gap-2"
                    size="sm"
                  >
                    {isPaymentProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : savedZoneId ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Boundary to Blockchain
                      </>
                    )}
                  </Button>

                </CardContent>
              </Card>

              {/* Drone Selection Section - Works with either selected or saved zone */}
              {(selectedZone || savedZoneId) && (
                <>
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#0f1729] px-2 text-gray-500">Step 2: Deploy Drone</span>
                    </div>
                  </div>

                  <Card className="bg-white/5 border-violet-500/30">
                    <CardHeader>
                      <CardTitle className="text-sm text-violet-400">Select Best Drone</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3 p-2 bg-violet-500/10 rounded border border-violet-500/20">
                        <p className="text-xs text-gray-400">Active Zone:</p>
                        <p className="text-sm font-semibold text-white truncate">{selectedZone?.zoneName || savedZoneId}</p>
                        <p className="text-xs text-violet-400 mt-0.5">{(selectedZone?.coordinates || boundaryCoords)?.length ?? 0} boundary points</p>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">
                        Active Zone: <span className="text-white font-semibold">{selectedZone?.zoneName || savedZoneId}</span>
                      </p>
                      <Button
                        onClick={handleConfirmAndProceed}
                        disabled={isSelectingDrone}
                        className="w-full gap-2 bg-linear-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500"
                        size="sm"
                      >
                        <Zap className="h-4 w-4" />
                        Analyse Drone
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Selected Drone Report */}
              {selectedDrone && selectionReport && (
                <Card className="bg-white/5 border-violet-500/30">
                  <CardHeader>
                    <CardTitle className="text-sm text-violet-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Selected Drone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-violet-500/10 rounded border border-violet-500/20">
                      <p className="font-bold text-lg text-violet-300">{selectedDrone.drone.cairnDroneId}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{selectedDrone.drone.evmAddress.slice(0, 10)}...{selectedDrone.drone.evmAddress.slice(-8)}</p>
                      {selectedDrone.drone.agentTopicId && (
                        <Badge className="mt-2 bg-violet-500/20 text-violet-300 border-violet-500/30 text-[10px]">
                          ✓ HCS AGENT VERIFIED
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Overall Score:</span>
                        <span className="font-bold text-violet-400">{selectedDrone.totalScore}/100</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div
                          className="bg-linear-to-r from-violet-500 to-cyan-500 h-2 rounded-full transition-all"
                        />
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase tracking-wide text-gray-500 font-bold">Score Breakdown</p>
                      {Object.entries(selectedDrone.breakdown).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-gray-400 capitalize">{key.replace(/Score$/, '')}:</span>
                          <span className="text-gray-300">{value}/100</span>
                        </div>
                      ))}
                    </div>

                    {/* Live Status */}
                    <div className="border-t border-white/10 pt-3 space-y-2">
                      <p className="text-[10px] uppercase tracking-wide text-gray-500 font-bold">Live Status</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500">Battery</p>
                          <p className="font-semibold text-green-400">{selectedDrone.drone.batteryLevel}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Flight Time</p>
                          <p className="font-semibold text-blue-400">{selectedDrone.drone.flightHoursRemaining.toFixed(1)}h</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Weather</p>
                          <p className="font-semibold text-gray-300">{selectedDrone.drone.weatherSuitable ? '✓ OK' : '✗ Poor'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Health</p>
                          <p className="font-semibold text-gray-300 capitalize">{selectedDrone.drone.sensorHealth}</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full gap-2 bg-linear-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500"
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                      Deploy Mission
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Info: Available Drones Count */}
              {dronesData && dronesData.count > 0 && !selectedDrone && (
                <Card className="glass-strong border-blue-500/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-blue-400">Available Drones</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {dronesData.count}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {dronesData.drones
                        ?.map((drone: DeployDrone) => (
                          <div
                            key={drone.evmAddress}
                            className="p-2.5 rounded bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-semibold text-white">{drone.cairnDroneId}</p>
                                  {drone.isAgent && (
                                    <span
                                      title={`HCS Agent Topic: ${drone.agentTopicId}`}
                                      className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 leading-none"
                                    >
                                      AI AGENT
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">{drone.model || "Unknown Model"}</p>
                                {drone.agentTopicId && (
                                  <p className="text-[10px] text-purple-400 mt-0.5 font-mono truncate">
                                    📡 {drone.agentTopicId}
                                  </p>
                                )}
                                {drone.assignedZoneId === "UNASSIGNED" && drone.registrationLat && drone.registrationLng && (
                                  <p className="text-xs text-blue-400 mt-1">
                                    📍 {drone.registrationLat.toFixed(4)}°, {drone.registrationLng.toFixed(4)}°
                                  </p>
                                )}
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-xs font-mono shrink-0 ${drone.assignedZoneId === "UNASSIGNED" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" : "bg-green-500/10 text-green-400 border-green-500/30"}`}
                              >
                                {drone.assignedZoneId || "UNASSIGNED"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Assigned Drones */}
              {savedZoneId && (
                <Card className="bg-white/5 border-emerald-500/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-emerald-400">Assigned Drones</CardTitle>
                      <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        {autoAssignedDrones.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {autoAssignedDrones.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {autoAssignedDrones.map((droneId) => (
                          <div
                            key={droneId}
                            className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between"
                          >
                            <span className="text-sm font-semibold text-white">{droneId}</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-400">No drones for zone "{savedZoneId}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </SkyvaultShell>
  );
}
