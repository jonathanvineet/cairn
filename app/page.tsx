"use client";

import { useEffect, useState } from "react";
import { Plane, CheckCircle2 } from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import { useWalletStore } from "@/stores/walletStore";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

const SLIDES = [
  {
    tag: "INDIA'S DRONE REGISTRY",
    h1: "Your drone.",
    h2: "Your airspace.",
    h3: "On-chain.",
    sub: "Deploy autonomous surveillance drones. Register on Hedera. Verify every mission — trustlessly.",
  },
  {
    tag: "THE PROBLEM",
    h1: "Airspace is",
    h2: "unregulated &",
    h3: "unverifiable.",
    sub: "Drone operations lack tamper-proof logging, verifiable identity, and decentralized oversight.",
  },
  {
    tag: "THE SOLUTION",
    h1: "Every drone.",
    h2: "Every mission.",
    h3: "On Hedera.",
    sub: "CAIRN registers drones as AI agents on Hedera, stores patrol evidence as cryptographic hashes.",
  },
  {
    tag: "GET STARTED",
    h1: "Connect.",
    h2: "Register.",
    h3: "Deploy.",
    sub: "Three steps to launch your first blockchain-verified autonomous patrol mission.",
    cta: true,
  },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const { connected } = useWalletStore();
  const router = useRouter();

  const { data: dronesData } = useQuery({
    queryKey: ["drones"],
    queryFn: async () => {
      const res = await fetch("/api/drones");
      if (!res.ok) return { drones: [] };
      return res.json();
    },
  });

  const drones = dronesData?.drones || [];
  const activeDrones = drones.filter((d: any) => d.status === "ACTIVE");
  const totalZones = drones.filter((d: any) => d.assignedZoneId !== "UNASSIGNED").length;

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % SLIDES.length);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (path: string) => {
    if (!connected) {
      alert("Please connect your HashPack wallet first");
      return;
    }
    router.push(path);
  };

  const cur = SLIDES[slideIndex];

  return (
    <div className="scanlines" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* grid background */}
      <div className="grid-bg" style={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.55, pointerEvents: "none" }} />

      {/* ── NAVBAR ── */}
      <nav className="anim-down d0" style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 48px",
        borderBottom: "1px solid var(--border)",
        background: "rgba(250,250,250,0.88)",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Plane size={20} />
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: ".1em" }}>CAIRN</span>
          <span style={{ color: "var(--border)", fontSize: 16, margin: "0 4px" }}>|</span>
          <span style={{ fontSize: 11, color: "var(--muted-fg)", letterSpacing: ".05em" }}>
            DRONE AIRSPACE REGISTRY
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div className="live-dot" />
            <span style={{ fontSize: 10, letterSpacing: ".08em", color: "var(--muted-fg)" }}>HEDERA TESTNET</span>
          </div>
          <WalletConnect />
        </div>
      </nav>

      {/* ── HERO ── */}
      <main style={{ flex: 1, display: "flex", position: "relative", zIndex: 10 }}>

        {/* left — slides */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "60px 64px", maxWidth: 640,
        }}>
          <div key={slideIndex} className="anim-up d0">

            {/* tag pill */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              border: "1px solid var(--border)", borderRadius: 4,
              padding: "3px 10px", fontSize: 10, fontWeight: 600,
              letterSpacing: ".09em", color: "var(--muted-fg)", marginBottom: 20,
            }}>
              ▸ {cur.tag}
            </div>

            {/* heading */}
            <h1 className="anim-up d1" style={{
              fontSize: "clamp(30px, 4.5vw, 54px)", fontWeight: 700,
              lineHeight: 1.12, letterSpacing: "-.02em", marginBottom: 18,
            }}>
              <span style={{ display: "block", color: "var(--fg)" }}>{cur.h1}</span>
              <span style={{ display: "block", color: "var(--fg)" }}>{cur.h2}</span>
              <span style={{ display: "block", color: "var(--muted-fg)" }}>{cur.h3}</span>
            </h1>

            {/* subtitle */}
            <p className="anim-up d2" style={{
              fontSize: 13, color: "var(--muted-fg)", lineHeight: 1.75,
              maxWidth: 460, marginBottom: 36,
            }}>
              {cur.sub}
            </p>


          </div>

          {/* slide dots */}
          <div style={{ display: "flex", gap: 6, marginTop: 40 }}>
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlideIndex(i)} style={{
                width: i === slideIndex ? 20 : 6, height: 6, borderRadius: 999,
                background: i === slideIndex ? "var(--fg)" : "var(--border)",
                border: "none", cursor: "pointer", transition: "all .3s",
              }} />
            ))}
          </div>
        </div>

        {/* right — drone card */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: 48, position: "relative",
        }}>
          <div className="drone-ping" style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.1)" }} />
          <div className="drone-ping" style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.07)", animationDelay: ".6s" }} />

          <div className="card card-offset drone-float" style={{
            padding: 32, display: "flex", flexDirection: "column",
            alignItems: "center", gap: 16, position: "relative", zIndex: 2,
          }}>
            <Plane size={64} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "var(--muted-fg)", marginBottom: 3 }}>DRONE AGENT</div>
              <div style={{ fontSize: 11, color: "var(--muted-fg)" }}>HEDERA TESTNET</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span className="badge" style={{ background: "#000", color: "#fff", border: "none" }}>ACTIVE</span>
              <span className="badge" style={{ background: "var(--fg)", color: "var(--bg)" }}>VERIFIED</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
              {[
                { l: "REGISTERED", v: String(drones.length) },
                { l: "ACTIVE",     v: String(activeDrones.length) },
                { l: "ZONES",      v: String(totalZones) },
                { l: "NETWORK",    v: "TESTNET" },
              ].map(s => (
                <div key={s.l} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "8px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "var(--muted-fg)", letterSpacing: ".08em", marginBottom: 2 }}>{s.l}</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── BOTTOM STATS BAR ── */}
      <div style={{
        borderTop: "1px solid var(--border)",
        background: "rgba(250,250,250,0.9)",
        backdropFilter: "blur(8px)",
        position: "relative", zIndex: 10,
        padding: "16px 48px",
        display: "flex", gap: 36, alignItems: "center", flexWrap: "wrap",
      }}>
        {[
          { l: "DRONES ACTIVE",   v: String(activeDrones.length) },
          { l: "ACTIVE PATROLS",  v: "0" },
          { l: "EVIDENCE HASHES", v: "0" },
          { l: "HBAR STAKED",     v: "0" },
        ].map(s => (
          <div key={s.l} className="card" style={{ padding: "10px 18px", display: "flex", flexDirection: "column", gap: 3, alignItems: "center", minWidth: 108 }}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>{s.v}</span>
            <span style={{ fontSize: 9, color: "var(--muted-fg)", letterSpacing: ".08em" }}>{s.l}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 28, overflowX: "auto" }}>
          {["CAIRN LIVE", "HEDERA TESTNET", "AI AGENTS READY", "ON-CHAIN VERIFIED"].map((t, i) => (
            <span key={i} style={{ fontSize: 10, color: "var(--muted-fg)", letterSpacing: ".06em", whiteSpace: "nowrap", flexShrink: 0 }}>▸ {t}</span>
          ))}
        </div>
      </div>

    </div>
  );
}