"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plane, ArrowLeft } from "lucide-react";
import { useWalletStore } from "@/stores/walletStore";

interface Drone {
  cairnDroneId: string;
  evmAddress: string;
  model: string;
  assignedZoneId: string;
  status: string;
  registrationLat?: number;
  registrationLng?: number;
  agentTopicId?: string;
  isAgent?: boolean;
  hederaAccountId?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { connected, selectedAccount } = useWalletStore();
  const [drones, setDrones] = useState<Drone[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "live" | "fleet" | "missions">("overview");
  const [telemetry, setTelemetry] = useState({
    altitude: 45,
    speed: 12,
    battery: 87,
    signal: 95,
    zone: "Z-001",
    dataRate: 2.4,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!connected) {
      alert("Please connect your HashPack wallet first");
      router.push("/");
    } else {
      fetchData();
    }
  }, [connected, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        altitude: prev.altitude + Math.random() * 10 - 5,
        speed: prev.speed + Math.random() * 4 - 2,
        battery: Math.max(0, prev.battery - 0.1),
        signal: Math.max(50, prev.signal + Math.random() * 10 - 5),
        zone: prev.zone,
        dataRate: prev.dataRate + Math.random() * 0.5 - 0.25,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [dronesRes, zonesRes] = await Promise.all([
        fetch("/api/drones"),
        fetch("/api/zones")
      ]);
      if (dronesRes.ok) setDrones((await dronesRes.json()).drones || []);
      if (zonesRes.ok) setZones((await zonesRes.json()).zones || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }} className="grid-bg">
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "2px solid var(--border)", borderTop: "2px solid var(--fg)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "var(--muted-fg)", fontSize: 12 }}>Loading...</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "overview", icon: "◈", label: "OVERVIEW"  },
    { id: "live",     icon: "◉", label: "LIVE FEED" },
    { id: "fleet",    icon: "◇", label: "FLEET"     },
    { id: "missions", icon: "◆", label: "MISSIONS"  },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── TOPBAR ── */}
      <header className="anim-down d0" style={{
        height: 54, borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px", background: "var(--bg)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted-fg)", textDecoration: "none", fontSize: 12, fontWeight: 600, letterSpacing: ".06em" }}>
            <ArrowLeft size={14} /> CAIRN
          </Link>
          <span style={{ color: "var(--border)", fontSize: 16 }}>|</span>
          <span style={{ fontSize: 11, color: "var(--muted-fg)" }}>COMMAND CENTER</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div className="live-dot" />
            <span style={{ fontSize: 11, letterSpacing: ".08em", fontWeight: 600 }}>DRONE LIVE</span>
          </div>
          <div style={{ background: "var(--fg)", color: "var(--bg)", padding: "5px 14px", borderRadius: "var(--radius)", fontSize: 11, fontWeight: 600, letterSpacing: ".06em" }}>
            {selectedAccount?.id?.substring(0, 8)}...
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── SIDEBAR ── */}
        <aside className="anim-fade d1" style={{
          width: 196, borderRight: "1px solid var(--border)",
          padding: "20px 0", flexShrink: 0,
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`nav-tab ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id as any)}
            >
              <span style={{ fontSize: 14 }}>{t.icon}</span>{t.label}
            </button>
          ))}

          <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />

          <Link href="/register" style={{ textDecoration: "none" }}>
            <button className="nav-tab"><span style={{ fontSize: 14 }}>✦</span>REGISTER</button>
          </Link>
          <Link href="/deploy" style={{ textDecoration: "none" }}>
            <button className="nav-tab"><span style={{ fontSize: 14 }}>◎</span>DEPLOY</button>
          </Link>
          <Link href="/analysis" style={{ textDecoration: "none" }}>
            <button className="nav-tab"><span style={{ fontSize: 14 }}>◆</span>ANALYSIS</button>
          </Link>

          <div style={{ flex: 1 }} />

          {/* mini telemetry */}
          <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: "var(--muted-fg)", letterSpacing: ".08em", marginBottom: 10 }}>TELEMETRY</div>
            {[
              { l: "BATTERY", v: `${Math.round(telemetry.battery)}%`, c: telemetry.battery > 50 ? "#16a34a" : "#dc2626" },
              { l: "SIGNAL",  v: `${Math.round(telemetry.signal)}%`,  c: "#16a34a" },
              { l: "ALT",     v: `${Math.round(telemetry.altitude)}m`, c: "var(--fg)" },
            ].map(s => (
              <div key={s.l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: "var(--muted-fg)" }}>{s.l}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: s.c }}>{s.v}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, overflowY: "auto", padding: 28 }}>

          {/* ════ OVERVIEW ════ */}
          {activeTab === "overview" && (
            <div key="overview">
              <div className="anim-down d0" style={{ marginBottom: 22 }}>
                <h2 style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-.01em" }}>Overview</h2>
                <p style={{ fontSize: 12, color: "var(--muted-fg)", marginTop: 3 }}>Real-time fleet telemetry & mission summary</p>
              </div>

              {/* 4 stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
                {[
                  { l: "REGISTERED DRONES", v: drones.length,  sub: `${drones.filter(d => d.status === "ACTIVE").length} active now` },
                  { l: "TOTAL MISSIONS",    v: 0,               sub: "across all zones" },
                  { l: "ACTIVE ZONES",      v: zones.length,    sub: `${drones.filter(d => d.assignedZoneId !== "UNASSIGNED").length} drones assigned` },
                  { l: "EVIDENCE HASHES",  v: 0,               sub: "on-chain" },
                ].map((s, i) => (
                  <div key={i} className="card card-offset anim-up" style={{ padding: 18, animationDelay: `${i * 70 + 100}ms` }}>
                    <div style={{ fontSize: 10, color: "var(--muted-fg)", letterSpacing: ".08em", marginBottom: 8 }}>{s.l}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 3 }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: "var(--muted-fg)" }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* live telemetry panel */}
              <div className="card anim-up d2" style={{ padding: 22, marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em" }}>LIVE TELEMETRY</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className="live-dot" />
                    <span style={{ fontSize: 10, color: "var(--muted-fg)" }}>TRANSMITTING</span>
                  </div>
                </div>
                <div style={{ background: "var(--fg)", borderRadius: "var(--radius)", padding: 22, color: "var(--bg)", display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
                  <div className="drone-float"><Plane size={38} /></div>
                  <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))", gap: 14 }}>
                    {[
                      { l: "ALTITUDE",  v: `${Math.round(telemetry.altitude)} m` },
                      { l: "SPEED",     v: `${Math.round(telemetry.speed)} m/s` },
                      { l: "BATTERY",   v: `${Math.round(telemetry.battery)}%` },
                      { l: "SIGNAL",    v: `${Math.round(telemetry.signal)}%` },
                      { l: "ZONE",      v: telemetry.zone },
                      { l: "DATA RATE", v: `${telemetry.dataRate.toFixed(1)} Mbps` },
                    ].map(t => (
                      <div key={t.l}>
                        <div style={{ fontSize: 9, opacity: .5, marginBottom: 2, letterSpacing: ".06em" }}>{t.l}</div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{t.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* recent missions */}
              <div className="card anim-up d3" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em" }}>RECENT MISSIONS</div>
                  <button className="btn btn-ghost" style={{ padding: "4px 12px", fontSize: 10 }} onClick={() => setActiveTab("missions")}>VIEW ALL →</button>
                </div>
                <table className="tbl">
                  <thead>
                    <tr>{["MISSION ID", "ZONE", "STATUS", "TIME"].map(h => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--muted-fg)", fontSize: 12, padding: 24 }}>No missions yet</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════ LIVE FEED ════ */}
          {activeTab === "live" && (
            <div key="live">
              <div className="anim-down d0" style={{ marginBottom: 22 }}>
                <h2 style={{ fontSize: 19, fontWeight: 700 }}>Live Feed</h2>
                <p style={{ fontSize: 12, color: "var(--muted-fg)", marginTop: 3 }}>Real-time surveillance stream</p>
              </div>

              <div className="card anim-scale d1" style={{ padding: 0, overflow: "hidden", marginBottom: 18 }}>
                <div style={{ background: "var(--fg)", aspectRatio: "16/9", maxHeight: 370, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexDirection: "column", gap: 12 }}>
                  <div className="drone-float"><Plane size={48} color="white" /></div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: ".1em" }}>ENCRYPTED FEED · AES-256</div>
                  <div style={{ position: "absolute", top: 12, left: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="live-dot" />
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: ".1em" }}>LIVE</span>
                  </div>
                  <div style={{ position: "absolute", top: 12, right: 14, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                    ALT {Math.round(telemetry.altitude)}m · {new Date().toLocaleTimeString()}
                  </div>
                  <div style={{ position: "absolute", bottom: 12, right: 14, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                    {telemetry.zone} · {Math.round(telemetry.signal)}% SIG
                  </div>
                </div>
                <div style={{ padding: "12px 18px", display: "flex", gap: 10, borderTop: "1px solid var(--border)", alignItems: "center" }}>
                  <button className="btn btn-primary" style={{ padding: "6px 16px", fontSize: 11 }}>⏺ RECORD</button>
                  <button className="btn btn-ghost"   style={{ padding: "6px 16px", fontSize: 11 }}>⤓ SNAPSHOT</button>
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 11, color: "var(--muted-fg)" }}>{telemetry.dataRate.toFixed(1)} Mbps</span>
                </div>
              </div>

              <div className="card anim-up d2" style={{ padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", marginBottom: 14 }}>TELEMETRY</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 14 }}>
                  {[
                    { l: "ALTITUDE",  v: `${Math.round(telemetry.altitude)} m` },
                    { l: "SPEED",     v: `${Math.round(telemetry.speed)} m/s` },
                    { l: "BATTERY",   v: `${Math.round(telemetry.battery)}%` },
                    { l: "SIGNAL",    v: `${Math.round(telemetry.signal)}%` },
                    { l: "ZONE",      v: telemetry.zone },
                    { l: "DATA RATE", v: `${telemetry.dataRate.toFixed(1)} Mbps` },
                  ].map(t => (
                    <div key={t.l} style={{ borderLeft: "2px solid var(--border)", paddingLeft: 12 }}>
                      <div style={{ fontSize: 10, color: "var(--muted-fg)", marginBottom: 2 }}>{t.l}</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{t.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ FLEET ════ */}
          {activeTab === "fleet" && (
            <div key="fleet">
              <div className="anim-down d0" style={{ marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ fontSize: 19, fontWeight: 700 }}>Drone Fleet</h2>
                  <p style={{ fontSize: 12, color: "var(--muted-fg)", marginTop: 3 }}>All registered drones & Hedera accounts</p>
                </div>
                <Link href="/register">
                  <button className="btn btn-primary" style={{ fontSize: 11, padding: "8px 16px" }}>+ REGISTER DRONE</button>
                </Link>
              </div>
              <div className="card anim-up d1" style={{ padding: 0, overflow: "hidden" }}>
                <table className="tbl">
                  <thead>
                    <tr>{["DRONE ID", "MODEL", "STATUS", "ZONE", "BATTERY", "MISSIONS", ""].map(h => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {drones.length === 0 && (
                      <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted-fg)", fontSize: 12, padding: 24 }}>No drones registered yet</td></tr>
                    )}
                    {drones.map((drone, i) => (
                      <tr key={drone.evmAddress} className="tbl-row anim-left" style={{ animationDelay: `${i * 55}ms` }}>
                        <td style={{ fontWeight: 700, fontFamily: "monospace" }}>{drone.cairnDroneId}</td>
                        <td style={{ color: "var(--muted-fg)", fontSize: 11 }}>{drone.model}</td>
                        <td>
                          <span className="badge" style={{
                            background: drone.status === "ACTIVE" ? "#000" : "transparent",
                            color: drone.status === "ACTIVE" ? "#fff" : "var(--muted-fg)",
                            border: drone.status === "ACTIVE" ? "none" : "1px solid var(--border)",
                          }}>
                            {drone.status}
                          </span>
                        </td>
                        <td style={{ color: "var(--muted-fg)", fontSize: 11 }}>{drone.assignedZoneId}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div className="ptrack" style={{ width: 44 }}>
                              <div className="pfill" style={{ width: "87%" }} />
                            </div>
                            <span style={{ fontSize: 11 }}>87%</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 11 }}>0</td>
                        <td>
                          <a href={`https://hashscan.io/testnet/account/${drone.hederaAccountId}`} target="_blank" rel="noopener noreferrer">
                            <button className="btn btn-ghost" style={{ padding: "3px 10px", fontSize: 10 }}>HASHSCAN ↗</button>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════ MISSIONS ════ */}
          {activeTab === "missions" && (
            <div key="missions">
              <div className="anim-down d0" style={{ marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ fontSize: 19, fontWeight: 700 }}>Mission History</h2>
                  <p style={{ fontSize: 12, color: "var(--muted-fg)", marginTop: 3 }}>All patrol missions & on-chain evidence hashes</p>
                </div>
                <Link href="/deploy">
                  <button className="btn btn-primary" style={{ fontSize: 11, padding: "8px 16px" }}>+ DEPLOY MISSION</button>
                </Link>
              </div>
              <div className="card anim-up d1" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 16 }}>
                  {["ALL", "SUCCESS", "PROCESSING", "FAILED"].map(f => (
                    <button key={f} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 600, color: f === "ALL" ? "var(--fg)" : "var(--muted-fg)", letterSpacing: ".06em", paddingBottom: 4, borderBottom: f === "ALL" ? "2px solid var(--fg)" : "2px solid transparent" }}>{f}</button>
                  ))}
                </div>
                <table className="tbl">
                  <thead>
                    <tr>{["MISSION ID", "ZONE", "DRONE", "STATUS", "HASH", "TIME"].map(h => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted-fg)", fontSize: 12, padding: 24 }}>No missions yet</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
