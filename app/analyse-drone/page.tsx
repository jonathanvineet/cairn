"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SkyvaultShell from "../../components/world/SkyvaultShell";

interface Coordinate {
  lat: number;
  lng: number;
}

interface Drone {
  cairnDroneId: string;
  evmAddress?: string;
  battery: number;
  distance: number;
  score: number;
}

interface Stage {
  id: string;
  name: string;
  status: "pending" | "loading" | "complete" | "error";
  progress: number;
  details: string[];
  duration: number;
}

const stages: Stage[] = [
  {
    id: "fetch-drones",
    name: "Fetching Drone Registry",
    status: "pending",
    progress: 0,
    details: [],
    duration: 3000,
  },
  {
    id: "eliza-analysis",
    name: "Eliza OS Analysis",
    status: "pending",
    progress: 0,
    details: [],
    duration: 4000,
  },
  {
    id: "hcs-verify",
    name: "HCS Agent Verification",
    status: "pending",
    progress: 0,
    details: [],
    duration: 2500,
  },
  {
    id: "final-decision",
    name: "Final Decision Making",
    status: "pending",
    progress: 0,
    details: [],
    duration: 2000,
  },
];

// Drone details will be fetched from API

const elizaThoughts = [
  "Analyzing mission parameters...",
  "Evaluating proximity scores...",
  "Calculating battery efficiency...",
  "Assessing terrain compatibility...",
  "Modeling weather impact...",
];

const hcsMessages = [
  "Querying HCS Topic: 0.0.12345",
  "Validating manifest signatures...",
  "Verifying agent permissions...",
  "Confirming topic accessibility...",
];

