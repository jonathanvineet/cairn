"use client";

import { useEffect, useRef, useState } from "react";

// Simulated live telemetry data
const INITIAL_TELEMETRY = {
    altitude: 42,
    speed: 0,
    heading: 247,
    battery: 87,
    signal: 98,
    lat: 11.9416,
    lng: 75.3567,
    status: "STANDBY",
    zone: "DELTA-7",
    droneId: "CAIRN-001",
    threats: 0,
};

function useAnimatedValue(target: number, speed = 0.05) {
    const [value, setValue] = useState(target);
    const current = useRef(target);
    useEffect(() => {
        let frame: number;
        const animate = () => {
            current.current += (target - current.current) * speed;
            setValue(Math.round(current.current * 10) / 10);
            frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [target, speed]);
    return value;
}

function RadarSweep() {
    return (
        <div style={{ position: "relative", width: 70, height: 70 }}>
            {/* Radar circles */}
            {[1, 0.7, 0.4].map((scale, i) => (
                <div key={i} style={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    width: "100%", height: "100%",
                    borderRadius: "50%",
                    border: "1px solid rgba(0,245,255,0.2)",
                }} />
            ))}
            {/* Cross hairs */}
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(0,245,255,0.15)" }} />
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(0,245,255,0.15)" }} />
            {/* Sweep line */}
            <div style={{
                position: "absolute", top: "50%", left: "50%",
                width: "50%", height: 1,
                background: "linear-gradient(to right, rgba(0,245,255,0.8), transparent)",
                transformOrigin: "0 50%",
                animation: "radarSweep 3s linear infinite",
            }} />
            {/* Blip */}
            <div style={{
                position: "absolute", top: "30%", left: "65%",
                width: 3, height: 3, borderRadius: "50%",
                background: "#00f5ff",
                boxShadow: "0 0 6px #00f5ff",
                animation: "blip 3s ease-in-out infinite",
            }} />
        </div>
    );
}

function AltitudeBar({ value, max = 200 }: { value: number; max?: number }) {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ height: 80, width: 8, background: "rgba(0,245,255,0.1)", borderRadius: 4, position: "relative", border: "1px solid rgba(0,245,255,0.2)", overflow: "hidden" }}>
                <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    height: `${pct}%`,
                    background: "linear-gradient(to top, #00f5ff, rgba(0,245,255,0.3))",
                    transition: "height 0.5s ease",
                    borderRadius: 4,
                }} />
            </div>
            <span style={{ color: "#00f5ff", fontSize: 8, letterSpacing: "0.1em" }}>ALT</span>
        </div>
    );
}

function BatteryBar({ value }: { value: number }) {
    const color = value > 50 ? "#10b981" : value > 20 ? "#f59e0b" : "#e94560";
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: "0.15em" }}>BATTERY</span>
                <span style={{ color, fontSize: 11, fontWeight: 700 }}>{value}%</span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 2, transition: "width 0.5s ease" }} />
            </div>
        </div>
    );
}

function SignalBar({ value }: { value: number }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: "0.15em" }}>SIGNAL</span>
                <span style={{ color: "#8b5cf6", fontSize: 11, fontWeight: 700 }}>{value}%</span>
            </div>
            <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 14 }}>
                {[20, 40, 60, 80, 100].map((threshold, i) => (
                    <div key={i} style={{
                        flex: 1, borderRadius: 2,
                        background: value >= threshold ? "#8b5cf6" : "rgba(139,92,246,0.15)",
                        height: `${20 + i * 20}%`,
                        transition: "background 0.3s ease",
                    }} />
                ))}
            </div>
        </div>
    );
}

