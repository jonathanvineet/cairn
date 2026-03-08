"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plane, MapPin, Shield, ArrowRight, Globe, CheckCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/WalletConnect";
import { useWalletStore } from "@/stores/walletStore";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

const STORY_SLIDES = [
  {
    tag: "WELCOME TO CAIRN",
    headline: "India's On-Chain\nDrone Registry",
    body: "An autonomous airspace trust layer built on Hedera. Every drone, every flight, every boundary — permanently verifiable on the blockchain.",
    accent: "#00f5ff",
    bgColor: "from-[#020d1a] to-[#051420]",
  },
  {
    tag: "THE PROBLEM",
    headline: "Untracked Drones\nPose Real Risks",
    body: "India has 300,000+ drone operators with no unified registry. CAIRN solves this with decentralized identity — every drone staked on-chain with the operator's wallet.",
    accent: "#e94560",
    bgColor: "from-[#1a0208] to-[#200510]",
  },
  {
    tag: "HOW IT WORKS",
    headline: "Register →\nDeploy → Monitor",
    body: "1. Connect your wallet (HashPack)\n2. Register your drone with DGCA ID on Hedera HCS\n3. Define no-fly boundary zones as smart contracts\n4. AI agents watch live for breach events",
    accent: "#8b5cf6",
    bgColor: "from-[#0e051a] to-[#1a0a2e]",
  },
  {
    tag: "THE TECHNOLOGY",
    headline: "Hedera HCS +\nAI Agents",
    body: "Hedera Consensus Service finalizes every log entry in under 1 second. AI agents patrol zones autonomously — flagging breaches without any human in the loop.",
    accent: "#10b981",
    bgColor: "from-[#020d06] to-[#051a0e]",
  },
  {
    tag: "READY TO FLY?",
    headline: "Secure Your\nAirspace Today",
    body: "Certified operators, trusted zones, breach-proof enforcement. CAIRN is open-source and live on Hedera Testnet.",
    accent: "#f59e0b",
    bgColor: "from-[#1a0d02] to-[#2e1a05]",
  },
];

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { connected } = useWalletStore();
  const router = useRouter();

  // Fetch drones data
  const { data: dronesData } = useQuery({
    queryKey: ["drones"],
    queryFn: async () => {
      const res = await fetch("/api/drones");
      if (!res.ok) return { drones: [] };
      const data = await res.json();
      return data;
    },
  });

  const drones = dronesData?.drones || [];
  const activeDrones = drones.filter((d: any) => d.status === "ACTIVE");
  const assignedDrones = drones.filter((d: any) => d.assignedZoneId !== "UNASSIGNED");

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
  
  const handleNavigate = (path: string) => {
    if (!connected) {
      alert("Please connect your HashPack wallet first");
      return;
    }
    router.push(path);
  };

  return (
    <div className="min-h-[500vh] relative">
      {/* Dynamic Background with color transitions */}
      <div 
        className={`fixed inset-0 transition-all duration-1000 ease-in-out bg-gradient-to-br ${currentStory.bgColor}`}
      >
        {/* Topo Grid Pattern */}
        <div className="absolute inset-0 topo-bg opacity-40" />
        
        {/* Scan Lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-400/50 to-transparent animate-scan" />
        </div>
        
        {/* Floating Drone Silhouette */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
          style={{
            opacity: 0.08 + scrollProgress * 0.12,
            transform: `translate(-50%, calc(-50% + ${scrollProgress * -20}vh)) scale(${0.6 + scrollProgress * 0.4})`,
          }}
        >
          <div className="relative w-64 h-64 animate-float">
            <Plane className="w-full h-full text-green-500/30" strokeWidth={0.5} />
          </div>
        </div>
      </div>

      {/* Fixed Header - Higher z-index to prevent overlap */}
      <header className="fixed top-0 left-0 right-0 z-[100] border-b border-white/10 backdrop-blur-md bg-black/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white font-rajdhani tracking-wider bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 bg-clip-text text-transparent animate-pulse">
              C A I R N
            </span>
          </div>
          <div className="flex items-center gap-4 relative z-[110]">
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Sticky Story Card - Lower z-index */}
      <div className="sticky top-24 z-30 px-6 pointer-events-none mt-24">
        <div className="max-w-3xl mx-auto">
          <div 
            className="bg-black/70 backdrop-blur-xl rounded-2xl p-10 shadow-2xl pointer-events-auto transition-all duration-700 border-l-4"
            style={{
              borderLeftColor: currentStory.accent,
              opacity: scrollProgress < 0.92 ? 1 : 0,
              boxShadow: `0 25px 50px -12px ${currentStory.accent}30`,
            }}
          >
            {/* Tag */}
            <div className="flex items-center gap-3 mb-5">
              <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: currentStory.accent }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: currentStory.accent }}>
                {currentStory.tag}
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-5xl font-bold text-white mb-6 font-rajdhani whitespace-pre-line leading-tight">
              {currentStory.headline}
            </h2>

            {/* Body */}
            <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line font-exo">
              {currentStory.body}
            </p>

            {/* Progress */}
            <div className="mt-8 flex items-center gap-2">
              {STORY_SLIDES.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden"
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
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

      {/* CTA Section with ZOOM IN effect */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 transition-all duration-700"
        style={{
          opacity: scrollProgress > 0.85 ? 1 : 0,
          transform: `translateY(${scrollProgress > 0.85 ? '0' : '100%'})`,
        }}
      >
        <div className="bg-gradient-to-t from-black via-black/98 to-transparent pt-20 pb-10 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h3 className="text-5xl font-bold text-white mb-10 font-rajdhani tracking-wide">
              Ready to Secure Your Airspace?
            </h3>
            
            {!connected && (
              <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl inline-block">
                <p className="text-yellow-400 font-semibold">⚠️ Connect your HashPack wallet to continue</p>
              </div>
            )}
            
            {/* Drones Stats */}
            {connected && drones.length > 0 && (
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:border-cyan-400/50 transition-all">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Plane className="h-5 w-5 text-cyan-400" />
                    <span className="text-3xl font-bold text-white">{drones.length}</span>
                  </div>
                  <p className="text-xs text-gray-400 text-center uppercase tracking-wide">Total Drones</p>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:border-green-400/50 transition-all">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    <span className="text-3xl font-bold text-white">{activeDrones.length}</span>
                  </div>
                  <p className="text-xs text-gray-400 text-center uppercase tracking-wide">Active</p>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:border-purple-400/50 transition-all">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-purple-400" />
                    <span className="text-3xl font-bold text-white">{assignedDrones.length}</span>
                  </div>
                  <p className="text-xs text-gray-400 text-center uppercase tracking-wide">Deployed</p>
                </div>
              </div>
            )}
            
            <div 
              className="flex flex-wrap justify-center gap-6"
              style={{
                transform: scrollProgress > 0.9 ? 'scale(1)' : 'scale(0.8)',
                transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <button
                onClick={() => handleNavigate("/register")}
                className={`group relative overflow-hidden bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-8 py-5 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl shadow-green-500/30 ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="relative z-10 flex items-center gap-3">
                  <Plane className="h-6 w-6" />
                  <span>Register Drone</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </button>
              
              <button
                onClick={() => handleNavigate("/deploy")}
                className={`group relative overflow-hidden bg-gradient-to-br from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white px-8 py-5 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl shadow-cyan-500/30 ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="relative z-10 flex items-center gap-3">
                  <MapPin className="h-6 w-6" />
                  <span>Deploy Zone</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </button>
              
              <button
                onClick={() => handleNavigate("/dashboard")}
                className={`group relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-700 hover:from-purple-500 hover:to-pink-600 text-white px-8 py-5 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl shadow-purple-500/30 ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="relative z-10 flex items-center gap-3">
                  <Shield className="h-6 w-6" />
                  <span>Dashboard</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}