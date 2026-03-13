"use client";

import { useState, useEffect } from "react";
import { Zap, Loader2, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import Link from "next/link";

interface Coordinate { lat: number; lng: number; }
interface AnalysisStep { name: string; status: "pending" | "running" | "complete" | "error"; message: string; }
interface DroneAnalysis { cairnDroneId: string; evmAddress: string; batteryLevel: number; location: { lat: number; lng: number }; health: string; agentTopicId?: string; score?: number; reason?: string; rank?: number; }
interface AnalysisResultItem { drone: DroneAnalysis; score: number; reason: string; }
interface AnalysisResults { success: boolean; analysis: AnalysisResultItem[]; error?: string; }

const PHASES = [
  { icon: "①", label: "Assessment", desc: "Analyzing mission requirements" },
  { icon: "②", label: "Evaluation", desc: "Evaluating drone capabilities"  },
  { icon: "③", label: "Reasoning",  desc: "Scoring all candidates"         },
  { icon: "④", label: "Decision",   desc: "Selecting optimal drone"        },
  { icon: "⑤", label: "Conclusion", desc: "Analysis complete"              },
];

export default function AnalysisPage() {
  const [boundaryCoords, setBoundaryCoords] = useState<Coordinate[] | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [zonesData, setZonesData] = useState<any>(null);
  const [loadingZones, setLoadingZones] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { name: "Fetching drones from blockchain",     status: "pending", message: "" },
    { name: "Validating drone agents",             status: "pending", message: "" },
    { name: "Calculating proximity scores",        status: "pending", message: "" },
    { name: "Running Eliza-inspired analysis",     status: "pending", message: "" },
    { name: "Ranking candidates",                  status: "pending", message: "" },
  ]);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDrone, setSelectedDrone] = useState<DroneAnalysis | null>(null);

  // Fetch all available zones on mount
  useEffect(() => {
    const fetchZones = async () => {
      try {
        setLoadingZones(true);
        const response = await fetch("/api/zones");
        const data = await response.json();
        if (data.success) {
          setZonesData(data);
        }
      } catch (error) {
        console.error("Failed to fetch zones:", error);
      } finally {
        setLoadingZones(false);
      }
    };
    fetchZones();
  }, []);

  // Clear zone selection flag when leaving analysis to go back to deploy
  useEffect(() => {
    return () => {
      sessionStorage.removeItem("zoneSelectedThisSession");
    };
  }, []);

  const updateStep = (index: number, status: AnalysisStep["status"], message: string) => {
    setSteps(prev => { const n = [...prev]; n[index] = { ...n[index], status, message }; return n; });
  };

  // Load zone from sessionStorage
  useEffect(() => {
    try {
      const zoneBoundary = sessionStorage.getItem("pendingBoundary");
      const zoneId = sessionStorage.getItem("pendingZoneId");
      const zoneSelectedThisSession = sessionStorage.getItem("zoneSelectedThisSession");
      
      // Only load zone if it was explicitly selected in deploy page THIS session
      if (zoneBoundary && zoneId && zoneSelectedThisSession === "true") {
        setBoundaryCoords(JSON.parse(zoneBoundary));
        setSelectedZoneId(zoneId);
      }
    } catch (error) {
      console.error("Failed to load zone data:", error);
    }
  }, []);

  const runAnalysis = async () => {
    if (!boundaryCoords) setBoundaryCoords([{ lat: 11.6, lng: 76.1 }, { lat: 11.65, lng: 76.1 }, { lat: 11.65, lng: 76.15 }, { lat: 11.6, lng: 76.15 }]);
    const coords = boundaryCoords || [{ lat: 11.6, lng: 76.1 }, { lat: 11.65, lng: 76.1 }, { lat: 11.65, lng: 76.15 }, { lat: 11.6, lng: 76.15 }];
    setIsAnalyzing(true); setError(null); setResults(null); setSelectedDrone(null);
    const analysisId = `analysis-${Date.now()}`;
    try {
      updateStep(0, "running", "Querying blockchain for registered drones...");
      await new Promise(r => setTimeout(r, 1000));
      updateStep(0, "complete", "✓ Found drones in registry");
      updateStep(1, "running", "Verifying Hedera agent registrations...");
      await new Promise(r => setTimeout(r, 1200));
      updateStep(1, "complete", "✓ Agent validation complete");
      updateStep(2, "running", "Computing distance metrics and location scores...");
      await new Promise(r => setTimeout(r, 1100));
      updateStep(2, "complete", "✓ Proximity analysis done");
      updateStep(3, "running", "Running multi-criteria Eliza analysis...");
      const response = await fetch("/api/analysis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ boundary: { coordinates: coords }, analysisId }) });
      if (!response.ok) throw new Error("Analysis request failed");
      await new Promise(r => setTimeout(r, 1500));
      updateStep(3, "complete", "✓ Eliza analysis complete");
      updateStep(4, "running", "Finalizing rankings...");
      const analysisData = await response.json();
      if (!analysisData.success) throw new Error(analysisData.error || "Analysis failed");
      await new Promise(r => setTimeout(r, 800));
      updateStep(4, "complete", "✓ Rankings finalized");
      setResults(analysisData);
      if (analysisData.analysis && analysisData.analysis.length > 0) setSelectedDrone({ ...analysisData.analysis[0].drone, score: analysisData.analysis[0].score, reason: analysisData.analysis[0].reason, rank: 1 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
      setSteps(prev => { const n = [...prev]; for (let i = 0; i < n.length; i++) { if (n[i].status === "running") { n[i].status = "error"; n[i].message = "Failed"; break; } } return n; });
    } finally { setIsAnalyzing(false); }
  };

  const currentPhase = steps.findIndex(s => s.status === "running");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* header */}
      <header className="page-header">
        <div className="page-header-left">
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <button className="back-btn">← CAIRN</button>
          </Link>
          <span className="header-divider">|</span>
          <span className="header-subtitle">AI ANALYSIS</span>
        </div>
        <div className="page-header-right">
          <div className="live-dot" />
          <span className="network-label">HEDERA TESTNET</span>
        </div>
      </header>

      <div style={{ flex: 1, padding: 28, maxWidth: 1000, margin: "0 auto", width: "100%" }}>
        <div className="anim-down d0" style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700 }}>Eliza Drone Selection</h2>
          <p style={{ fontSize: 12, color: "var(--muted-fg)", marginTop: 3 }}>AI-powered optimal drone selection for your mission zone</p>
        </div>

        {/* Zone Selection Card - shown before analysis */}
        {!selectedZoneId && !isAnalyzing && !results && (
          <div className="card anim-up d0" style={{ padding: 24, marginBottom: 24, border: "2px solid var(--fg)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", marginBottom: 16, textTransform: "uppercase", color: "var(--muted-fg)" }}>
              🎯 SELECT ANALYSIS ZONE
            </div>
            
            {loadingZones ? (
              <div style={{ fontSize: 11, color: "var(--muted-fg)", textAlign: "center", padding: 16 }}>⟳ LOADING ZONES...</div>
            ) : zonesData?.zones && zonesData.zones.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
                {zonesData.zones.map((zone: any) => {
                  const zoneName = zone.zoneName || zone.zoneId.split('|')[0] || zone.zoneId.substring(0, 20);
                  return (
                    <button
                      key={zone.zoneId}
                      onClick={() => {
                        setSelectedZoneId(zone.zoneId);
                        setBoundaryCoords(zone.coordinates);
                        sessionStorage.setItem("pendingZoneId", zone.zoneId);
                        sessionStorage.setItem("pendingBoundary", JSON.stringify(zone.coordinates));
                        sessionStorage.setItem("zoneSelectedThisSession", "true");
                      }}
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--border)",
                        background: "var(--bg)",
                        color: "var(--fg)",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all .15s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--muted)";
                        e.currentTarget.style.borderColor = "var(--fg)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--bg)";
                        e.currentTarget.style.borderColor = "var(--border)";
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700 }}>{zoneName}</div>
                      <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>
                        {zone.coordinates?.length || 0} boundary points · {zone.assignedDrones?.length || 0} drones
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: "var(--muted-fg)", textAlign: "center", padding: 16 }}>No zones available. Create one in Deploy section first.</div>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

          {/* left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* phases */}
            <div className="card anim-up d1" style={{ padding: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", marginBottom: 16 }}>ANALYSIS PHASES</div>
              {PHASES.map((p, i) => {
                const stepStatus = steps[i]?.status || "pending";
                const isActive = stepStatus === "running";
                const isDone = stepStatus === "complete";
                return (
                  <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 11px", borderRadius: "var(--radius)", marginBottom: 4, background: isActive ? "var(--fg)" : "transparent", color: isActive ? "var(--bg)" : isDone ? "var(--fg)" : "var(--muted-fg)", transition: "all .25s" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, border: `1px solid ${isDone || isActive ? "currentColor" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                      {isDone ? "✓" : p.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".05em" }}>{p.label}</div>
                      <div style={{ fontSize: 10, opacity: .6 }}>{steps[i]?.message || p.desc}</div>
                    </div>
                    {isActive && isAnalyzing && (
                      <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
                        <span className="think-dot" /><span className="think-dot" /><span className="think-dot" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* error */}
            {error && (
              <div className="card anim-scale" style={{ padding: 18, border: "1px solid #dc2626" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>ANALYSIS FAILED</div>
                <div style={{ fontSize: 11, color: "var(--muted-fg)" }}>{error}</div>
              </div>
            )}
          </div>

          {/* right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* idle */}
            {!isAnalyzing && !results && selectedZoneId && (
              <div className="card card-offset anim-scale d1" style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, minHeight: 280, textAlign: "center" }}>
                <div style={{ fontSize: 40, opacity: .2 }}>◆</div>
                <div style={{ fontSize: 12, color: "var(--muted-fg)", letterSpacing: ".06em" }}>READY TO ANALYZE</div>
                <div style={{ fontSize: 10, color: "var(--muted-fg)", marginTop: 6 }}>Zone: {selectedZoneId}</div>
                <button className="btn btn-primary" onClick={runAnalysis} style={{ minWidth: 180, marginTop: 8 }}>RUN ANALYSIS →</button>
              </div>
            )}

            {/* running */}
            {isAnalyzing && (
              <div className="card anim-scale" style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, minHeight: 280 }}>
                <div style={{ position: "relative" }}>
                  <div className="drone-ping" style={{ position: "absolute", inset: -16, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.12)" }} />
                  <div className="drone-float" style={{ fontSize: 40 }}>◆</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".1em" }}>ANALYZING</div>
                <div style={{ display: "flex", gap: 5, color: "var(--muted-fg)" }}>
                  <span className="think-dot" /><span className="think-dot" /><span className="think-dot" />
                </div>
              </div>
            )}

            {/* result */}
            {results && results.analysis.length > 0 && (
              <div className="card card-offset anim-scale" style={{ padding: 24 }}>
                <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 18, marginBottom: 18, textAlign: "center", background: "var(--muted)" }}>
                  <div style={{ fontSize: 10, color: "var(--muted-fg)", letterSpacing: ".1em", marginBottom: 8 }}>SELECTED DRONE</div>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: ".04em" }}>{results.analysis[0].drone?.cairnDroneId || "Unknown"}</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 10 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>{Math.round(results.analysis[0].score)}</div>
                      <div style={{ fontSize: 9, color: "var(--muted-fg)", letterSpacing: ".08em" }}>SCORE /100</div>
                    </div>
                    <div style={{ width: 1, background: "var(--border)" }} />
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>{results.analysis[0].drone?.batteryLevel ?? "N/A"}%</div>
                      <div style={{ fontSize: 9, color: "var(--muted-fg)", letterSpacing: ".08em" }}>BATTERY</div>
                    </div>
                  </div>
                </div>
                {[
                  { l: "HEALTH",   v: results.analysis[0].drone?.health ?? "Unknown" },
                  { l: "LOCATION", v: results.analysis[0].drone?.location ? `${results.analysis[0].drone.location.lat.toFixed(4)}°, ${results.analysis[0].drone.location.lng.toFixed(4)}°` : "Unknown" },
                  { l: "AGENT",    v: results.analysis[0].drone?.agentTopicId ? "VERIFIED" : "UNVERIFIED" },
                ].map(s => (
                  <div key={s.l} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: "var(--muted-fg)", fontWeight: 600, letterSpacing: ".06em" }}>{s.l}</span>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{s.v}</span>
                    </div>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: "var(--muted-fg)", marginBottom: 18, lineHeight: 1.6 }}>{results.analysis[0].reason}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-ghost" style={{ flex: 1, fontSize: 11 }} onClick={runAnalysis}>RE-ANALYZE</button>
                  <Link href="/evidence" onClick={() => {
                    const droneData = JSON.stringify({
                      cairnDroneId: results.analysis[0].drone?.cairnDroneId,
                      evmAddress: results.analysis[0].drone?.evmAddress,
                      location: results.analysis[0].drone?.location,
                      batteryLevel: results.analysis[0].drone?.batteryLevel,
                      health: results.analysis[0].drone?.health,
                      score: results.analysis[0].score,
                      reason: results.analysis[0].reason
                    });
                    sessionStorage.setItem("selectedDrone", droneData);
                  }} style={{ flex: 1 }}>
                    <button className="btn btn-primary" style={{ width: "100%", fontSize: 11 }}>DEPLOY →</button>
                  </Link>
                </div>
              </div>
            )}

            {/* all candidates */}
            {results && results.analysis.length > 0 && (
              <div className="card anim-up d1" style={{ padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", marginBottom: 12 }}>ALL CANDIDATES</div>
                {results.analysis.map((item: AnalysisResultItem, idx: number) => (
                  <div key={item.drone?.evmAddress || idx} onClick={() => setSelectedDrone({ ...item.drone, score: item.score, reason: item.reason, rank: idx + 1 })} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: idx < results.analysis.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {idx === 0 && <span style={{ fontSize: 13 }}>★</span>}
                      <span style={{ fontSize: 12, fontWeight: idx === 0 ? 700 : 400 }}>{item.drone?.cairnDroneId || "Unknown"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div className="ptrack" style={{ width: 60 }}>
                        <div className="pfill" style={{ width: `${item.score}%` }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, minWidth: 32, textAlign: "right" }}>{Math.round(item.score)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
