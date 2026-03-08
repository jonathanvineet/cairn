"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plane, MapPin, Shield, Zap, ArrowRight, Globe, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/WalletConnect";

const STORY_SLIDES = [
  {
    tag: "WELCOME TO CAIRN",
    headline: "India's On-Chain\nDrone Registry",
    body: "An autonomous airspace trust layer built on Hedera. Every drone, every flight, every boundary — permanently verifiable on the blockchain.",
    accent: "#00f5ff",
  },
  {
    tag: "THE PROBLEM",
    headline: "Untracked Drones\nPose Real Risks",
    body: "India has 300,000+ drone operators with no unified registry. CAIRN solves this with decentralized identity — every drone staked on-chain with the operator's wallet.",
    accent: "#e94560",
  },
  {
    tag: "HOW IT WORKS",
    headline: "Register →\nDeploy → Monitor",
    body: "1. Connect your wallet (MetaMask / HashPack)\n2. Register your drone with DGCA ID on Hedera HCS\n3. Define no-fly boundary zones as smart contracts\n4. AI agents watch live for breach events",
    accent: "#8b5cf6",
  },
  {
    tag: "THE TECHNOLOGY",
    headline: "Hedera HCS +\nEliza AI Agents",
    body: "Hedera Consensus Service finalizes every log entry in under 1 second. Eliza AI agents patrol zones autonomously — flagging breaches without any human in the loop.",
    accent: "#10b981",
  },
  {
    tag: "READY TO FLY?",
    headline: "Secure Your\nAirspace Today",
    body: "Certified operators, trusted zones, breach-proof enforcement. CAIRN is open-source and live on Hedera Testnet.",
    accent: "#f59e0b",
  },
];

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = window.scrollY / scrollHeight;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
      
      // Calculate which slide to show based on scroll
      const slideIndex = Math.floor(progress * STORY_SLIDES.length);
      setCurrentSlide(Math.min(slideIndex, STORY_SLIDES.length - 1));
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentStory = STORY_SLIDES[currentSlide];

  return (
    <div className="min-h-[400vh] relative bg-[#020d06]">
      {/* Fixed Background with Topo Grid + Animated Drone */}
      <div className="fixed inset-0 overflow-hidden">
        {/* Topo Grid Pattern */}
        <div className="absolute inset-0 topo-bg opacity-60" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020d06] via-transparent to-[#020d06] opacity-50" />
        
        {/* Floating Drone Silhouette */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
          style={{
            opacity: 0.15 + scrollProgress * 0.85,
            transform: `translate(-50%, calc(-50% + ${scrollProgress * -30}vh)) scale(${0.5 + scrollProgress * 0.5})`,
          }}
        >
          <div className="relative w-64 h-64 animate-float">
            <Plane className="w-full h-full text-green-500/30" strokeWidth={0.5} />
            <div className="absolute inset-0 blur-2xl bg-green-500/20 animate-pulse" />
          </div>
        </div>

        {/* Scan Lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-400/50 to-transparent animate-scan" />
        </div>
      </div>

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white font-rajdhani">CAIRN</span>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Sticky Story Card */}
      <div className="sticky top-24 z-40 px-6 pointer-events-none">
        <div className="max-w-2xl mx-auto">
          <div 
            className="bg-[#050810]/90 backdrop-blur-xl border rounded-xl p-8 shadow-2xl pointer-events-auto transition-all duration-500"
            style={{
              borderColor: `${currentStory.accent}40`,
              borderLeftWidth: '4px',
              borderLeftColor: currentStory.accent,
              opacity: scrollProgress < 0.95 ? 1 : 0,
            }}
          >
            {/* Tag */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: currentStory.accent }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: currentStory.accent }}>
                {currentStory.tag}
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-4xl font-bold text-white mb-4 font-rajdhani whitespace-pre-line leading-tight">
              {currentStory.headline}
            </h2>

            {/* Body */}
            <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line font-exo">
              {currentStory.body}
            </p>

            {/* Progress */}
            <div className="mt-6 flex items-center gap-2">
              {STORY_SLIDES.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden"
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: i === currentSlide ? '100%' : i < currentSlide ? '100%' : '0%',
                      backgroundColor: currentStory.accent,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section (appears at end of scroll) */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 transition-all duration-500"
        style={{
          opacity: scrollProgress > 0.8 ? 1 : 0,
          transform: `translateY(${scrollProgress > 0.8 ? '0' : '100%'})`,
        }}
      >
        <div className="bg-gradient-to-t from-[#020d06] via-[#020d06]/95 to-transparent pt-16 pb-8 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-white mb-6 font-rajdhani">
              Ready to Secure Your Airspace?
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white gap-2">
                  <Plane className="h-5 w-5" />
                  Register Drone
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/deploy">
                <Button size="lg" variant="outline" className="border-green-500/30 hover:border-green-500 gap-2">
                  <MapPin className="h-5 w-5" />
                  Deploy Zone
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="border-green-500/30 hover:border-green-500 gap-2">
                  <Shield className="h-5 w-5" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid (visible only at certain scroll points) */}
      <div 
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-30 transition-opacity duration-500"
        style={{ opacity: scrollProgress > 0.2 && scrollProgress < 0.4 ? 1 : 0 }}
      >
        <div className="grid grid-cols-3 gap-6 max-w-4xl px-6">
          {[
            { icon: Shield, label: "Blockchain Registry", color: "#22c55e" },
            { icon: Globe, label: "AI-Powered Patrol", color: "#8b5cf6" },
            { icon: CheckCircle, label: "Hedera HCS", color: "#00f5ff" },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-[#0a1a0f]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center transition-all duration-300 hover:border-green-500/50"
              style={{
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-green-500/20 to-cyan-500/20 flex items-center justify-center">
                <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
              </div>
              <p className="text-sm font-semibold text-white font-rajdhani">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}