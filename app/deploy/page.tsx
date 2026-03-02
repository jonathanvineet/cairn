"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, CheckCircle2, Wallet } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
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

  // Check wallet connection on mount
  useEffect(() => {
    checkWalletConnection();
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

  const fetchBoundaryFee = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const contract = new ethers.Contract(
        BOUNDARY_ZONE_REGISTRY_ADDRESS,
        BOUNDARY_ZONE_REGISTRY_ABI,
        provider
      );
      const fee = await contract.getBoundaryCreationFee();
      const feeInEther = ethers.formatEther(fee);
      setBoundaryFee(feeInEther);
      console.log("Boundary creation fee:", feeInEther, "HBAR");
    } catch (error) {
      console.error("Error fetching fee:", error);
    }
  };

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

  // Mutation for saving boundary
  const saveBoundaryMutation = useMutation({
    mutationFn: async (data: { zoneId: string; coordinates: Coordinate[] }) => {
      console.log("📤 Posting to /api/zones/boundary:", data);
      const res = await fetch("/api/zones/boundary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const responseText = await res.text();
      console.log("📥 Response status:", res.status, "Body:", responseText);
      
      if (!res.ok) {
        throw new Error(`Failed to save boundary: ${responseText}`);
      }
      
      return JSON.parse(responseText);
    },
    onSuccess: (data) => {
      console.log("✅ Boundary saved successfully:", data);
      setSavedZoneId(zoneId);
      setAutoAssignedDrones(data.autoAssignedDrones || []);
      const droneCount = data.autoAssignedCount || 0;
      setIsPaymentProcessing(false);
      alert(`Boundary saved for ${zoneId}\n${droneCount} drone(s) assigned`);
    },
    onError: (error: any) => {
      console.error("❌ Error saving boundary:", error);
      setIsPaymentProcessing(false);
      alert(`Error saving boundary: ${error.message}`);
    },
  });

  // Mutation for assigning drones (kept for potential manual override)
  const assignDronesMutation = useMutation({
    mutationFn: async (data: { zoneId: string; droneIds: string[] }) => {
      const res = await fetch("/api/zones/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to assign drones");
      return res.json();
    },
    onSuccess: (data) => {
      alert(`Successfully assigned ${data.summary?.newAssignments || 0} drones to zone ${savedZoneId}`);
      refetchDrones();
    },
    onError: (error: any) => {
      alert(`Error assigning drones: ${error.message}`);
    },
  });

  // Mutation for syncing blockchain data
  const syncBlockchainMutation = useMutation({
    mutationFn: async () => {
      console.log("🔄 Starting blockchain sync...");
      const res = await fetch("/api/sync-blockchain", {
        method: "POST",
      });
      const data = await res.json();
      console.log("📦 Sync response:", data);
      if (!res.ok) throw new Error(data.error || "Failed to sync blockchain");
      return data;
    },
    onSuccess: (data) => {
      console.log("✅ Sync successful:", data);
      refetchDrones();
      alert(`Synced ${data.stats.newlySynced} drone(s) from blockchain`);
    },
    onError: (error: any) => {
      console.error("❌ Sync failed:", error);
      alert(`Error syncing blockchain: ${error.message}`);
    },
  });

  const handleBoundaryComplete = (coordinates: Coordinate[]) => {
    console.log("✅ Boundary completed callback received:", coordinates);
    setBoundaryCoords(coordinates);
  };

  const handleSaveBoundary = async () => {
    console.log("🔵 Save boundary clicked. Zone ID:", zoneId, "Coords:", boundaryCoords);
    
    if (!zoneId.trim()) {
      alert("Please enter a Zone ID");
      return;
    }
    if (!boundaryCoords || boundaryCoords.length < 3) {
      alert("Please draw a boundary first");
      return;
    }
    
    setIsPaymentProcessing(true);
    
    // If wallet is connected, try blockchain payment first
    if (walletConnected) {
      try {
        console.log("💰 Attempting blockchain payment...");
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          BOUNDARY_ZONE_REGISTRY_ADDRESS,
          BOUNDARY_ZONE_REGISTRY_ABI,
          signer
        );
        
        const feeInWei = ethers.parseEther(boundaryFee);
        console.log("Sending transaction with fee:", boundaryFee, "HBAR");
        
        const tx = await contract.createBoundaryZone(zoneId, {
          value: feeInWei,
          gasLimit: 300000
        });
        
        console.log("⏳ Transaction sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("✅ Payment confirmed!", receipt);
        
      } catch (contractError: any) {
        console.warn("⚠️ Blockchain transaction failed:", contractError);
        
        if (contractError.code === 4001) {
          setIsPaymentProcessing(false);
          alert("Transaction cancelled");
          return;
        }
        
        // Continue to database save even if blockchain fails
        console.log("💾 Blockchain payment not available, saving to database only...");
      }
    }
    
    // Save to database
    try {
      console.log("💾 Saving to database...");
      saveBoundaryMutation.mutate({ zoneId, coordinates: boundaryCoords });
    } catch (error: any) {
      console.error("❌ Error saving:", error);
      setIsPaymentProcessing(false);
      alert("Error: " + error.message);
    }
  };

  const handleAssignDrones = () => {
    if (!savedZoneId) {
      alert("Please save a boundary first");
      return;
    }
    if (autoAssignedDrones.length === 0) {
      alert("No drones registered for this zone yet. Register drones with this zone ID first.");
      return;
    }
    // Re-sync in case new drones were registered
    refetchDrones();
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
            
            {/* Blockchain Sync Alert */}
            {dronesData && dronesData.count === 0 && (
              <Card className="glass-strong border-purple-500/30">
                <CardContent className="pt-6">
                  <div className="text-center mb-3">
                    <p className="text-sm font-semibold text-purple-400 mb-2">No drones available</p>
                  </div>
                  <Button
                    onClick={() => syncBlockchainMutation.mutate()}
                    disabled={syncBlockchainMutation.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    {syncBlockchainMutation.isPending ? 'Syncing...' : 'Sync from Blockchain'}
                  </Button>
                </CardContent>
              </Card>
            )}
            

            
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
                    "Processing..."
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
