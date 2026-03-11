"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, CheckCircle2, Loader2, MapPin, Brain, Plane, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BOUNDARY_ZONE_REGISTRY_ADDRESS, BOUNDARY_ZONE_REGISTRY_ABI } from "@/lib/contracts";
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

export default function DeployPage() {
  const router = useRouter();
  const { connected: walletConnected, selectedAccount, hasHydrated, isInitializing: walletInitializing } = useWalletStore();
  const { signAndExecuteTransaction } = useHederaWallet();
  const [boundaryCoords, setBoundaryCoords] = useState<Coordinate[] | null>(null);
  const [zoneId, setZoneId] = useState("");
  const [savedZoneId, setSavedZoneId] = useState<string | null>(null);
  const [autoAssignedDrones, setAutoAssignedDrones] = useState<string[]>([]);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [patrolSubmitted, setPatrolSubmitted] = useState(false);
  const [patrolSubmitSuccess, setPatrolSubmitSuccess] = useState<string | null>(null);
  const [deploymentZoneId, setDeploymentZoneId] = useState<string | null>(null);
  const [deploymentDroneIds, setDeploymentDroneIds] = useState<string[]>([]);

  // Wallet protection
  useEffect(() => {
    if (!walletConnected) {
      alert("Please connect your HashPack wallet first");
      router.push("/");
    }
  }, [walletConnected, router]);

  // Auto-sync drones from blockchain on mount
  useEffect(() => {
    fetch("/api/sync-blockchain", { method: "POST" })
      .then(() => refetchDrones())
      .catch((e) => console.warn("Background sync failed:", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Auto-submit patrol when countdown reaches 0
  useEffect(() => {
    if (countdown !== 0 || patrolSubmitted || !deploymentZoneId) return;
    const submitPatrolToVault = async () => {
      setPatrolSubmitted(true);
      try {
        const dronesList = deploymentDroneIds.length > 0 
          ? deploymentDroneIds.join(", ") 
          : "No drones assigned";
        console.log("✅ Patrol simulation complete - Zone:", deploymentZoneId, "Drones:", dronesList);
        setPatrolSubmitSuccess(`Gazebo simulation complete for zone ${deploymentZoneId} with ${deploymentDroneIds.length} drone(s)`);
      } catch (error: any) {
        console.error("⚠️ Patrol submission failed:", error.message);
        setPatrolSubmitSuccess("Simulation failed (see console)");
      }
    };
    submitPatrolToVault();
  }, [countdown, patrolSubmitted, deploymentZoneId, deploymentDroneIds]);

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
  const { data: dronesData, refetch: refetchDrones } = useQuery({
    queryKey: ["drones"],
    queryFn: async () => {
      const res = await fetch("/api/drones");
      const data = await res.json();
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
    if (walletInitializing) {
      alert("Wallet is initializing, please wait a moment...");
      return;
    }
    if (!walletConnected || !selectedAccount) {
      alert("Please connect your wallet first — coordinates are saved directly to the blockchain.");
      return;
    }

    setIsPaymentProcessing(true);
    try {
      const { ContractExecuteTransaction, ContractFunctionParameters, ContractId } = 
        await import("@hiero-ledger/sdk");
      const { ethers } = await import("ethers");

      const zoneIdBytes32 = ethers.id(zoneId);

      const provider = new ethers.JsonRpcProvider("https://testnet.hashio.io/api");
      const contract = new ethers.Contract(
        BOUNDARY_ZONE_REGISTRY_ADDRESS,
        BOUNDARY_ZONE_REGISTRY_ABI,
        provider
      );
      const [, timestamp] = await contract.getZone(zoneIdBytes32);
      if (Number(timestamp) > 0) {
        setIsPaymentProcessing(false);
        alert(`❌ Zone ID "${zoneId}" already exists on blockchain!\n\nPlease choose a different Zone ID.`);
        return;
      }

      const coordsStr = zoneId + "|" + boundaryCoords
        .flatMap(c => [
          Math.round(c.lat * 1_000_000).toString(),
          Math.round(c.lng * 1_000_000).toString(),
        ])
        .join(",");
      const coordsBytes = ethers.toUtf8Bytes(coordsStr);

      console.log(`⛓️ Creating boundary zone "${zoneId}"...`);

      const zoneTx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromEvmAddress(0, 0, BOUNDARY_ZONE_REGISTRY_ADDRESS))
        .setGas(500000)
        .setFunction(
          "createBoundaryZone",
          new ContractFunctionParameters()
            .addBytes32(ethers.getBytes(zoneIdBytes32))
            .addBytes(coordsBytes)
        );

      const txResult = await signAndExecuteTransaction(zoneTx);
      
      if (!txResult || !txResult.transactionId) {
        throw new Error("Transaction failed");
      }

      const txId = txResult.transactionId.toString();
      console.log("✅ Zone saved on-chain! TX:", txId);

      const zonesRes = await fetch("/api/zones/boundary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneId }),
      });
      const zonesResData = await zonesRes.json();

      setSavedZoneId(zoneId);
      setAutoAssignedDrones(zonesResData.autoAssignedDrones || []);
      setIsPaymentProcessing(false);

      refetchZones();
      refetchDrones();

    } catch (err: unknown) {
      const error = err as any;
      setIsPaymentProcessing(false);
      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        alert("Transaction cancelled.");
      } else {
        console.error("❌ Error:", error);
        alert("Error: " + (error.reason || error.message));
      }
    }
  };

  const handleConfirmAndProceed = async () => {
    const activeZoneId = selectedZone?.zoneId || savedZoneId;
    const activeBoundary = selectedZone?.coordinates || boundaryCoords;

    if (!activeZoneId || !activeBoundary || activeBoundary.length === 0) {
      alert("Please select an existing zone or create and save a new boundary first");
      return;
    }

    sessionStorage.setItem("pendingZoneId", activeZoneId);
    sessionStorage.setItem("pendingBoundary", JSON.stringify(activeBoundary));

    window.location.href = "/analysis";
  };

  return (
    <div className="scanlines min-h-screen bg-[#FAFAFA] grid-bg">
      {/* Header */}
      <div className="bg-[#FAFAFA] border-b border-[#D9D9D9] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 text-[#696969] hover:text-[#2E2E2E]">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-cyan-600" />
              <h1 className="text-xl font-bold text-[#2E2E2E]">Deploy Zone</h1>
            </div>
          </div>
          <p className="text-sm text-[#696969] font-mono">
            Connected: <span className="text-cyan-600">{selectedAccount?.id.substring(0, 12)}...</span>
          </p>
        </div>
      </div>

      {/* Main Content - Map + Sidebar */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Map Container */}
        <div className="flex-1 relative">
          <InteractiveMap
            onBoundaryComplete={handleBoundaryComplete}
            drones={dronesData?.drones || []}
            selectedZone={selectedZone}
          />
        </div>

        {/* Right Sidebar */}
        <div className="w-96 bg-[#FAFAFA] border-l border-[#D9D9D9] p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Select Existing Zone */}
            <div className="card card-offset border border-[#D9D9D9] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#2E2E2E]">Select Existing Zone</h3>
                <Badge variant="outline" className="text-cyan-600 border-cyan-400">
                  {zonesData?.count ?? 0}
                </Badge>
              </div>
              
              {zonesData?.zones && zonesData.zones.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {zonesData.zones.map((zone: any) => {
                    // Extract zone name from zoneId or coordinates data
                    const zoneName = zone.zoneName || zone.zoneId.split('|')[0] || zone.zoneId.substring(0, 20);
                    return (
                      <button
                        key={zone.zoneId}
                        onClick={() => {
                          setSelectedZone(zone);
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          selectedZone?.zoneId === zone.zoneId
                            ? "bg-cyan-50 border-cyan-500 text-cyan-700"
                            : "bg-white border-[#D9D9D9] text-[#2E2E2E] hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-semibold text-sm truncate">{zoneName}</div>
                        <div className="text-xs text-[#696969] mt-1">
                          {zone.drones?.length || 0} drone(s) • {zone.coordinates?.length || 0} points
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[#696969] text-center py-4">
                  No zones created yet
                </p>
              )}

              {selectedZone && (
                <Button
                  onClick={() => {
                    setSelectedZone(null);
                  }}
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-[#696969] hover:text-[#2E2E2E]"
                >
                  Clear Selection
                </Button>
              )}
            </div>

            {/* Create New Zone */}
            <div className="card card-offset border border-[#D9D9D9] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[#2E2E2E] mb-4">Create New Zone</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#696969] mb-2">
                    Zone ID
                  </label>
                  <input
                    type="text"
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    placeholder="e.g., patrol-zone-1"
                    className="w-full px-4 py-2 bg-white border border-[#D9D9D9] rounded-lg text-[#2E2E2E] placeholder-[#969696] focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {boundaryCoords && boundaryCoords.length > 0 && (
                  <div className="bg-green-50 border border-green-500 rounded-lg p-3">
                    <p className="text-sm text-green-700">
                      ✓ Boundary drawn: {boundaryCoords.length} points
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleSaveBoundary}
                  disabled={isPaymentProcessing || !boundaryCoords || boundaryCoords.length < 3 || !zoneId.trim()}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
                >
                  {isPaymentProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving to Blockchain...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Zone to Blockchain
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Success State */}
            {savedZoneId && (
              <div className="card card-offset border-2 border-green-500 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#2E2E2E]">Zone Created!</h3>
                    <p className="text-sm text-[#696969]">ID: {savedZoneId}</p>
                  </div>
                </div>
                
                {autoAssignedDrones.length > 0 && (
                  <div className="bg-[#F0F0F0] border border-[#D9D9D9] rounded-lg p-3 mb-4">
                    <p className="text-sm text-[#2E2E2E] mb-2">
                      Assigned Drones: {autoAssignedDrones.length}
                    </p>
                    <div className="space-y-1">
                      {autoAssignedDrones.slice(0, 3).map((droneId) => (
                        <div key={droneId} className="text-xs text-cyan-600 font-mono truncate">
                          • {droneId}
                        </div>
                      ))}
                      {autoAssignedDrones.length > 3 && (
                        <div className="text-xs text-[#696969]">
                          +{autoAssignedDrones.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {countdown !== null && countdown > 0 && (
                  <div className="bg-cyan-50 border border-cyan-500 rounded-lg p-3 mb-4">
                    <p className="text-sm text-cyan-700 text-center">
                      Simulation starts in {countdown}s...
                    </p>
                  </div>
                )}

                {patrolSubmitSuccess && (
                  <div className="bg-green-50 border border-green-500 rounded-lg p-3 mb-4">
                    <p className="text-xs text-green-700">{patrolSubmitSuccess}</p>
                  </div>
                )}

              </div>
            )}

            {/* Zone Ready for Analysis */}
            {(savedZoneId || selectedZone) && (
              <div className="card card-offset border border-cyan-500 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#2E2E2E] mb-4">Selected Zone</h3>
                <div className="bg-[#F0F0F0] border border-[#D9D9D9] rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-cyan-600" />
                    <span className="text-sm font-semibold text-[#2E2E2E]">
                      {selectedZone ? (selectedZone.zoneName || selectedZone.zoneId.split('|')[0] || selectedZone.zoneId.substring(0, 20)) : savedZoneId}
                    </span>
                  </div>
                  <div className="text-xs text-[#696969] space-y-1">
                    <p>• {(selectedZone?.coordinates?.length || boundaryCoords?.length || 0)} boundary points</p>
                    {selectedZone && selectedZone.drones && (
                      <p>• {selectedZone.drones.length} drone(s) assigned</p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleConfirmAndProceed}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Analyze & Deploy
                </Button>
              </div>
            )}

            {/* Available Drones */}
            <div className="card card-offset border border-[#D9D9D9] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[#2E2E2E] mb-4 flex items-center gap-2">
                <Plane className="h-5 w-5 text-cyan-600" />
                Available Drones
              </h3>
              {dronesData?.drones && dronesData.drones.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {dronesData.drones.map((drone: any) => (
                    <div
                      key={drone.evmAddress}
                      className="bg-white border border-[#D9D9D9] rounded-lg p-3 hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#2E2E2E]">{drone.cairnDroneId}</p>
                          <p className="text-xs text-[#696969] mt-1">{drone.model}</p>
                        </div>
                        <Badge className={drone.status === "ACTIVE" ? "bg-green-50 border-green-500 text-green-700" : "bg-gray-50 border-gray-400 text-gray-600"}>
                          {drone.status}
                        </Badge>
                      </div>
                      {drone.assignedZoneId !== "UNASSIGNED" && (
                        <p className="text-xs text-purple-600 mt-2">▸ Deployed: {drone.assignedZoneId.split('|')[0] || drone.assignedZoneId.substring(0, 15)}...</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#696969] text-center py-4">No drones registered</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
