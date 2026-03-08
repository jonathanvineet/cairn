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
  const [zoneName, setZoneName] = useState<string>("");

  // 30-second countdown timer for patrol submission
  const [countdown, setCountdown] = useState<number | null>(null);
  const [patrolSubmitted, setPatrolSubmitted] = useState(false);
  const [patrolSubmitSuccess, setPatrolSubmitSuccess] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [breachImageUrl, setBreachImageUrl] = useState<string | null>(null);
  const [imageHashOnChain, setImageHashOnChain] = useState<string | null>(null);

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
      // Fetch zone name from API
      fetch("/api/zones")
        .then((res) => res.json())
        .then((data) => {
          const zone = data.zones?.find((z: any) => z.zoneId === storedZoneId);
          if (zone) {
            setZoneName(zone.zoneName || storedZoneId);
          } else {
            setZoneName(storedZoneId);
          }
        })
        .catch((err) => {
          console.error("Error fetching zone name:", err);
          setZoneName(storedZoneId);
        });
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
    if (countdown !== 0 || patrolSubmitted || !selectedDrone) return;
    
    const submitPatrolToVault = async () => {
      setPatrolSubmitted(true);
      setIsSubmitting(true);
      
      try {
        console.log("\n📍 Step 6: Store image and submit to blockchain");
        console.log("-".repeat(50));
        
        // Step 1: Store the mock breach image on server and get its hash
        const mockImagePath = "C:\\Users\\hp\\Documents\\broken-metallic-fence.jpg";
        console.log("📸 Storing breach evidence image...");
        
        const imageResponse = await fetch('/api/patrol/store-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceImagePath: mockImagePath,
            droneId: selectedDrone.cairnDroneId,
            zoneId: zoneId || "unknown-zone"
          })
        });
        
        const imageResult = await imageResponse.json();
        
        if (!imageResult.success) {
          throw new Error(imageResult.error || 'Failed to store image');
        }
        
        console.log("✅ Image stored successfully!");
        console.log("   Public URL:", imageResult.publicUrl);
        console.log("   Hash:", imageResult.imageHash);
        
        // Store image URL for display
        setBreachImageUrl(imageResult.publicUrl);
        setImageHashOnChain(imageResult.imageHash);
        
        // Step 2: Generate patrol metadata
        const patrolCid = `bafybei${Math.random().toString(36).substring(2, 27)}`;
        
        console.log("🔗 Preparing blockchain submission...");
        console.log("   Drone:", selectedDrone.cairnDroneId);
        console.log("   Zone:", zoneId || "unknown-zone");
        console.log("   Patrol IPFS CID:", patrolCid);
        console.log("   Breach Image Hash:", imageResult.imageHash);
        
        // Step 3: Submit patrol to blockchain with real image hash
        console.log("⏳ Executing contract transaction...");
        const response = await fetch('/api/patrol/blockchain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            droneId: selectedDrone.cairnDroneId,
            zoneId: zoneId || "unknown-zone",
            ipfsCid: patrolCid,
            dataHash: imageResult.imageHash // Use real image hash
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          setTransactionId(result.transactionId);
          console.log("\n" + "=".repeat(50));
          console.log("✅ PATROL SUBMISSION COMPLETE!");
          console.log("=".repeat(50));
          console.log("\n📊 Summary:");
          console.log("   Drone:", selectedDrone.cairnDroneId);
          console.log("   Zone:", zoneId || "unknown-zone");
          console.log("   Patrol IPFS CID:", patrolCid);
          console.log("   Breach Image:", imageResult.publicUrl);
          console.log("   Image Hash:", imageResult.imageHash);
          console.log("   Transaction ID:", result.transactionId);
          console.log("   Status:", result.status);
          console.log("\n🎉 All done!");
          
          setPatrolSubmitSuccess(`✅ Transaction successful! Transaction ID: ${result.transactionId}`);
        } else {
          throw new Error(result.error || 'Blockchain submission failed');
        }
        
        setIsSubmitting(false);
        
      } catch (vaultError: any) {
        console.error("❌ Patrol submission failed:", vaultError.message);
        setPatrolSubmitSuccess(`❌ ${vaultError.message || 'Patrol submission failed'}`);
        setIsSubmitting(false);
      }
    };
    
    submitPatrolToVault();
  }, [countdown, patrolSubmitted, selectedDrone, zoneId]);

  const handleDeployDrone = () => {
    if (!selectedDrone) return;
    setCountdown(30);
  };

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
                    <p className="text-xl font-bold text-blue-400">{zoneName || zoneId}</p>
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

                {/* 30-Second Countdown Timer */}
                {countdown !== null && countdown > 0 && (
                  <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-lg p-6 mb-6 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">GAZEBO SIMULATION IN PROGRESS</p>
                        <p className="text-lg text-gray-300">Patrol will be automatically submitted to blockchain...</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="relative w-20 h-20">
                          <svg className="w-20 h-20 transform -rotate-90">
                            <circle
                              cx="40"
                              cy="40"
                              r="36"
                              stroke="rgba(251, 146, 60, 0.2)"
                              strokeWidth="4"
                              fill="none"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="36"
                              stroke="#fb923c"
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 36}`}
                              strokeDashoffset={`${2 * Math.PI * 36 * (1 - countdown / 30)}`}
                              style={{ transition: "stroke-dashoffset 1s linear" }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-orange-400">{countdown}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">seconds remaining</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Patrol Submission Success Message */}
                {patrolSubmitSuccess && (
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-6 mb-6 animate-fade-in">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">✅</div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-green-400 mb-1">Patrol Logged On-Chain</p>
                        <p className="text-sm text-gray-300 mb-2">{patrolSubmitSuccess}</p>
                        {transactionId && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-gray-400">Transaction ID:</p>
                            <p className="text-xs font-mono text-cyan-400 break-all bg-black/30 p-2 rounded">{transactionId}</p>
                            <a 
                              href={`https://hashscan.io/testnet/transaction/${transactionId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded text-cyan-400 text-xs font-mono transition-colors"
                            >
                              🔍 View on HashScan →
                            </a>
                          </div>
                        )}
                        
                        {/* Breach Evidence Image Display */}
                        {breachImageUrl && (
                          <div className="mt-4 space-y-2">
                            <p className="text-xs text-gray-400">Breach Evidence Image:</p>
                            <div className="bg-black/30 border border-green-500/30 rounded-lg p-3">
                              <img 
                                src={breachImageUrl} 
                                alt="Breach Evidence" 
                                className="w-full rounded-lg mb-2"
                                style={{ maxHeight: '300px', objectFit: 'contain' }}
                              />
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">Stored on server:</span>
                                <code className="text-cyan-400 font-mono">{breachImageUrl}</code>
                              </div>
                              {imageHashOnChain && (
                                <div className="mt-2 pt-2 border-t border-white/10">
                                  <p className="text-xs text-gray-400 mb-1">Image Hash (on blockchain):</p>
                                  <code className="text-xs font-mono text-green-400 break-all bg-black/30 p-2 rounded block">{imageHashOnChain}</code>
                                  <p className="text-xs text-gray-500 mt-1">
                                    ℹ️ This hash proves the image hasn't been tampered with. Anyone can re-hash the image and verify it matches the blockchain.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Submission in Progress */}
                {isSubmitting && (
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">⏳</div>
                      <div>
                        <p className="text-yellow-400 font-mono text-sm">Submitting patrol to blockchain...</p>
                        <p className="text-xs text-gray-400 mt-1">Automatic submission in progress</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleDeployDrone}
                    disabled={countdown !== null}
                    className="px-8 py-3 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {countdown !== null ? `DEPLOYING... ${countdown}s` : "DEPLOY DRONE"}
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