export function DroneHUDOverlay() {
    const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
    const [tick, setTick] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [walletOpen, setWalletOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setTick(t => t + 1);
            setTelemetry(prev => ({
                ...prev,
                altitude: Math.max(20, Math.min(120, prev.altitude + (Math.random() - 0.5) * 3)),
                speed: Math.max(0, Math.min(80, prev.speed + (Math.random() - 0.5) * 5)),
                heading: (prev.heading + Math.random() * 2 - 1 + 360) % 360,
                battery: Math.max(0, prev.battery - 0.02),
                signal: Math.max(70, Math.min(100, prev.signal + (Math.random() - 0.5) * 2)),
                lat: prev.lat + (Math.random() - 0.5) * 0.0001,
                lng: prev.lng + (Math.random() - 0.5) * 0.0001,
            }));
        }, 800);
        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    const headingLabel = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(telemetry.heading / 45) % 8];
    const timeStr = new Date().toTimeString().slice(0, 8);

    return (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 30, fontFamily: "Rajdhani, sans-serif" }}>

            {/* === TOP BAR === */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-2"
                style={{ borderBottom: "1px solid rgba(0,245,255,0.1)", background: "rgba(5,8,16,0.8)", backdropFilter: "blur(12px)" }}>
                {/* Left: CAIRN Logo */}
                <div className="flex items-center gap-3">
                    <div style={{ width: 28, height: 28, background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.4)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🛡</div>
                    <div>
                        <div style={{ color: "#00f5ff", fontSize: 14, fontWeight: 800, letterSpacing: "0.4em" }}>CAIRN</div>
                        <div style={{ color: "rgba(0,245,255,0.4)", fontSize: 8, letterSpacing: "0.2em" }}>AIRSPACE REGISTRY // HEDERA</div>
                    </div>
                </div>

                {/* Center: Status */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 2s ease-in-out infinite" }} />
                        <span style={{ color: "#10b981", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em" }}>SYSTEM NOMINAL</span>
                    </div>
                    <div style={{ height: 12, width: 1, background: "rgba(255,255,255,0.1)" }} />
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" }}>{timeStr} IST</span>
                </div>

                {/* Right: Wallet Connect */}
                <div className="relative pointer-events-auto">
                    <button
                        onClick={() => setWalletOpen(!walletOpen)}
                        style={{
                            color: "#00f5ff", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
                            textDecoration: "none", padding: "6px 16px",
                            background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.3)",
                            borderRadius: 3, transition: "all 0.2s",
                            cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 6
                        }}
                    >
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00f5ff" }} />
                        CONNECT WALLET
                    </button>

                    {walletOpen && (
                        <div style={{
                            position: "absolute", top: "calc(100% + 8px)", right: 0,
                            background: "rgba(5,8,16,0.95)", border: "1px solid rgba(0,245,255,0.2)",
                            borderRadius: 4, padding: "8px", width: 180, backdropFilter: "blur(20px)",
                            zIndex: 100, display: "flex", flexDirection: "column", gap: 4
                        }}>
                            <button style={{
                                background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.15)",
                                color: "#fff", fontSize: 10, padding: "8px", borderRadius: 3, textAlign: "left",
                                cursor: "pointer", transition: "background 0.2s"
                            }}>META MASK</button>
                            <button style={{
                                background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.15)",
                                color: "#fff", fontSize: 10, padding: "8px", borderRadius: 3, textAlign: "left",
                                cursor: "pointer", transition: "background 0.2s"
                            }}>HASH PACK</button>
                        </div>
                    )}
                </div>
            </div>

            {/* === LEFT PANEL: Radar + GPS === */}
            <div className="absolute left-6 flex flex-col gap-2"
                style={{ top: 70, padding: "12px", background: "rgba(5,8,16,0.7)", border: "1px solid rgba(0,245,255,0.15)", borderRadius: 6, backdropFilter: "blur(12px)", minWidth: 130 }}>

                {/* Drone ID + Status */}
                <div style={{ borderBottom: "1px solid rgba(0,245,255,0.1)", paddingBottom: 8 }}>
                    <div style={{ color: "#00f5ff", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em" }}>{telemetry.droneId}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
                        <span style={{ color: "#10b981", fontSize: 9, letterSpacing: "0.2em" }}>ACTIVE</span>
                    </div>
                </div>

                {/* Radar */}
                <div className="flex justify-center">
                    <RadarSweep />
                </div>

                {/* GPS Coords */}
                <div style={{ borderTop: "1px solid rgba(0,245,255,0.1)", paddingTop: 8 }}>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 8, letterSpacing: "0.2em", marginBottom: 3 }}>GPS POSITION</div>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 9, fontFamily: "monospace" }}>
                        {telemetry.lat.toFixed(4)}°N
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 9, fontFamily: "monospace" }}>
                        {telemetry.lng.toFixed(4)}°E
                    </div>
                </div>

                {/* Zone */}
                <div style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 4, padding: "4px 8px", textAlign: "center" }}>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 7, letterSpacing: "0.2em" }}>ACTIVE ZONE</div>
                    <div style={{ color: "#8b5cf6", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em" }}>{telemetry.zone}</div>
                </div>

                {/* Operational Intel Panel */}
                <div style={{
                    marginTop: 8,
                    padding: "10px",
                    background: "rgba(0,245,255,0.05)",
                    border: "1px solid rgba(0,245,255,0.2)",
                    borderRadius: 4,
                    maxHeight: 200,
                    overflowY: "auto",
                    pointerEvents: "auto"
                }}>
                    <div style={{ color: "#00f5ff", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, borderBottom: "1px solid rgba(0,245,255,0.2)", paddingBottom: 4 }}>
                        OPERATIONAL INTEL
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, lineHeight: 1.4, marginBottom: 8 }}>
                        CAIRN is India's decentralized drone registry. We log every flight and breach on the Hedera network for immutable public trust.
                    </p>
                    <div style={{ color: "#00f5ff", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>
                        COMMANDS:
                    </div>
                    <ul style={{ color: "rgba(255,255,255,0.4)", fontSize: 8, lineHeight: 1.5, paddingLeft: 10, listStyleType: "square", margin: 0 }}>
                        <li>SCROLL - Initiate fly-through</li>
                        <li>REGISTER - Board new drone</li>
                        <li>DASHBOARD - Live network stats</li>
                        <li>DEPLOY - Setup monitored zones</li>
                    </ul>
                </div>
            </div>

            {/* === RIGHT PANEL: Telemetry === */}
            <div className="absolute right-6 flex flex-col gap-2"
                style={{ top: 70, padding: "12px", background: "rgba(5,8,16,0.7)", border: "1px solid rgba(0,245,255,0.15)", borderRadius: 6, backdropFilter: "blur(12px)", minWidth: 150 }}>

                {/* Heading */}
                <div style={{ borderBottom: "1px solid rgba(0,245,255,0.1)", paddingBottom: 8 }}>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 8, letterSpacing: "0.2em", marginBottom: 4 }}>HEADING</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                        <span style={{ color: "#fff", fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{Math.round(telemetry.heading)}°</span>
                        <span style={{ color: "#00f5ff", fontSize: 14, fontWeight: 700 }}>{headingLabel}</span>
                    </div>
                </div>

                {/* Speed + Alt row */}
                <div className="flex gap-4" style={{ borderBottom: "1px solid rgba(0,245,255,0.1)", paddingBottom: 8 }}>
                    <div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 8, letterSpacing: "0.2em" }}>SPEED</div>
                        <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{Math.round(telemetry.speed)}</div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 8 }}>km/h</div>
                    </div>
                    <div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 8, letterSpacing: "0.2em" }}>ALTITUDE</div>
                        <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{Math.round(telemetry.altitude)}</div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 8 }}>m AGL</div>
                    </div>
                </div>

                {/* Battery */}
                <BatteryBar value={Math.round(telemetry.battery)} />

                {/* Signal */}
                <SignalBar value={Math.round(telemetry.signal)} />

                {/* Threats */}
                <div style={{ background: telemetry.threats > 0 ? "rgba(233,69,96,0.15)" : "rgba(16,185,129,0.1)", border: `1px solid ${telemetry.threats > 0 ? "rgba(233,69,96,0.4)" : "rgba(16,185,129,0.25)"}`, borderRadius: 4, padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: "0.15em" }}>BREACHES</span>
                    <span style={{ color: telemetry.threats > 0 ? "#e94560" : "#10b981", fontSize: 16, fontWeight: 800 }}>{telemetry.threats}</span>
                </div>
            </div>

            {/* === BOTTOM CENTER: Crosshair / Compass === */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
                {/* Compass strip */}
                <div style={{
                    display: "flex", gap: 0, padding: "4px 20px",
                    background: "rgba(5,8,16,0.8)", border: "1px solid rgba(0,245,255,0.15)",
                    borderRadius: 4, backdropFilter: "blur(8px)",
                    overflow: "hidden",
                }}>
                    {["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N", "NE", "E", "SE", "S", "SW", "W", "NW"].map((d, i) => (
                        <div key={i} style={{
                            color: d === headingLabel ? "#00f5ff" : "rgba(255,255,255,0.25)",
                            fontSize: 9, fontWeight: d === headingLabel ? 800 : 400,
                            width: 24, textAlign: "center",
                            transition: "color 0.3s",
                        }}>{d}</div>
                    ))}
                </div>

                {/* Horizon line indicator */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "3px 16px",
                    background: "rgba(5,8,16,0.7)", border: "1px solid rgba(0,245,255,0.1)",
                    borderRadius: 4, backdropFilter: "blur(8px)",
                }}>
                    <div style={{ width: 30, height: 1, background: "rgba(0,245,255,0.4)" }} />
                    <div style={{ width: 8, height: 8, border: "1px solid #00f5ff", transform: "rotate(45deg)" }} />
                    <div style={{ width: 30, height: 1, background: "rgba(0,245,255,0.4)" }} />
                </div>
            </div>

            {/* Corner brackets */}
            <div style={{ position: "absolute", top: 68, left: 162, width: 20, height: 20, borderTop: "1px solid rgba(0,245,255,0.3)", borderLeft: "1px solid rgba(0,245,255,0.3)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 68, right: 178, width: 20, height: 20, borderTop: "1px solid rgba(0,245,255,0.3)", borderRight: "1px solid rgba(0,245,255,0.3)", pointerEvents: "none" }} />

            <style jsx global>{`
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes blip {
          0%, 80%, 100% { opacity: 0; transform: scale(0.5); }
          85% { opacity: 1; transform: scale(1.5); box-shadow: 0 0 10px #00f5ff; }
          90% { opacity: 0.8; }
        }
      `}</style>
        </div>
    );
}
