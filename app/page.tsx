"use client";

import { useEffect, useState } from "react";
import { Plane, CheckCircle2 } from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import { useWalletStore } from "@/stores/walletStore";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

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
      setSlideIndex(prev => (prev + 1) % 4);
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

  return (
    <div className="scanlines">
      <div className="grid-bg min-h-screen flex flex-col relative">
        {/* Navbar */}
        <header className="border-b border-[#D9D9D9] bg-[#FAFAFA] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-[#2E2E2E]" />
              <span className="font-bold text-lg text-[#2E2E2E]">CAIRN</span>
              <span className="text-[#696969]">|</span>
              <span className="text-sm text-[#696969]">DRONE AIRSPACE REGISTRY</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#4ade80] live-dot"></div>
                <span className="text-xs font-semibold text-[#2E2E2E]">HEDERA TESTNET</span>
              </div>
              <WalletConnect />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-1 px-8 py-20">
          <div className="max-w-7xl mx-auto grid grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="anim-up">
              <div className="inline-block mb-6 px-3 py-1.5 border border-[#D9D9D9] rounded-full text-xs font-semibold text-[#696969]">
                ▸ Welcome to CAIRN
              </div>
              <h1 className="text-6xl font-bold text-[#2E2E2E] leading-tight mb-6">
                India's On-Chain{"\n"}
                <span className="text-[#696969]">Drone Registry</span>
              </h1>
              <p className="text-base text-[#696969] mb-8 leading-relaxed max-w-md">
                Autonomous airspace trust layer built on Hedera. Register, deploy zones, and monitor with AI agents that watch 24/7.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleNavigate("/register")}
                  className="btn-primary anim-scale d1"
                >
                  Register Drone
                </button>
                <button
                  onClick={() => handleNavigate("/deploy")}
                  className="btn-ghost anim-scale d2"
                >
                  Deploy Zone
                </button>
              </div>
            </div>

            {/* Right Column - Card */}
            <div className="card card-offset anim-scale d2">
              <div className="mb-6 flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <div className="absolute inset-0 rounded-full border border-[#D9D9D9]"></div>
                  <div className="absolute inset-0 rounded-full border border-[#D9D9D9] drone-ping" style={{transform: 'scale(1.3)', opacity: 0.5}}></div>
                  <div className="absolute inset-0 flex items-center justify-center drone-float">
                    <Plane className="w-24 h-24 text-[#2E2E2E]" />
                  </div>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#4ade80] live-dot"></div>
                  <span className="text-xs font-semibold text-[#4ade80]">LIVE</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-active">ACTIVE</span>
                  <span className="text-xs text-[#696969]">{drones.length} Registered</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FAFAFA] border border-[#D9D9D9] rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-[#2E2E2E]">{activeDrones.length}</div>
                  <div className="text-xs text-[#696969]">Active</div>
                </div>
                <div className="bg-[#FAFAFA] border border-[#D9D9D9] rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-[#2E2E2E]">{totalZones}</div>
                  <div className="text-xs text-[#696969]">Zones</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 pb-8">
          {[0, 1, 2, 3].map(i => (
            <button
              key={i}
              onClick={() => setSlideIndex(i)}
              className={`h-2 rounded-full transition-all ${i === slideIndex ? 'w-8 bg-[#2E2E2E]' : 'w-2 bg-[#D9D9D9]'}`}
            />
          ))}
        </div>

        {/* Bottom Stats Bar */}
        <div className="border-t border-[#D9D9D9] bg-[#FAFAFA] px-8 py-6">
          <div className="max-w-7xl mx-auto flex gap-8">
            <div className="flex-1 card">
              <div className="text-xs font-semibold text-[#696969] mb-2">DRONES ACTIVE</div>
              <div className="text-2xl font-bold text-[#2E2E2E] count-pop">{activeDrones.length}</div>
            </div>
            <div className="flex-1 card">
              <div className="text-xs font-semibold text-[#696969] mb-2">PATROLS</div>
              <div className="text-2xl font-bold text-[#2E2E2E] count-pop">0</div>
            </div>
            <div className="flex-1 card">
              <div className="text-xs font-semibold text-[#696969] mb-2">EVIDENCE HASHES</div>
              <div className="text-2xl font-bold text-[#2E2E2E] count-pop">0</div>
            </div>
            <div className="flex-1 card">
              <div className="text-xs font-semibold text-[#696969] mb-2">HBAR STAKED</div>
              <div className="text-2xl font-bold text-[#2E2E2E] count-pop">0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}