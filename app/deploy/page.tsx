"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, CheckCircle2, Wallet, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DRONE_REGISTRY_ADDRESS, BOUNDARY_ZONE_REGISTRY_ADDRESS, BOUNDARY_ZONE_REGISTRY_ABI } from "@/lib/contracts";
import { ethers } from "ethers";

const InteractiveMap = dynamic(
  () => import("@/components/InteractiveMap").then((mod) => mod.InteractiveMap),
  { ssr: false }
);

interface Coordinate {
  lat: number;
  lng: number;
}

export default function DeployPage() {
  const [boundaryCoords, setBoundaryCoords] = useState<Coordinate[] | null>(null);
  const [zoneId, setZoneId] = useState("");
  const [savedZoneId, setSavedZoneId] = useState<string | null>(null);
  const [autoAssignedDrones, setAutoAssignedDrones] = useState<string[]>([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [boundaryFee, setBoundaryFee] = useState<string>("0.01");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any | null>(null);

  // Check wallet connection and auto-sync drones on mount
  useEffect(() => {
    checkWalletConnection();
    // Silently sync drones from blockchain in the background
    fetch("/api/sync-blockchain", { method: "POST" })
      .then(() => refetchDrones())
      .catch((e) => console.warn("Background sync failed:", e));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0].address);
          await fetchBoundaryFee();
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask to use this feature");
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletConnected(true);
      setWalletAddress(address);
      await fetchBoundaryFee();
      alert("Wallet connected successfully!");
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet: " + error.message);
    }
  };

  const fetchBoundaryFee = () => {
    // Fee is hardcoded in contract: 0.01 ether
    setBoundaryFee("0.01");
  };

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
      alert("Please connect MetaMask — coordinates are saved directly to the blockchain.");
      return;
    }

    setIsPaymentProcessing(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();

      // Convert zone ID to bytes32
      const zoneIdBytes32 = ethers.id(zoneId);

      // Encode coords as UTF-8 bytes: "lat0,lng0,lat1,lng1,..." (scaled by 1e6)
      const coordsStr = boundaryCoords
        .flatMap(c => [
          Math.round(c.lat * 1_000_000).toString(),
          Math.round(c.lng * 1_000_000).toString(),
        ])
        .join(",");
      const coordsBytes = ethers.toUtf8Bytes(coordsStr);

      // Encode calldata manually to avoid ethers contract wrapper BigNumberish quirks
      const iface = new ethers.Interface(BOUNDARY_ZONE_REGISTRY_ABI);
      const data = iface.encodeFunctionData("createBoundaryZone", [zoneIdBytes32, coordsBytes]);

      console.log(`⛓️ Sending createBoundaryZone("${zoneId}", ${boundaryCoords.length} points) to chain...`);
      const tx = await signer.sendTransaction({
        to: BOUNDARY_ZONE_REGISTRY_ADDRESS,
        data,
        value: BigInt("10000000000000000"), // 0.01 HBAR in weibars
      });

      console.log("⏳ Tx sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ Zone saved on-chain!", receipt?.hash);

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
      refetchZones();
      alert(`✅ Zone "${zoneId}" saved on blockchain!\n${zonesResData.autoAssignedCount || 0} drone(s) assigned.`);
    } catch (error: any) {
      setIsPaymentProcessing(false);
      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        alert("Transaction cancelled.");
      } else {
        console.error("❌ Error saving zone:", error);
        alert("Error: " + (error.reason || error.message));
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-forest-900 flex flex-col">
      {/* Minimal header */}
      <header className="border-b border-green-500/20 glass-dark backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-lg font-bold text-green-400">Deploy Mission</h1>
        <div className="flex items-center gap-2">
          {walletConnected ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              <Wallet className="h-3 w-3 mr-1" />
              {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
            </Badge>
          ) : (
            <Button variant="outline" size="sm" onClick={connectWallet} className="gap-2">
              <Wallet className="h-4 w-4" />
              Connect
            </Button>
          )}
        </div>
      </header>
      
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
        <div className="w-80 bg-forest-950 border-l border-green-500/20 p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Wallet Connection */}
            {!walletConnected && (
              <Card className="glass-strong border-blue-500/30">
                <CardContent className="pt-6">
                  <div className="text-center mb-3">
                    <Wallet className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-sm font-semibold text-blue-400 mb-1">Optional: Connect Wallet</p>
                    <p className="text-xs text-gray-400">Connect to enable blockchain payments (if contract supports it)</p>
                  </div>
                  <Button
                    onClick={connectWallet}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect MetaMask
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-2">You can save boundaries without connecting</p>
                </CardContent>
              </Card>
            )}
            
            {/* Saved Boundary Zones */}
            <Card className="glass-strong border-purple-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-purple-400">Saved Boundary Zones</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {zonesData?.count ?? 0}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {!zonesData || zonesData.count === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">No zones saved yet</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {zonesData.zones?.map((zone: any) => {
                      const isSelected = selectedZone?.zoneId === zone.zoneId;
                      return (
                        <div
                          key={zone.zoneId}
                          onClick={() => setSelectedZone(isSelected ? null : zone)}
                          className={`p-2.5 rounded border transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-purple-500/20 border-purple-500/60"
                              : "bg-white/5 border-white/10 hover:border-purple-500/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{zone.zoneId}</p>
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
            

            
            {/* Boundary Save Section */}
            <Card className="glass-strong border-green-500/30">
              <CardHeader>
                <CardTitle className="text-sm text-green-400">Create Boundary Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Fee Display - only show if wallet connected */}
                {walletConnected && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Blockchain Fee:</span>
                      <span className="text-sm font-bold text-blue-400">{boundaryFee} HBAR</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Payment will be attempted if contract supports it</p>
                  </div>
                )}
                
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Zone ID</label>
                  <input
                    type="text"
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    placeholder="e.g., Wayanad-11"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm"
                    disabled={!!savedZoneId}
                  />
                </div>
                
                {/* Status indicator */}
                {boundaryCoords && (
                  <Badge variant="outline" className="w-full justify-center bg-green-500/10 text-green-400 border-green-500/30">
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
                  ) : walletConnected ? (
                    <>
                      <Wallet className="h-4 w-4" />
                      Save Boundary (with payment)
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Boundary
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>



            {/* Available Drones */}
            {dronesData && dronesData.count > 0 && (
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
                      ?.filter((drone: any, index: number, self: any[]) => 
                        self.findIndex((d: any) => d.cairnDroneId === drone.cairnDroneId) === index
                      )
                      ?.map((drone: any) => (
                        <div
                          key={drone.cairnDroneId}
                          className="p-2.5 rounded bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-white">{drone.cairnDroneId}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{drone.model || "Unknown Model"}</p>
                            </div>
                            <Badge variant="outline" className="text-xs font-mono bg-green-500/10 text-green-400 border-green-500/30">
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
              <Card className="glass-strong border-green-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-green-400">Assigned Drones</CardTitle>
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
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
                          className="p-2.5 rounded bg-green-500/10 border border-green-500/30 flex items-center justify-between"
                        >
                          <span className="text-sm font-semibold text-white">{droneId}</span>
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
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
  );
}
