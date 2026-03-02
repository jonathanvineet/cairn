"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DRONE_REGISTRY_ADDRESS, BOUNDARY_ZONE_REGISTRY_ADDRESS } from "@/lib/contracts";

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
  const [selectedDrones, setSelectedDrones] = useState<string[]>([]);

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
      alert(`Boundary saved successfully for zone: ${zoneId}`);
    },
    onError: (error: any) => {
      console.error("❌ Error saving boundary:", error);
      alert(`Error saving boundary: ${error.message}`);
    },
  });

  // Mutation for assigning drones
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
      setSelectedDrones([]);
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
      alert(`✅ Synced ${data.stats.newlySynced} drones from blockchain!\n\nTotal on-chain: ${data.stats.totalOnChain}\nNewly synced: ${data.stats.newlySynced}\nAlready in DB: ${data.stats.skipped}`);
    },
    onError: (error: any) => {
      console.error("❌ Sync failed:", error);
      alert(`Error syncing blockchain: ${error.message}`);
    },
  });

  const handleBoundaryComplete = (coordinates: Coordinate[]) => {
    console.log("✅ Boundary completed callback received:", coordinates);
    setBoundaryCoords(coordinates);
    alert(`Boundary captured with ${coordinates.length} points! Now click "Save Boundary".`);
  };

  const handleSaveBoundary = () => {
    console.log("🔵 Save boundary clicked. Zone ID:", zoneId, "Coords:", boundaryCoords);
    
    if (!zoneId.trim()) {
      alert("Please enter a Zone ID");
      return;
    }
    if (!boundaryCoords || boundaryCoords.length < 3) {
      alert(`Please draw a boundary with at least 3 points. Current: ${boundaryCoords?.length || 0} points`);
      return;
    }
    
    console.log("🚀 Sending to API:", { zoneId, coordinates: boundaryCoords });
    saveBoundaryMutation.mutate({ zoneId, coordinates: boundaryCoords });
  };

  const handleAssignDrones = () => {
    if (!savedZoneId) {
      alert("Please save a boundary first");
      return;
    }
    if (selectedDrones.length === 0) {
      alert("Please select at least one drone");
      return;
    }
    assignDronesMutation.mutate({ zoneId: savedZoneId, droneIds: selectedDrones });
  };

  const toggleDroneSelection = (droneId: string) => {
    setSelectedDrones((prev) =>
      prev.includes(droneId)
        ? prev.filter((id) => id !== droneId)
        : [...prev, droneId]
    );
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
        <div className="w-24"></div> {/* Spacer for centering */}
      </header>
      
      {/* Full map with side panel */}
      <div className="flex-1 flex">
        <div className="flex-1">
          <InteractiveMap onBoundaryComplete={handleBoundaryComplete} />
        </div>

        {/* Right sidebar for boundary management */}
        <div className="w-80 bg-forest-950 border-l border-green-500/20 p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Blockchain Sync Alert - Shows when 0 drones found */}
            {dronesData && dronesData.count === 0 && (
              <div className="glass-strong border-purple-500/50 bg-purple-500/10 p-4 rounded-lg">
                <h3 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  Sync Required!
                </h3>
                <p className="text-xs text-gray-300 mb-3">
                  Your blockchain drones aren't in the local database. Click below to import them from the smart contract.
                </p>
                <Button
                  onClick={() => syncBlockchainMutation.mutate()}
                  disabled={syncBlockchainMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
                  size="sm"
                >
                  {syncBlockchainMutation.isPending ? (
                    <>⏳ Syncing from Blockchain...</>
                  ) : (
                    <>🔄 Sync Blockchain Drones</>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Contract: {DRONE_REGISTRY_ADDRESS.slice(0, 8)}...
                </p>
              </div>
            )}
            
            {/* Instructions */}
            {!savedZoneId && (
              <div className="glass-strong border-blue-500/30 p-3 rounded-lg">
                <h3 className="text-xs font-bold text-blue-400 mb-2">📍 HOW TO USE</h3>
                <ol className="text-xs text-gray-300 space-y-1 list-decimal list-inside">
                  <li>Click "Create Boundary" on map</li>
                  <li>Click map to add points</li>
                  <li>Click "Complete" button</li>
                  <li>Enter Zone ID below</li>
                  <li>Click "Save Boundary"</li>
                </ol>
                {dronesData?.count === 0 && (
                  <div className="mt-3 pt-3 border-t border-yellow-500/30">
                    <p className="text-xs text-yellow-400 mb-2">⚠️ No drones in local database!</p>
                    <p className="text-xs text-gray-400 mb-3">
                      If you already registered drones via blockchain, click "Sync from Blockchain" to import them.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => syncBlockchainMutation.mutate()}
                        disabled={syncBlockchainMutation.isPending}
                        className="w-full h-8 text-xs bg-purple-600 hover:bg-purple-700"
                      >
                        {syncBlockchainMutation.isPending ? "⏳ Syncing..." : "🔄 Sync Chain"}
                      </Button>
                      <Link href="/register" className="w-full">
                        <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                          + Register New
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Boundary Save Section */}
            <Card className="glass-strong border-green-500/30">
              <CardHeader>
                <CardTitle className="text-sm text-green-400">Save Boundary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Zone ID</label>
                  <input
                    type="text"
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    placeholder="e.g., ZONE-01"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm"
                    disabled={!!savedZoneId}
                  />
                </div>
                
                {/* Status indicator */}
                <div className="text-xs">
                  {boundaryCoords ? (
                    <div className="space-y-2">
                      <Badge variant="outline" className="w-full justify-center bg-green-500/10 text-green-400 border-green-500/30">
                        ✓ {boundaryCoords.length} points captured
                      </Badge>
                      {!savedZoneId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setBoundaryCoords(null);
                            alert("Boundary cleared. Draw a new one and click Complete.");
                          }}
                          className="w-full text-xs h-7 text-gray-400 hover:text-white"
                        >
                          Clear & Draw New
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Badge variant="outline" className="w-full justify-center bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                      ⚠ Draw boundary and click "Complete"
                    </Badge>
                  )}
                </div>
                
                <Button
                  onClick={handleSaveBoundary}
                  disabled={!boundaryCoords || !zoneId || saveBoundaryMutation.isPending || !!savedZoneId}
                  className="w-full gap-2"
                  size="sm"
                >
                  {saveBoundaryMutation.isPending ? (
                    "Saving..."
                  ) : savedZoneId ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Boundary {!boundaryCoords && "(needs boundary)"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Debug Panel - Always visible */}
            <Card className="glass-strong border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-xs text-purple-400">🔍 Debug Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Drones Loading:</span>
                  <span className={dronesLoading ? "text-yellow-400" : "text-green-400"}>
                    {dronesLoading ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">API Error:</span>
                  <span className="text-red-400">{dronesError ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Drones Found:</span>
                  <span className="text-white font-bold">
                    {dronesData?.count || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Boundary Saved:</span>
                  <span className={savedZoneId ? "text-green-400" : "text-gray-500"}>
                    {savedZoneId || "Not yet"}
                  </span>
                </div>
                
                {/* Contract Addresses */}
                <div className="pt-2 border-t border-white/10">
                  <p className="text-gray-500 font-semibold mb-1">Smart Contracts:</p>
                  <div className="space-y-1">
                    <div>
                      <p className="text-gray-500">DroneRegistry:</p>
                      <p className="font-mono text-green-400 break-all text-[10px]">
                        {DRONE_REGISTRY_ADDRESS}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">BoundaryZoneRegistry:</p>
                      <p className="font-mono text-blue-400 break-all text-[10px]">
                        {BOUNDARY_ZONE_REGISTRY_ADDRESS}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log("Full dronesData:", dronesData);
                      alert(`Drones: ${JSON.stringify(dronesData, null, 2)}`);
                    }}
                    className="h-7 text-xs"
                  >
                    View Raw
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => syncBlockchainMutation.mutate()}
                    disabled={syncBlockchainMutation.isPending}
                    className="h-7 text-xs bg-purple-600 hover:bg-purple-700"
                  >
                    {syncBlockchainMutation.isPending ? "⏳ Syncing..." : "🔄 Sync Chain"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Drone Assignment Section */}
            {savedZoneId && (
              <Card className="glass-strong border-blue-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-blue-400">Assign Drones</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetchDrones()}
                      className="h-6 px-2 text-xs"
                    >
                      🔄 Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Debug info */}
                  {dronesLoading && (
                    <p className="text-xs text-gray-400 text-center">Loading drones...</p>
                  )}
                  {dronesError && (
                    <p className="text-xs text-red-400 text-center">Error: {(dronesError as Error).message}</p>
                  )}
                  {dronesData && (
                    <p className="text-xs text-gray-400 text-center mb-2">
                      Found {dronesData.count || 0} drone(s) in database
                    </p>
                  )}
                  
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {dronesData?.drones
                      // Remove duplicates by cairnDroneId, keeping the first occurrence
                      ?.filter((drone: any, index: number, self: any[]) => 
                        self.findIndex((d: any) => d.cairnDroneId === drone.cairnDroneId) === index
                      )
                      ?.map((drone: any) => (
                      <div
                        key={`${drone.id}-${drone.cairnDroneId}`}
                        onClick={() => toggleDroneSelection(drone.cairnDroneId)}
                        className={`p-3 rounded cursor-pointer transition-colors ${
                          selectedDrones.includes(drone.cairnDroneId)
                            ? "bg-blue-500/20 border-2 border-blue-500"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <p className="text-sm font-semibold">{drone.cairnDroneId}</p>
                        <p className="text-xs text-gray-400">{drone.model}</p>
                      </div>
                    ))}
                    {(!dronesData?.drones || dronesData.drones.length === 0) && (
                      <p className="text-xs text-gray-500 text-center py-4">No drones available</p>
                    )}
                  </div>
                  <Button
                    onClick={handleAssignDrones}
                    disabled={selectedDrones.length === 0 || assignDronesMutation.isPending}
                    className="w-full gap-2"
                    size="sm"
                  >
                    {assignDronesMutation.isPending
                      ? "Assigning..."
                      : `Assign ${selectedDrones.length} Drone(s)`}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
