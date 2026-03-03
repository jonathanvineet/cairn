"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Zap, Brain } from "lucide-react";

interface Thought {
  timestamp: number;
  phase: "assessment" | "evaluation" | "reasoning" | "decision" | "conclusion";
  thought: string;
  duration: number;
  revealed?: boolean;
}

interface AnalysisResult {
  selectedDrone: {
    cairnDroneId: string;
    evmAddress: string;
    batteryLevel: number;
    location: { lat: number; lng: number };
    health: string;
    agentTopicId?: string;
  };
  score: number;
  thoughts: Thought[];
  reasoning: string;
  confidence: number;
}

const phaseColors = {
  assessment: "border-blue-500/30 bg-blue-500/10",
  evaluation: "border-purple-500/30 bg-purple-500/10",
  reasoning: "border-cyan-500/30 bg-cyan-500/10",
  decision: "border-yellow-500/30 bg-yellow-500/10",
  conclusion: "border-green-500/30 bg-green-500/10",
};

const phaseIcons = {
  assessment: "🔍",
  evaluation: "⚡",
  reasoning: "🧠",
  decision: "🎯",
  conclusion: "✅",
};

const phaseLabels = {
  assessment: "Assessment",
  evaluation: "Evaluation",
  reasoning: "Reasoning",
  decision: "Decision",
  conclusion: "Conclusion",
};

export default function ElizaThinkingPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thoughts]);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setThoughts([]);
    setResult(null);

    try {
      const { runElizaAnalysis } = await import("@/lib/elizaAnalysis");

      // Sample boundary for demo
      const boundary = {
        coordinates: [
          { lat: 11.6, lng: 76.1 },
          { lat: 11.65, lng: 76.1 },
          { lat: 11.65, lng: 76.15 },
          { lat: 11.6, lng: 76.15 },
        ],
      };

      const analysisResult = await runElizaAnalysis(boundary, (thought) => {
        setThoughts((prev) => [
          ...prev,
          { ...thought, revealed: false },
        ]);
      });

      // Animate reveal of each thought
      setTimeout(() => {
        setThoughts((prev) =>
          prev.map((t, i) => ({
            ...t,
            revealed: true,
          }))
        );
      }, 100);

      setResult(analysisResult);
    } catch (err: any) {
      setError(err.message || "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-transparent to-purple-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-green-500/20 glass-dark backdrop-blur-xl px-6 py-4 sticky top-0">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Link href="/deploy">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-cyan-400 animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Eliza Analysis
              </h1>
            </div>
            <div className="w-24" />
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {/* Start Button */}
          {!isAnalyzing && thoughts.length === 0 && (
            <Card className="glass-strong border-purple-500/30 text-center py-12">
              <CardContent className="space-y-4">
                <div className="text-5xl mb-4">🤖</div>
                <h2 className="text-2xl font-bold text-white">Eliza AI Analysis</h2>
                <p className="text-gray-400">
                  Watch as Eliza OS thinks through the optimal drone selection for your mission.
                </p>
                <Button
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                >
                  <Play className="h-5 w-5" />
                  Start Analysis
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Thinking Stream */}
          {(isAnalyzing || thoughts.length > 0) && (
            <div
              ref={scrollRef}
              className="glass-strong border border-cyan-500/30 rounded-lg p-6 space-y-4 max-h-[600px] overflow-y-auto"
              style={{
                scrollBehavior: "smooth",
              }}
            >
              {thoughts.length === 0 && isAnalyzing && (
                <div className="flex items-center gap-3 py-4">
                  <div className="relative h-8 w-8">
                    <div className="absolute inset-0 bg-cyan-500 rounded-full animate-pulse" />
                    <div className="absolute inset-1 bg-cyan-600 rounded-full animate-ping" />
                  </div>
                  <p className="text-cyan-400 animate-pulse">Thinking...</p>
                </div>
              )}

              {thoughts.map((thought, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${phaseColors[thought.phase]} transition-all duration-500 ${
                    thought.revealed ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{phaseIcons[thought.phase]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-300 mb-1">
                        {phaseLabels[thought.phase]}
                      </p>
                      <p className="text-sm text-gray-200 leading-relaxed break-words">
                        {thought.thought}
                      </p>
                      {thought.duration > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          +{Math.round(thought.duration)}ms
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isAnalyzing && thoughts.length > 0 && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce" />
                    <div className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <Card className="border-red-500/30 bg-red-500/10">
              <CardContent className="pt-6">
                <p className="text-red-400 font-semibold">Analysis Failed</p>
                <p className="text-sm text-red-300 mt-2">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Decision Card */}
              <Card className="glass-strong border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Final Decision
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold text-green-300">
                          {result.selectedDrone.cairnDroneId}
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-1">
                          {result.selectedDrone.evmAddress.slice(0, 10)}...
                        </p>
                      </div>
                      <Badge className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 border-yellow-500/30 text-lg px-4 py-2">
                        {result.score}/100
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span>🔋</span>
                        <span className="text-sm">Battery: {result.selectedDrone.batteryLevel}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span className="text-sm">
                          Location: {result.selectedDrone.location.lat.toFixed(4)}°,{" "}
                          {result.selectedDrone.location.lng.toFixed(4)}°
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⚙️</span>
                        <span className="text-sm capitalize">Health: {result.selectedDrone.health}</span>
                      </div>
                      {result.selectedDrone.agentTopicId && (
                        <div className="flex items-center gap-2">
                          <span>✅</span>
                          <span className="text-sm">Hedera Agent: Verified</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-cyan-500/10 rounded border border-cyan-500/20 mb-4">
                      <p className="text-xs text-cyan-300 font-semibold mb-1">Confidence</p>
                      <div className="w-full bg-black/30 rounded h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded transition-all"
                          style={{ width: `${result.confidence}%` }}
                        />
                      </div>
                      <p className="text-xs text-cyan-400 mt-2">{result.confidence}% mission fit</p>
                    </div>

                    <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
                      <Zap className="h-4 w-4" />
                      Deploy Selected Drone
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Reasoning */}
              <Card className="glass-strong border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-400">Analysis Reasoning</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.reasoning.split("\n").map((line, idx) => (
                      <div key={idx} className="p-3 bg-cyan-500/5 rounded border border-cyan-500/20">
                        <p className="text-sm text-gray-300">{line}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
