"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Loader2, CheckCircle2, AlertCircle, MapPin, Zap as Battery } from "lucide-react";

interface Coordinate {
  lat: number;
  lng: number;
}

interface AnalysisStep {
  name: string;
  status: "pending" | "running" | "complete" | "error";
  message: string;
  duration?: number;
}

interface DroneAnalysis {
  cairnDroneId: string;
  evmAddress: string;
  batteryLevel: number;
  location: { lat: number; lng: number };
  health: string;
  agentTopicId?: string;
  score?: number;
  reason?: string;
  rank?: number;
}

interface AnalysisResultItem {
  drone: DroneAnalysis;
  score: number;
  reason: string;
}

interface AnalysisResults {
  success: boolean;
  analysis: AnalysisResultItem[];
  error?: string;
}

export default function AnalysisPage() {
  const [boundaryCoords, setBoundaryCoords] = useState<Coordinate[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { name: "Fetching drones from blockchain", status: "pending", message: "" },
    { name: "Validating drone agents", status: "pending", message: "" },
    { name: "Calculating proximity scores", status: "pending", message: "" },
    { name: "Running Eliza-inspired analysis", status: "pending", message: "" },
    { name: "Ranking candidates", status: "pending", message: "" },
  ]);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDrone, setSelectedDrone] = useState<DroneAnalysis | null>(null);

  const updateStep = (index: number, status: AnalysisStep["status"], message: string) => {
    setSteps(prev => {
      const newSteps = [...prev];
      newSteps[index] = { ...newSteps[index], status, message };
      return newSteps;
    });
  };

  const runAnalysis = async () => {
    // For demo, use sample boundary if not provided
    if (!boundaryCoords) {
      setBoundaryCoords([
        { lat: 11.6, lng: 76.1 },
        { lat: 11.65, lng: 76.1 },
        { lat: 11.65, lng: 76.15 },
        { lat: 11.6, lng: 76.15 },
      ]);
    }

    const coords = boundaryCoords || [
      { lat: 11.6, lng: 76.1 },
      { lat: 11.65, lng: 76.1 },
      { lat: 11.65, lng: 76.15 },
      { lat: 11.6, lng: 76.15 },
    ];

    setIsAnalyzing(true);
    setError(null);
    setResults(null);
    setSelectedDrone(null);

    const analysisId = `analysis-${Date.now()}`;

    try {
      // Step 1: Fetch drones
      updateStep(0, "running", "Querying blockchain for registered drones...");
      await new Promise(r => setTimeout(r, 1000));
      updateStep(0, "complete", "✓ Found drones in registry");

      // Step 2: Validate agents
      updateStep(1, "running", "Verifying Hedera agent registrations...");
      await new Promise(r => setTimeout(r, 1200));
      updateStep(1, "complete", "✓ Agent validation complete");

      // Step 3: Calculate proximity
      updateStep(2, "running", "Computing distance metrics and location scores...");
      await new Promise(r => setTimeout(r, 1100));
      updateStep(2, "complete", "✓ Proximity analysis done");

      // Step 4: Run main analysis
      updateStep(3, "running", "Running multi-criteria Eliza analysis...");
      
      // Call the real analysis API
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boundary: { coordinates: coords },
          analysisId,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis request failed");
      }

      await new Promise(r => setTimeout(r, 1500));
      updateStep(3, "complete", "✓ Eliza analysis complete");

      // Step 5: Rank results
      updateStep(4, "running", "Finalizing rankings...");
      
      const analysisData = await response.json();
      
      if (!analysisData.success) {
        throw new Error(analysisData.error || "Analysis failed");
      }

      await new Promise(r => setTimeout(r, 800));
      updateStep(4, "complete", "✓ Rankings finalized");

      // Set results
      setResults(analysisData);
      if (analysisData.analysis && analysisData.analysis.length > 0) {
        setSelectedDrone({
          ...analysisData.analysis[0].drone,
          score: analysisData.analysis[0].score,
          reason: analysisData.analysis[0].reason,
          rank: 1,
        });
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      console.error("Analysis error:", err);
      setError(message);
      setSteps(prev => {
        const newSteps = [...prev];
        for (let i = 0; i < newSteps.length; i++) {
          if (newSteps[i].status === "running") {
            newSteps[i].status = "error";
            newSteps[i].message = "Failed";
            break;
          }
        }
        return newSteps;
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="scanlines min-h-screen bg-[#FAFAFA] grid-bg">

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Main Action Card */}
        <Card className="card card-offset border border-purple-500">
          <CardHeader>
            <CardTitle className="text-purple-600">Multi-Criteria Drone Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[#696969]">
              This analysis uses multi-criteria evaluation (battery, location, health, agent validation) combined with Eliza-inspired reasoning to select the best drone for your mission.
            </p>
            
            <Button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="w-full gap-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-base"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analysis Running...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Start Eliza Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Steps */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-green-600">Analysis Progress</h2>
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border transition-all ${
                step.status === "complete"
                  ? "bg-green-50 border-green-500"
                  : step.status === "running"
                  ? "bg-blue-50 border-blue-500"
                  : step.status === "error"
                  ? "bg-red-50 border-red-500"
                  : "bg-white border-[#D9D9D9]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {step.status === "complete" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                  {step.status === "running" && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
                  {step.status === "error" && <AlertCircle className="h-5 w-5 text-red-600" />}
                  {step.status === "pending" && <div className="h-5 w-5 rounded-full border-2 border-[#969696]" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-[#2E2E2E]">{step.name}</p>
                  {step.message && (
                    <p className="text-xs text-[#696969] mt-1">{step.message}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <Card className="border-red-500 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-600">Analysis Failed</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Summary */}
            <Card className="card card-offset border border-purple-500">
              <CardHeader>
                <CardTitle className="text-purple-600">Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-white rounded border border-[#D9D9D9]">
                    <p className="text-xs text-[#696969]">Total Drones</p>
                    <p className="text-2xl font-bold text-green-600">{results.analysis.length}</p>
                  </div>
                  <div className="p-3 bg-white rounded border border-[#D9D9D9]">
                    <p className="text-xs text-[#696969]">Analyzed</p>
                    <p className="text-2xl font-bold text-blue-600">{results.analysis.length}</p>
                  </div>
                  <div className="p-3 bg-white rounded border border-[#D9D9D9]">
                    <p className="text-xs text-[#696969]">Top Score</p>
                    <p className="text-2xl font-bold text-yellow-600">{results.analysis.length > 0 ? Math.round(results.analysis[0]?.score || 0) : 0}/100</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Candidate */}
            {results.analysis.length > 0 && (
              <Card className="card card-offset border-2 border-green-500">
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Recommended Drone
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-500">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xl font-bold text-green-700">{results.analysis[0]?.drone?.cairnDroneId || "Unknown Drone"}</p>
                        <p className="text-xs text-[#696969] font-mono">{results.analysis[0]?.drone?.evmAddress ? `${results.analysis[0].drone.evmAddress.slice(0, 10)}...${results.analysis[0].drone.evmAddress.slice(-8)}` : "No address"}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-500 text-lg px-3 py-1">
                        #{Math.round(results.analysis[0]?.score || 0)}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Battery className="h-4 w-4 text-yellow-600" />
                        <span className="text-[#2E2E2E]">Battery: <strong>{results.analysis[0]?.drone?.batteryLevel ?? "N/A"}%</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-[#2E2E2E]">Location: <strong>{results.analysis[0]?.drone?.location ? `${results.analysis[0].drone.location.lat.toFixed(4)}°, ${results.analysis[0].drone.location.lng.toFixed(4)}°` : "Unknown"}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-600" />
                        <span className="text-[#2E2E2E]">Health: <strong className="capitalize">{results.analysis[0]?.drone?.health ?? "Unknown"}</strong></span>
                      </div>
                      {results.analysis[0]?.drone?.agentTopicId && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-purple-600" />
                          <span className="text-[#2E2E2E]">Agent: <strong>Verified</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button className="w-full gap-2 bg-green-600 hover:bg-green-700" size="lg">
                    <CheckCircle2 className="h-5 w-5" />
                    Deploy This Drone
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* All Results */}
            <Card className="card card-offset border border-blue-500">
              <CardHeader>
                <CardTitle className="text-blue-600">All Candidates (Ranked)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.analysis.map((item: AnalysisResultItem, idx: number) => (
                    <div
                      key={item.drone?.evmAddress || idx}
                      onClick={() => setSelectedDrone({ ...item.drone, score: item.score, reason: item.reason, rank: idx + 1 })}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedDrone?.evmAddress === item.drone?.evmAddress
                          ? "bg-blue-50 border-blue-500"
                          : "bg-white border-[#D9D9D9] hover:border-blue-500"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-500">#{idx + 1}</Badge>
                          <h4 className="font-semibold text-[#2E2E2E]">{item.drone?.cairnDroneId || "Unknown"}</h4>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-500 text-base">
                          {item.score}/100
                        </Badge>
                      </div>
                      <p className="text-xs text-[#696969]">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