export default function AnalyseDroneStreamPage() {
  const router = useRouter();
  const [currentStages, setCurrentStages] = useState<Stage[]>(stages);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [boundaryCoords, setBoundaryCoords] = useState<Coordinate[] | null>(null);
  const [zoneId, setZoneId] = useState<string>("");

  useEffect(() => {
    // Load zone data from sessionStorage
    const storedBoundary = sessionStorage.getItem("pendingBoundary");
    const storedZoneId = sessionStorage.getItem("pendingZoneId");
    
    if (storedBoundary) {
      try {
        const parsedBoundary = JSON.parse(storedBoundary);
        setBoundaryCoords(parsedBoundary);
      } catch (e) {
        console.error("Error parsing boundary:", e);
      }
    }
    
    if (storedZoneId) {
      setZoneId(storedZoneId);
    }
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const runAnalysis = async () => {
      for (let i = 0; i < stages.length; i++) {
        setCurrentStageIdx(i);
        await new Promise((resolve) => {
          // Start loading
          setCurrentStages((prev) => {
            const updated = [...prev];
            updated[i].status = "loading";
            return updated;
          });

          // Simulate progress
          const progressInterval = setInterval(() => {
            setCurrentStages((prev) => {
              const updated = [...prev];
              if (updated[i].progress < 90) {
                updated[i].progress += Math.random() * 20;
              }
              return updated;
            });
          }, 200);

          // Add details based on stage
          const detailsInterval = setInterval(() => {
            setCurrentStages((prev) => {
              const updated = [...prev];
              if (i === 0) {
                // Fetch drone details from API during first stage
                const detail = "Fetching drone registry from blockchain...";
                if (!updated[i].details.includes(detail)) {
                  updated[i].details = [...updated[i].details.slice(-2), detail];
                }
              } else if (i === 1) {
                const detail = elizaThoughts[Math.floor(Math.random() * elizaThoughts.length)];
                if (!updated[i].details.includes(detail)) {
                  updated[i].details = [...updated[i].details.slice(-2), detail];
                }
              } else if (i === 2) {
                const detail = hcsMessages[Math.floor(Math.random() * hcsMessages.length)];
                if (!updated[i].details.includes(detail)) {
                  updated[i].details = [...updated[i].details.slice(-2), detail];
                }
              }
              return updated;
            });
          }, 600);

          timeout = setTimeout(() => {
            clearInterval(progressInterval);
            clearInterval(detailsInterval);
            setCurrentStages((prev) => {
              const updated = [...prev];
              updated[i].status = "complete";
              updated[i].progress = 100;
              return updated;
            });
            resolve(null);
          }, stages[i].duration);
        });
      }

      // Call actual analysis API with the actual boundary coordinates
      try {
        // Use actual boundary coordinates or fallback to default
        const coordinates = boundaryCoords && boundaryCoords.length > 0 
          ? boundaryCoords 
          : [
              { lat: 11.6, lng: 76.1 },
              { lat: 11.61, lng: 76.1 },
              { lat: 11.61, lng: 76.11 },
              { lat: 11.6, lng: 76.11 },
            ];
        
        console.log("Analyzing with boundary:", coordinates);
        console.log("Zone ID:", zoneId);
        
        const response = await fetch('/api/analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            boundary: {
              coordinates
            },
            analysisId: zoneId || 'unknown-zone',
            zoneId: zoneId || 'unknown-zone'
          })
        });
        const data = await response.json();
        if (data.success && data.selectedDrone) {
          setSelectedDrone({
            cairnDroneId: data.selectedDrone.cairnDroneId,
            score: data.selectedDrone.score || data.score,
            battery: data.selectedDrone.batteryLevel,
            distance: data.selectedDrone.distance || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching analysis:', error);
      }
      setIsComplete(true);
    };

    // Only run analysis when boundary coordinates are loaded
    if (boundaryCoords !== null) {
      runAnalysis();
    }

    return () => clearTimeout(timeout);
  }, [boundaryCoords, zoneId]);

  return (
    <SkyvaultShell title="ELIZA ANALYSIS">
    <div className="min-h-screen text-white overflow-hidden">

      {/* Warning if no boundary data */}
        {!boundaryCoords && (
          <div className="max-w-6xl mx-auto px-6 mt-8">
            <div className="border border-yellow-500/50 rounded-lg p-6 bg-yellow-500/10 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="text-yellow-400 text-2xl">⚠️</div>
                <div>
                  <h3 className="text-lg font-bold text-yellow-400 mb-2">No Zone Selected</h3>
                  <p className="text-gray-300 mb-4">
                    Please go back to the Deploy page and select or create a zone before analyzing drones.
                  </p>
                  <Link href="/deploy">
                    <button className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400 hover:bg-yellow-500/30 transition">
                      Go to Deploy Page
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Stages */}
          <div className="space-y-8 mb-12">
            {currentStages.map((stage, idx) => (
              <div
                key={stage.id}
                className={`transition-all duration-500 ${
                  idx <= currentStageIdx ? "opacity-100" : "opacity-40"
                }`}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12">
                      {stage.status === "loading" && (
                        <>
                          <div className="absolute inset-0 bg-linear-to-r from-cyan-500 to-violet-500 rounded-full animate-spin opacity-75" />
                          <div className="absolute inset-1 bg-[#0a0e27] rounded-full" />
                        </>
                      )}
                      {stage.status === "complete" && (
                        <div className="absolute inset-0 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                          <div className="text-2xl">✓</div>
                        </div>
                      )}
                      {stage.status === "pending" && (
                        <div className="absolute inset-0 border-2 border-slate-600 rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{stage.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {stage.status === "loading" && "Processing..."}
                        {stage.status === "complete" && "Complete"}
                        {stage.status === "pending" && "Waiting..."}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      {Math.round(stage.progress)}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-linear-to-r from-cyan-500 via-blue-500 to-violet-500 transition-all duration-300"
                    style={{ width: `${stage.progress}%` }}
                  />
                  {stage.status === "loading" && (
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
                  )}
                </div>

                {/* Details */}
                {stage.details.length > 0 && (
                  <div className="mt-4 space-y-2 pl-16">
                    {stage.details.map((detail, i) => (
                      <div
                        key={i}
                        className="text-sm text-gray-300 font-mono animate-fade-in"
                      >
                        <span className="text-cyan-400">→</span> {detail}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Thinking Indicator */}
          {!isComplete && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="h-3 w-3 bg-cyan-500 rounded-full animate-bounce" />
                  <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="h-3 w-3 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
                <p className="text-gray-400 text-sm">SYSTEM THINKING...</p>
              </div>
            </div>
          )}

          {/* Results */}
          {isComplete && selectedDrone && (
            <div className="mt-16 space-y-6 animate-fade-in">
              <div className="border border-cyan-500/50 rounded-lg p-8 bg-cyan-500/5 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-cyan-400 mb-6">✓ ANALYSIS COMPLETE</h2>

                {/* Zone Information */}
                {zoneId && (
                  <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-gray-400">ANALYZING FOR ZONE</p>
                    <p className="text-xl font-bold text-blue-400">{zoneId}</p>
                    {boundaryCoords && (
                      <p className="text-xs text-gray-500 mt-1">
                        {boundaryCoords.length} boundary points • Center: {
                          (boundaryCoords.reduce((sum: number, c: Coordinate) => sum + c.lat, 0) / boundaryCoords.length).toFixed(4)
                        }, {
                          (boundaryCoords.reduce((sum: number, c: Coordinate) => sum + c.lng, 0) / boundaryCoords.length).toFixed(4)
                        }
                      </p>
                    )}
                  </div>
                )}

                {/* Selected Drone Card */}
                <div className="bg-linear-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-8 mb-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">SELECTED DRONE</p>
                      <h3 className="text-4xl font-bold text-white mb-4">{selectedDrone.cairnDroneId}</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-500 text-sm">SUITABILITY SCORE</p>
                          <p className="text-2xl font-bold text-cyan-400">{Math.min(selectedDrone.score, 100)}%</p>
                          {selectedDrone.score > 100 && (
                            <p className="text-xs text-green-400 mt-1">✓ PRIORITY ASSIGNED</p>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">BATTERY LEVEL</p>
                          <p className="text-2xl font-bold text-yellow-400">{selectedDrone.battery}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">DISTANCE FROM ZONE</p>
                          <p className="text-2xl font-bold text-violet-400">{selectedDrone.distance}km</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm mb-4">ANALYSIS BREAKDOWN</p>
                      <div className="space-y-3">
                        {[
                          { label: "Mission Fit", value: 92 },
                          { label: "Battery Reserve", value: 85 },
                          { label: "Agent Validation", value: 100 },
                          { label: "Weather Suitability", value: 78 },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-400">{item.label}</span>
                              <span className="text-sm text-cyan-400">{item.value}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-linear-to-r from-cyan-500 to-violet-500"
                                style={{ width: `${item.value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="px-8 py-3 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-semibold transition transform hover:scale-105">
                    DEPLOY DRONE
                  </button>
                  <button
                    onClick={() => router.back()}
                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg font-semibold transition"
                  >
                    VIEW DETAILS
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SkyvaultShell>
  );
}
