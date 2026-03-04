"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plane,
  MapPin,
  Wallet,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ethers } from "ethers";

export default function LandingPage() {
  const router = useRouter();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0].address);
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask to use this feature");
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletConnected(true);
      setWalletAddress(address);
      setShowWalletPrompt(false);
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet: " + error.message);
    }
  };

  const handleNavigate = (path: string) => {
    if (!walletConnected) {
      setShowWalletPrompt(true);
      return;
    }
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CAIRN</span>
            </div>
            
            {walletConnected ? (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <Wallet className="h-4 w-4 text-white" />
                <span className="text-sm text-white font-medium">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
            <Shield className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-blue-400 font-medium">Blockchain-Powered Drone Registry</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Autonomous Boundary
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Monitoring System
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Register drones, define boundaries, and deploy autonomous monitoring missions
            with blockchain-verified records on Hedera.
          </p>
        </motion.div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Register Drone Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:border-blue-500/50 transition-all duration-300 group cursor-pointer h-full"
                  onClick={() => handleNavigate("/register")}>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Plane className="h-8 w-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-3">Register Drone</h2>
                <p className="text-gray-400 mb-6">
                  Add a new drone to the network with its capabilities, location, and operational parameters. 
                  Secure it on the blockchain for transparent tracking.
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">Name & identify your drone</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">Set operational parameters</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">Blockchain registration</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white group-hover:shadow-lg group-hover:shadow-blue-500/50"
                  onClick={() => handleNavigate("/register")}
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Register Boundary Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:border-cyan-500/50 transition-all duration-300 group cursor-pointer h-full"
                  onClick={() => handleNavigate("/deploy")}>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-3">Create Boundary</h2>
                <p className="text-gray-400 mb-6">
                  Define geographic zones for monitoring. Draw boundaries on the map and assign
                  drones for automated patrol missions.
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">Draw custom boundaries</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">Auto-assign nearest drones</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">Deploy monitoring missions</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white group-hover:shadow-lg group-hover:shadow-cyan-500/50"
                  onClick={() => handleNavigate("/deploy")}
                >
                  Create Zone
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">Platform Features</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Blockchain Verified", desc: "All records on Hedera" },
              { icon: Zap, title: "Auto Assignment", desc: "Smart drone matching" },
              { icon: Globe, title: "Real-time Tracking", desc: "Live drone status" },
              { icon: CheckCircle, title: "Tamper-Proof", desc: "Immutable evidence" },
            ].map((feature, idx) => (
              <Card key={idx} className="bg-white/5 backdrop-blur-md border-white/10 hover:border-blue-500/30 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Wallet Prompt Modal */}
      {showWalletPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full"
          >
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wallet className="h-8 w-8 text-blue-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-white text-center mb-3">
              Wallet Connection Required
            </h3>
            <p className="text-gray-400 text-center mb-8">
              Please connect your wallet to register drones or create boundary zones on the blockchain.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={connectWallet}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
              <Button
                onClick={() => setShowWalletPrompt(false)}
                variant="outline"
                className="w-full border-white/10 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
