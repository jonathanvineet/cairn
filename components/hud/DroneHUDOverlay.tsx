"use client";

import { useEffect, useRef, useState } from "react";
import { useWalletStore } from "@/stores/walletStore";

// Simulated live telemetry data
const INITIAL_TELEMETRY = {
    altitude: 42,
    speed: 0,
    heading: 247,
    battery: 87,
    signal: 98,
    lat: 11.9416,
    lng: 75.3567,
    status: "ACTIVE",
    zone: "DELTA-7",
    droneId: "CAIRN-001",
    threats: 0,
};

// --- HELPER COMPONENTS ---

function CircularGauge({ pct, color, size = 120, stroke = 4, label, sub }: { pct: number; color: string; size?: number; stroke?: number; label: string; sub: string }) {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;

    return (
        <div style={{ position: "relative", width: size, height: size, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
                {/* Background Ring */}
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={stroke}
                />
                {/* Progress Ring */}
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="transparent"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                />
            </svg>
            <div style={{ textAlign: "center", zIndex: 1 }}>
                <div style={{ color: "#fff", fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{label}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 8, letterSpacing: "0.1em", marginTop: 2 }}>{sub}</div>
            </div>
            {/* Corner Accent */}
            <div style={{ position: "absolute", top: -5, left: -5, width: 10, height: 10, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
        </div>
    );
}

function OrbitalArc({ pct, color, radius, stroke = 2, label }: { pct: number; color: string; radius: number; stroke?: number; label: string }) {
    const arcLength = 90; // degrees
    const circumference = 2 * Math.PI * radius;
    const dashArray = (arcLength / 360) * circumference;
    const progressOffset = dashArray - (pct / 100) * dashArray;

    return (
        <svg width={radius * 2 + 20} height={radius * 2 + 20} style={{ position: "absolute", pointerEvents: "none" }}>
            <circle
                cx={radius + 10} cy={radius + 10} r={radius}
                fill="transparent"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={stroke}
                strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                transform={`rotate(${135} ${radius + 10} ${radius + 10})`}
            />
            <circle
                cx={radius + 10} cy={radius + 10} r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={stroke}
                strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                strokeDashoffset={progressOffset}
                transform={`rotate(${135} ${radius + 10} ${radius + 10})`}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
        </svg>
    );
}

function Reticle() {
    return (
        <div style={{ position: "relative", width: 300, height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Inner Crosshair */}
            <div style={{ position: "absolute", width: 40, height: 1, background: "rgba(0,245,255,0.4)" }} />
            <div style={{ position: "absolute", height: 40, width: 1, background: "rgba(0,245,255,0.4)" }} />

            {/* Spinning Rings */}
            <div style={{
                position: "absolute", width: 200, height: 200,
                border: "1px dashed rgba(0,245,255,0.2)", borderRadius: "50%",
                animation: "rotateSlow 20s linear infinite"
            }} />
            <div style={{
                position: "absolute", width: 180, height: 180,
                border: "2px solid rgba(0,245,255,0.05)", borderTopColor: "#00f5ff",
                borderRadius: "50%",
                animation: "rotateReverse 4s linear infinite"
            }} />

            {/* Corner Brackets */}
            {[0, 90, 180, 270].map(deg => (
                <div key={deg} style={{
                    position: "absolute", width: 20, height: 20,
                    borderTop: "2px solid #00f5ff", borderLeft: "2px solid #00f5ff",
                    transform: `rotate(${deg}deg) translate(-100px, -100px)`
                }} />
            ))}

            {/* Scrolling Scanline Effect */}
            <div style={{
                position: "absolute", width: "100%", height: "100%",
                background: "linear-gradient(transparent, rgba(0,245,255,0.03), transparent)",
                animation: "scanline 5s linear infinite"
            }} />
        </div>
    );
}

function DataPod({ label, value, color = "#00f5ff", style = {} }: { label: string; value: string; color?: string; style?: any }) {
    return (
        <div style={{
            background: "rgba(5,8,16,0.6)",
            border: `1px solid ${color}30`,
            borderLeft: `3px solid ${color}`,
            padding: "8px 12px",
            borderRadius: "2px 8px 8px 2px",
            backdropFilter: "blur(10px)",
            ...style
        }}>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 8, letterSpacing: "0.2em", fontWeight: 700 }}>{label.toUpperCase()}</div>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 800, marginTop: 2, fontFamily: "monospace" }}>{value}</div>
        </div>
    );
}

export function DroneHUDOverlay() {
    const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
    const [mounted, setMounted] = useState(false);
    const [walletOpen, setWalletOpen] = useState(false);
    const { connect, connected, selectedAccount } = useWalletStore();

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setTelemetry(prev => ({
                ...prev,
                altitude: Math.max(20, Math.min(180, prev.altitude + (Math.random() - 0.5) * 4)),
                speed: Math.max(0, Math.min(100, prev.speed + (Math.random() - 0.5) * 6)),
                heading: (prev.heading + Math.random() * 2 - 1 + 360) % 360,
                battery: Math.max(0, prev.battery - 0.01),
                signal: Math.max(70, Math.min(100, prev.signal + (Math.random() - 0.5) * 1.5)),
                lat: prev.lat + (Math.random() - 0.5) * 0.0001,
                lng: prev.lng + (Math.random() - 0.5) * 0.0001,
            }));
        }, 800);
        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50, fontFamily: "Rajdhani, sans-serif" }}>

            {/* === TOP SYSTEM OVERLAY === */}
            <div className="absolute top-6 left-6 right-6 pointer-events-none flex justify-between items-start">

                {/* TOP LEFT: BRANDING & DIAGNOSTICS */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div style={{ width: 40, height: 40, border: "2px solid #00f5ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 15px rgba(0,245,255,0.3)" }}>
                            <span style={{ color: "#00f5ff", fontWeight: 900 }}>C</span>
                        </div>
                        <div>
                            <div style={{ color: "#00f5ff", fontSize: 18, fontWeight: 800, letterSpacing: "0.3em" }}>CAIRN</div>
                            <div style={{ color: "rgba(0,245,255,0.4)", fontSize: 9, letterSpacing: "0.1em" }}>O-C FLIGHT OPS // VER: 1.0.4</div>
                        </div>
                    </div>

                    {/* Shrunken Gauges Moved Up */}
                    <div className="flex gap-6 items-center ml-2">
                        <CircularGauge
                            pct={Math.round(telemetry.battery)}
                            color={telemetry.battery > 50 ? "#10b981" : "#e94560"}
                            label={`${Math.round(telemetry.battery)}%`}
                            size={70}
                            stroke={3}
                            sub="ENRGY"
                        />
                        <CircularGauge
                            pct={Math.round(telemetry.signal)}
                            color="#8b5cf6"
                            label={`${Math.round(telemetry.signal)}%`}
                            size={70}
                            stroke={3}
                            sub="COMMS"
                        />
                    </div>
                </div>

                {/* TOP RIGHT: WALLET & INTEL ARRAY */}
                <div className="flex flex-col gap-4 items-end">
                    <div className="relative">
                        {connected && selectedAccount ? (
                            <div style={{
                                background: "rgba(16,185,129,0.1)",
                                border: "1px solid rgba(16,185,129,0.3)",
                                color: "#10b981",
                                padding: "8px 24px",
                                borderRadius: "2px 10px 2px 10px",
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: "0.2em",
                                display: "flex",
                                alignItems: "center",
                                gap: 8
                            }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
                                {selectedAccount.id.slice(0, 6)}...{selectedAccount.id.slice(-4)}
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => setWalletOpen(!walletOpen)}
                                    className="pointer-events-auto"
                                    style={{
                                        background: "rgba(0,245,255,0.05)",
                                        border: "1px solid rgba(0,245,255,0.3)",
                                        color: "#00f5ff",
                                        padding: "8px 24px",
                                        borderRadius: "2px 10px 2px 10px",
                                        fontSize: 11,
                                        fontWeight: 800,
                                        letterSpacing: "0.2em",
                                        cursor: "pointer",
                                        transition: "all 0.3s"
                                    }}
                                >
                                    CONNECT_UPLINK
                                </button>
                                {walletOpen && (
                            <div style={{
                                position: "absolute", top: "calc(100% + 12px)", right: 0,
                                background: "rgba(5,8,16,0.98)", border: "1px solid rgba(0,245,255,0.3)",
                                borderRadius: 4, padding: "10px", width: 220, backdropFilter: "blur(20px)", pointerEvents: "auto",
                                zIndex: 99999, boxShadow: "0 20px 60px rgba(0,0,0,0.8)"
                            }}>
                                <div style={{ color: "rgba(0,245,255,0.5)", fontSize: 8, letterSpacing: "0.2em", marginBottom: 6 }}>SELECT PROTOCOL</div>
                                <button 
                                    onClick={async () => {
                                        try {
                                            await connect("META_MASK");
                                            setWalletOpen(false);
                                        } catch (error) {
                                            console.error("Failed to connect MetaMask:", error);
                                        }
                                    }}
                                    style={{ background: "rgba(255,165,0,0.1)", border: "1px solid rgba(255,165,0,0.3)", color: "#fff", padding: "12px", textAlign: "left", fontSize: 11, cursor: "pointer", borderRadius: 4, transition: "all 0.2s", fontWeight: 600, width: "100%", marginBottom: 6 }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,165,0,0.2)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,165,0,0.1)")}
                                >
                                    🦊 METAMASK_AGENT
                                </button>
                                <button 
                                    onClick={async () => {
                                        try {
                                            await connect("HASH_PACK");
                                            setWalletOpen(false);
                                        } catch (error) {
                                            console.error("Failed to connect HashPack:", error);
                                        }
                                    }}
                                    style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#fff", padding: "12px", textAlign: "left", fontSize: 11, cursor: "pointer", borderRadius: 4, transition: "all 0.2s", fontWeight: 600, width: "100%" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.2)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.1)")}
                                >
                                    🔐 HASHPACK_VAULT
                                </button>
                            </div>
                        )}
                            </>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <DataPod label="Time" value={new Date().toLocaleTimeString([], { hour12: false })} style={{ padding: '4px 10px' }} />
                        <DataPod label="Zone" value={telemetry.zone} color="#8b5cf6" style={{ padding: '4px 10px' }} />
                        <DataPod label="Breach" value={telemetry.threats.toString()} color={telemetry.threats > 0 ? "#e94560" : "#10b981"} style={{ padding: '4px 10px' }} />
                    </div>
                </div>
            </div>

            {/* === CENTRAL IRONMAN HUD CORE === */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <Reticle />

                {/* Orbital Telemetry Arcs */}
                <OrbitalArc pct={(telemetry.speed / 100) * 100} color="#00f5ff" radius={120} label="SPD" />
                <OrbitalArc pct={(telemetry.altitude / 180) * 100} color="#8b5cf6" radius={140} label="ALT" />

                {/* Floating Telemetry Stats (Orbital) */}
                <div style={{ position: "absolute", left: -180, top: -40, textAlign: "right" }}>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9 }}>SPEED_KPH</div>
                    <div style={{ color: "#00f5ff", fontSize: 32, fontWeight: 900 }}>{Math.round(telemetry.speed)}</div>
                </div>
                <div style={{ position: "absolute", right: -180, top: -40, textAlign: "left" }}>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9 }}>ALT_AGL</div>
                    <div style={{ color: "#8b5cf6", fontSize: 32, fontWeight: 900 }}>{Math.round(telemetry.altitude)}</div>
                </div>
            </div>

            {/* Sides are now empty to make room for story cards */}

            {/* === BOTTOM DATA CLUSTER === */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-20">
                <div style={{ textAlign: "right" }}>
                    <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 8 }}>LONGITUDE</div>
                    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "monospace" }}>{telemetry.lng.toFixed(4)}°E</div>
                </div>

                {/* Compass HUD */}
                <div style={{
                    width: 200, height: 40, border: "1px solid rgba(0,245,255,0.2)", borderRadius: 20,
                    background: "rgba(5,8,16,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative", overflow: "hidden"
                }}>
                    <div style={{
                        display: "flex", gap: 30, transform: `translateX(${(telemetry.heading % 360) * -1}px)`,
                        transition: "transform 0.5s linear"
                    }}>
                        {["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"].map((d, i) => (
                            <span key={i} style={{ color: "#00f5ff", fontSize: 12, fontWeight: 800 }}>{d}</span>
                        ))}
                    </div>
                    {/* Center Indicator */}
                    <div style={{ position: "absolute", top: 0, left: "50%", width: 2, height: "100%", background: "#fff", boxShadow: "0 0 5px #fff" }} />
                </div>

                <div style={{ textAlign: "left" }}>
                    <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 8 }}>LATITUDE</div>
                    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "monospace" }}>{telemetry.lat.toFixed(4)}°N</div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes rotateSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes rotateReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
                @keyframes scanline { 0% { transform: translateY(-150px); } 100% { transform: translateY(150px); } }
                @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
            `}</style>
        </div>
    );
}
