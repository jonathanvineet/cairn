"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Leaf,
  Clock,
  FileX,
  DollarSign,
  Camera,
  Shield,
  Building2,
  TreePine,
  Scale,
  Briefcase,
  Lock,
  Rocket,
  Eye,
  ArrowRight,
  Zap,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { WalletConnect } from "@/components/WalletConnect";
import { Demozone, useDemozone } from "@/components/Demozone";
import { MagneticHover } from "@/components/MagneticHover";
import { ScrollProvider } from "@/components/ScrollProvider";
import { CursorTrail } from "@/components/CursorTrail";
import { ScrollProgress } from "@/components/ScrollProgress";
import dynamic from "next/dynamic";

// Dynamically import 3D scene (client-only)
const HeroScene = dynamic(
  () => import("@/components/3d/HeroScene").then((mod) => mod.HeroScene),
  { ssr: false }
);

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const { open, openDemo, closeDemo } = useDemozone();
  const heroRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CTA pulse animation
    if (ctaRef.current) {
      gsap.to(ctaRef.current.querySelector(".cta-button"), {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        scale: 1.05,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }, []);

  return (
    <ScrollProvider>
      <div className="relative min-h-screen text-white overflow-x-hidden">
        <CursorTrail />
        <ScrollProgress />

        {/* 3D Canvas background - Full Page */}
        <HeroScene />

        {/* HERO SECTION - Full viewport with 3D */}
        <section
          ref={heroRef}
          className="relative z-1 min-h-screen flex flex-col snap-section"
        >
          {/* Nav */}
          <nav className="relative z-20 flex items-center justify-between px-6 sm:px-8 py-5 glass-dark">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2"
            >
              <Leaf className="h-7 w-7 text-green-400" />
              <span className="text-xl font-bold tracking-tight">
                BoundaryTruth
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <WalletConnect />
            </motion.div>
          </nav>

          {/* Hero content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hero-content relative z-20 flex flex-1 flex-col items-center justify-center text-center px-4 py-24"
          >
            <Badge variant="blockchain" className="mb-6 gap-1.5 glass glow-green">
              <Lock className="h-3 w-3" />
              Blockchain Verified on Hedera
            </Badge>

            <h1 className="max-w-5xl text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="block text-white">BOUNDARY TRUTH</span>
              <span className="block bg-gradient-to-r from-green-400 via-green-500 to-green-600 bg-clip-text text-transparent mt-2">
                Legal-Proof Fence Inspections 🛡️
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed">
              Tamper-Proof Evidence Infrastructure. Autonomous drone patrols.
              <br className="hidden sm:block" />
              Blockchain-anchored records. Court-admissible inspection data.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6"
            >
              <MagneticHover strength={0.4}>
                <Link href="/register">
                  <Button size="lg" className="gap-2 glow-green-strong text-lg px-8 py-6">
                    <Shield className="h-5 w-5" />
                    Register Drone
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </MagneticHover>

              <MagneticHover strength={0.3}>
                <Link href="/deploy">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 glass text-lg px-8 py-6"
                  >
                    <MapPin className="h-5 w-5" />
                    Register Boundary
                  </Button>
                </Link>
              </MagneticHover>
            </motion.div>

            {/* Wallet Connection Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-12 glass-strong rounded-full px-6 py-3 flex items-center gap-3"
            >
              <Lock className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">
                Connect wallet to register drones or create boundaries
              </span>
            </motion.div>
          </motion.div>
        </section>

        {/* PROBLEM STATS - Emerge from ground */}
        <section className="relative z-1 isolated-section section-spacing py-16 border-y border-white/10">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center text-3xl sm:text-4xl font-bold mb-20"
            >
              The Problem We Solve
            </motion.h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {[
                {
                  icon: <Clock className="h-10 w-10 text-amber-400" />,
                  value: "18 months",
                  color: "text-amber-400",
                  desc: "average dispute resolution time",
                },
                {
                  icon: <FileX className="h-10 w-10 text-red-400" />,
                  value: "0",
                  color: "text-red-400",
                  desc: "verifiable records in manual systems",
                },
                {
                  icon: <DollarSign className="h-10 w-10 text-orange-400" />,
                  value: "₹2L per case",
                  color: "text-orange-400",
                  desc: "average investigation cost",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="opacity-100"
                >
                  <Card className="stat-card glass-strong glow-green text-center p-8 transform hover:scale-105 transition-transform duration-300 border-2 border-green-500/20 relative z-1">
                    <CardContent className="p-0 space-y-4">
                      <div className="flex justify-center">{item.icon}</div>
                      <span className={`text-5xl font-extrabold ${item.color} block`}>
                        {item.value}
                      </span>
                      <p className="text-sm text-gray-300">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS - Sequential reveal */}
        <section className="relative z-1 isolated-section section-spacing py-24">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Three simple steps to tamper-proof boundary evidence
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 relative z-20">
              {[
                {
                  step: "01",
                  icon: <TreePine className="h-10 w-10 text-green-400" />,
                  title: "Drone Patrol",
                  desc: "Scheduled autonomous checkpoint inspection across zone boundaries with GPS precision",
                },
                {
                  step: "02",
                  icon: <Camera className="h-10 w-10 text-green-400" />,
                  title: "Evidence Capture",
                  desc: "GPS-tagged photo + AI condition classification at every checkpoint with timestamps",
                },
                {
                  step: "03",
                  icon: <Shield className="h-10 w-10 text-green-400" />,
                  title: "Hedera Anchoring",
                  desc: "Tamper-proof hash submitted to Hedera Consensus Service for immutable record",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="opacity-100"
                >
                  <MagneticHover strength={0.2}>
                    <Card className="step-card glass-strong glow-green h-full group hover:glow-green-strong transition-all duration-500 border-2 border-green-500/30 relative z-1">
                      <CardContent className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-6xl font-extrabold text-green-400/40 group-hover:text-green-400/60 transition-colors">
                            {item.step}
                          </span>
                          <div className="transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                            {item.icon}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-white">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {item.desc}
                        </p>
                        <Badge variant="intact" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {i === 0 ? "Automated" : i === 1 ? "AI-Powered" : "Tamper-Proof"}
                        </Badge>
                      </CardContent>
                    </Card>
                  </MagneticHover>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* WHO IT SERVES */}
        <section className="relative z-1 isolated-section section-spacing py-24">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center text-3xl sm:text-4xl font-bold mb-20"
            >
              Who It Serves
            </motion.h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <TreePine className="h-8 w-8" />,
                  title: "Forest Department",
                  desc: "Monitor protected zones and generate court-admissible evidence",
                },
                {
                  icon: <Building2 className="h-8 w-8" />,
                  title: "Plantation Estate",
                  desc: "Track boundary compliance and resolve encroachment disputes",
                },
                {
                  icon: <Briefcase className="h-8 w-8" />,
                  title: "Insurance Company",
                  desc: "Verify claims with immutable on-chain evidence records",
                },
                {
                  icon: <Scale className="h-8 w-8" />,
                  title: "Legal Body",
                  desc: "Access tamper-proof inspection records for dispute adjudication",
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <MagneticHover strength={0.15}>
                    <Card className="glass h-full group hover:glass-strong hover:glow-green transition-all duration-300 border border-green-500/10 hover:border-green-500/30 relative z-1">
                      <CardContent className="p-6 space-y-4 text-center">
                        <div className="flex justify-center text-green-400 group-hover:scale-110 transition-transform">
                          {card.icon}
                        </div>
                        <h3 className="font-semibold text-white">
                          {card.title}
                        </h3>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {card.desc}
                        </p>
                      </CardContent>
                    </Card>
                  </MagneticHover>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA - Portal effect */}
        <section
          ref={ctaRef}
          className="relative z-1 isolated-section section-spacing py-32"
        >
          <div className="mx-auto max-w-4xl px-6 sm:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="glass-strong glow-green-strong rounded-3xl p-12 space-y-8 relative z-1"
            >
              <Badge variant="blockchain" className="gap-1.5">
                <Zap className="h-4 w-4" />
                Enter the Evidence Network
              </Badge>

              <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
                Ready to Secure Your
                <br />
                <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                  Boundary Truth?
                </span>
              </h2>

              <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                Join forest departments, estates, and legal bodies using
                blockchain-verified evidence
              </p>

              <MagneticHover strength={0.5}>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="cta-button gap-3 text-xl px-12 py-8 glow-green-strong transform hover:scale-110 transition-transform"
                  >
                    <Shield className="h-6 w-6" />
                    Launch Dashboard
                    <ArrowRight className="h-6 w-6" />
                  </Button>
                </Link>
              </MagneticHover>
            </motion.div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative z-1 border-t border-white/10 glass-dark px-6 sm:px-8 py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center text-sm text-gray-500 sm:flex-row sm:justify-between">
            <span>© 2026 BoundaryTruth. All rights reserved.</span>
            <Badge variant="blockchain" className="gap-1">
              <Lock className="h-3 w-3" />
              Hedera Testnet
            </Badge>
            <a
              href="https://github.com/jonathanvineet/cairn"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              GitHub →
            </a>
          </div>
        </footer>

        {/* Demo Modal */}
        <Demozone open={open} onClose={closeDemo} />
      </div>
    </ScrollProvider>
  );
}
