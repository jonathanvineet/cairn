"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { DroneHUDOverlay } from "@/components/hud/DroneHUDOverlay";

const Scene3D = dynamic(() => import("../components/world/Scene3D"), { ssr: false });

// Scroll-driven story cards that appear over the 3D world as user flies through
const STORY_SLIDES = [
  {
    pct: [0, 0.22],
    side: "left",
    tag: "WELCOME TO CAIRN",
    headline: "India's On-Chain\nDrone Registry",
    body: "An autonomous airspace trust layer built on Hedera. Every drone, every flight, every boundary — permanently verifiable on the blockchain.",
    accent: "#00f5ff",
    hint: "Scroll to fly through",
  },
  {
    pct: [0.22, 0.44],
    side: "right",
    tag: "THE PROBLEM",
    headline: "Untracked Drones\nPose Real Risks",
    body: "India has 300,000+ drone operators with no unified registry. CAIRN solves this with decentralized identity — every drone staked on-chain with the operator's wallet.",
    accent: "#e94560",
    hint: "Keep scrolling",
  },
  {
    pct: [0.44, 0.66],
    side: "left",
    tag: "HOW IT WORKS",
    headline: "Register →\nDeploy → Monitor",
    body: "1. Connect your wallet (MetaMask / HashPack)\n2. Register your drone with DGCA ID on Hedera HCS\n3. Define no-fly boundary zones as smart contracts\n4. AI agents watch live for breach events",
    accent: "#8b5cf6",
    hint: "Almost there",
  },
  {
    pct: [0.66, 0.88],
    side: "right",
    tag: "THE TECHNOLOGY",
    headline: "Hedera HCS +\nEliza AI Agents",
    body: "Hedera Consensus Service finalizes every log entry in under 1 second. Eliza AI agents patrol zones autonomously — flagging breaches without any human in the loop.",
    accent: "#10b981",
    hint: "One more section",
  },
  {
    pct: [0.88, 1.0],
    side: "left",
    tag: "READY TO FLY?",
    headline: "Secure Your\nAirspace Today",
    body: "Certified operators, trusted zones, breach-proof enforcement. CAIRN is open-source and live on Hedera Testnet.",
    accent: "#f59e0b",
    hint: null,
  },
];

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function StoryCard({ slide, scrollPct }: { slide: typeof STORY_SLIDES[0]; scrollPct: number }) {
  const [lo, hi] = slide.pct;
  const span = hi - lo;
  const fadeWidth = Math.min(0.06, span * 0.25);

  // Fade in / fade out
  let alpha = 0;
  if (scrollPct >= lo && scrollPct <= hi) {
    const progress = (scrollPct - lo) / span;
    const fadeIn = Math.min(progress / (fadeWidth / span), 1);
    const fadeOut = Math.min((1 - progress) / (fadeWidth / span), 1);
    alpha = easeInOut(Math.min(fadeIn, fadeOut));
  }
  if (alpha < 0.01) return null;

  const isLeft = slide.side === "left";

  return (
    <div style={{
      position: "fixed",
      top: isLeft ? "78%" : "60%",
      [isLeft ? "left" : "right"]: 0,
      transform: `translateY(-50%) translateX(${isLeft ? (alpha - 1) * -30 : (alpha - 1) * 30}px)`,
      opacity: alpha,
      zIndex: 35,
      padding: "32px 36px",
      maxWidth: 400,
      margin: isLeft ? "0 0 0 24px" : "0 24px 0 0",
      background: "rgba(5,8,16,0.82)",
      backdropFilter: "blur(20px)",
      border: `1px solid ${slide.accent}25`,
      borderLeft: isLeft ? `3px solid ${slide.accent}` : `1px solid ${slide.accent}25`,
      borderRight: !isLeft ? `3px solid ${slide.accent}` : `1px solid ${slide.accent}25`,
      borderRadius: 8,
      fontFamily: "Rajdhani, sans-serif",
      transition: "opacity 0.1s linear",
    }}>
      {/* Tag */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: slide.accent, flexShrink: 0 }} />
        <span style={{ color: slide.accent, fontSize: 9, fontWeight: 700, letterSpacing: "0.3em" }}>
          {slide.tag}
        </span>
      </div>

      {/* Headline */}
      <h2 style={{
        color: "#fff",
        fontSize: "clamp(22px, 3vw, 36px)",
        fontWeight: 800,
        lineHeight: 1.1,
        whiteSpace: "pre-line",
        margin: "0 0 14px",
        letterSpacing: "-0.01em",
      }}>
        {slide.headline}
      </h2>

      {/* Body */}
      <p style={{
        color: "rgba(255,255,255,0.55)",
        fontSize: 14,
        lineHeight: 1.75,
        margin: "0 0 20px",
        whiteSpace: "pre-line",
      }}>
        {slide.body}
      </p>

      {/* Scroll hint */}
      {slide.hint && (
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 20, height: 1, background: `${slide.accent}60` }} />
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, letterSpacing: "0.2em" }}>
            {slide.hint.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

function ScrollProgress({ pct }: { pct: number }) {
  // Mini sections indicator on the right edge
  return (
    <div style={{
      position: "fixed",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 40,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      alignItems: "center",
    }}>
      {STORY_SLIDES.map((s, i) => {
        const [lo, hi] = s.pct;
        const active = pct >= lo && pct <= hi;
        const past = pct > hi;
        return (
          <div key={i} style={{
            width: active ? 2 : 1.5,
            height: active ? 22 : 14,
            borderRadius: 2,
            background: active ? s.accent : past ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.12)",
            transition: "all 0.3s ease",
            boxShadow: active ? `0 0 8px ${s.accent}` : "none",
          }} />
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const [canvasReady, setCanvasReady] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setCanvasReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(total > 0 ? Math.min(window.scrollY / total, 1) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Tall scroll container — 500vh for more story room */}
      <div className="h-[500vh]" />

      {/* 3D Canvas — fixed background */}
      <div className="fixed inset-0 bg-[#050810]" style={{ zIndex: 0 }}>
        {canvasReady && (
          <Suspense fallback={null}>
            <Scene3D />
          </Suspense>
        )}
      </div>

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 5, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.005) 2px, rgba(0,245,255,0.005) 4px)" }} />

      {/* CAIRN Drone HUD — top bar, radar, telemetry */}
      <DroneHUDOverlay />

      {/* Scroll-driven story cards — appear over the 3D world */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 36 }}>
        {STORY_SLIDES.map((slide, i) => (
          <StoryCard key={i} slide={slide} scrollPct={scrollPct} />
        ))}
      </div>

      {/* Section progress indicator */}
      <ScrollProgress pct={scrollPct} />

      {/* ——— MAIN ACTION OVERLAY ——— */}
      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[45] flex items-center gap-6 pointer-events-auto">
        {[
          { href: "/register", label: "REGISTER DRONE", color: "#00f5ff", sub: "ON-CHAIN REGISTRY" },
          { href: "/dashboard", label: "LIVE DASHBOARD", color: "#8b5cf6", sub: "NETWORK ANALYTICS" },
          { href: "/deploy", label: "DEPLOY ZONE", color: "#10b981", sub: "AIRSPACE SECURITY" },
        ].map((btn, i) => (
          <a
            key={i}
            href={btn.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 180,
              height: 70,
              background: "rgba(5,8,16,0.9)",
              border: `1px solid ${btn.color}40`,
              borderRadius: 6,
              textDecoration: "none",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              backdropFilter: "blur(12px)",
              position: "relative",
              overflow: "hidden",
            }}
            className="group hover:scale-105 active:scale-95"
            onMouseEnter={(e) => {
              e.currentTarget.style.border = `1px solid ${btn.color}`;
              e.currentTarget.style.boxShadow = `0 0 20px ${btn.color}20`;
              e.currentTarget.style.background = `${btn.color}10`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.border = `1px solid ${btn.color}40`;
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.background = "rgba(5,8,16,0.9)";
            }}
          >
            {/* Top accent line */}
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: btn.color }} />

            <span style={{ color: btn.color, fontSize: 13, fontWeight: 800, letterSpacing: "0.2em" }}>{btn.label}</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", marginTop: 4 }}>{btn.sub}</span>
          </a>
        ))}
      </div>

      {/* Scroll progress bar on top */}
      <div className="fixed top-0 left-0 h-[2px] z-50 transition-all duration-100" style={{ width: `${scrollPct * 100}%`, background: "linear-gradient(90deg, #00f5ff, #8b5cf6, #10b981)" }} />
    </>
  );
}
