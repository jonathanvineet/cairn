"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane, 
  MapPin, 
  Wallet, 
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Activity
} from "lucide-react";
import { useWalletStore } from "@/stores/walletStore";

export default function HomePage() {
  const router = useRouter();
  const { connected, selectedAccount, connect } = useWalletStore();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [targetAction, setTargetAction] = useState<string>("");

  useEffect(() => {
    // Wallet connection handled by store
  }, []);

  const connectWallet = async () => {
    try {
      await connect();
      setShowConnectModal(false);
      
      // Proceed to target action if one was set
      if (targetAction) {
        router.push(targetAction);
      }
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      alert("Failed to connect wallet: " + error.message);
    }
  };

  const handleAction = (path: string) => {
    if (!connected) {
      setTargetAction(path);
      setShowConnectModal(true);
      return;
    }
    router.push(path);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0e27]">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1f3a_1px,transparent_1px),linear-gradient(to_bottom,#1a1f3a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Floating Orbs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Navigation */}
      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">CAIRN</h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Drone Registry</p>
              </div>
            </div>

            {connected ? (
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-sm text-emerald-400 font-medium">
                      {selectedAccount?.id}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition"
                >
                  Dashboard
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="group px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Connect HashPack
                </span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-300 text-sm mb-8"
          >
            <Sparkles className="h-4 w-4" />
            <span>Powered by Hedera Blockchain</span>
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-black text-white mb-6">
            Autonomous Drone
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400">
              Patrol Network
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Secure boundary monitoring with blockchain-verified drone registry
            and AI-powered mission planning
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-12 mb-16">
            {[
              { label: "Active Drones", value: "24+", icon: Plane },
              { label: "Protected Zones", value: "18", icon: Shield },
              { label: "Mission Uptime", value: "99.9%", icon: Activity },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className="h-5 w-5 text-cyan-400" />
                  <span className="text-3xl font-bold text-white">{stat.value}</span>
                </div>
                <span className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Register Drone Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => handleAction("/register")}
            className="group relative cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition" />
            <div className="relative h-full p-8 bg-gradient-to-br from-[#0f1729] to-[#1a2235] border border-white/10 rounded-2xl hover:border-cyan-500/50 transition-all">
              <div className="mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Plane className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Register Drone</h3>
                <p className="text-gray-400 leading-relaxed">
                  Add your drone to the decentralized registry with complete
                  specifications and location data
                </p>
              </div>

              <div className="flex items-center gap-2 text-cyan-400 font-medium group-hover:gap-4 transition-all">
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5" />
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-cyan-500/5 rounded-full blur-2xl" />
              <div className="absolute bottom-4 right-8 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            </div>
          </motion.div>

          {/* Create Boundary Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            onClick={() => handleAction("/deploy")}
            className="group relative cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition" />
            <div className="relative h-full p-8 bg-gradient-to-br from-[#0f1729] to-[#1a2235] border border-white/10 rounded-2xl hover:border-violet-500/50 transition-all">
              <div className="mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Create Boundary</h3>
                <p className="text-gray-400 leading-relaxed">
                  Define patrol zones and deploy autonomous missions with
                  blockchain-verified boundaries
                </p>
              </div>

              <div className="flex items-center gap-2 text-violet-400 font-medium group-hover:gap-4 transition-all">
                <span>Start Mission</span>
                <ArrowRight className="h-5 w-5" />
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-violet-500/5 rounded-full blur-2xl" />
              <div className="absolute bottom-4 right-8 w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
            </div>
          </motion.div>
        </div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-24 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {[
            {
              icon: Shield,
              title: "Blockchain Security",
              description: "Immutable drone registry on Hedera network"
            },
            {
              icon: Zap,
              title: "AI-Powered Selection",
              description: "Smart drone assignment based on location & specs"
            },
            {
              icon: Activity,
              title: "Real-time Monitoring",
              description: "Live mission tracking and status updates"
            }
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"
            >
              <feature.icon className="h-8 w-8 text-cyan-400 mb-4" />
              <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Wallet Connect Modal */}
      <AnimatePresence>
        {showConnectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConnectModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full mx-4"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 rounded-2xl blur-2xl" />
              <div className="relative bg-[#0f1729] border border-white/10 rounded-2xl p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Wallet className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white text-center mb-3">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-400 text-center mb-8">
                  Connect your HashPack wallet to access the drone registry
                </p>

                <button
                  onClick={connectWallet}
                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all mb-4"
                >
                  Connect HashPack
                </button>

                <button
                  onClick={() => setShowConnectModal(false)}
                  className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
