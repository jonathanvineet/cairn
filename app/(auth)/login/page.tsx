"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf, X, CheckCircle, ChevronRight } from "lucide-react";

type WalletStep = "choose" | "approve" | "confirm" | null;

export default function LoginPage() {
  const [walletStep, setWalletStep] = useState<WalletStep>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  const openWalletFlow = () => setWalletStep("choose");
  const closeWalletFlow = () => {
    setWalletStep(null);
    setSelectedWallet(null);
    setAccountId(null);
  };

  const handleChooseWallet = (wallet: string) => {
    setSelectedWallet(wallet);
    setWalletStep("approve");
  };

  const handleApprove = () => {
    setAccountId("0.0.4821904");
    setWalletStep("confirm");
  };

  const handleConfirm = () => {
    closeWalletFlow();
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a0f] via-[#0d1f13] to-[#0a1a0f] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 relative z-10 group">
        <div className="p-2 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40 transition-all duration-300">
          <Leaf className="h-6 w-6 text-black" />
        </div>
        <span className="text-2xl font-bold text-white tracking-tight bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">BoundaryTruth</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-white/20 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl p-8 shadow-2xl shadow-black/50 relative z-10">
        <h1 className="text-3xl font-bold text-white text-center mb-2 bg-gradient-to-r from-white via-green-50 to-white bg-clip-text text-transparent">
          Sign In to BoundaryTruth
        </h1>
        <p className="text-center text-gray-400 text-sm mb-8">Connect your wallet or use email to continue</p>

        {/* HashPack button */}
        <button
          onClick={openWalletFlow}
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 py-4 text-base font-semibold text-black hover:from-green-400 hover:to-emerald-400 transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] mb-6"
        >
          <Leaf className="h-5 w-5" />
          Connect HashPack Wallet
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 border-t border-white/10" />
          <span className="text-xs text-gray-500">or sign in with email</span>
          <div className="flex-1 border-t border-white/10" />
        </div>

        {/* Email form */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Email address"
            className="w-full rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500/50 transition-all duration-200"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500/50 transition-all duration-200"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-white/10 border border-white/20 py-3.5 text-sm font-semibold text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 hover:scale-[1.01]"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Don&apos;t have access?{" "}
          <span className="text-gray-400">Contact your zone administrator</span>
        </p>
      </div>

      {/* Wallet Connection Modal */}
      {walletStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-gradient-to-b from-[#0f2016] to-[#0a1812] backdrop-blur-xl p-6 shadow-2xl shadow-black/50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                {walletStep === "choose" && "Choose Wallet"}
                {walletStep === "approve" && "Approve Connection"}
                {walletStep === "confirm" && "Confirm Account"}
              </h2>
              <button onClick={closeWalletFlow} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {["choose", "approve", "confirm"].map((step, idx) => (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      ["choose", "approve", "confirm"].indexOf(walletStep) >= idx
                        ? "bg-green-400"
                        : "bg-white/20"
                    }`}
                  />
                  {idx < 2 && <div className="h-px w-6 bg-white/20" />}
                </div>
              ))}
              <span className="ml-2 text-xs text-gray-400">
                Step {["choose", "approve", "confirm"].indexOf(walletStep) + 1} of 3
              </span>
            </div>

            {walletStep === "choose" && (
              <div className="space-y-3">
                <button
                  onClick={() => handleChooseWallet("HashPack")}
                  className="w-full flex items-center justify-between rounded-xl border border-white/20 bg-gradient-to-r from-white/10 to-white/5 px-4 py-4 text-white hover:from-white/20 hover:to-white/10 hover:border-green-500/50 transition-all duration-200 hover:scale-[1.02] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500">
                      <Leaf className="h-5 w-5 text-black" />
                    </div>
                    <span className="font-semibold">HashPack</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-400 transition-colors" />
                </button>
                <button
                  onClick={() => handleChooseWallet("WalletConnect")}
                  className="w-full flex items-center justify-between rounded-xl border border-white/20 bg-gradient-to-r from-white/10 to-white/5 px-4 py-4 text-white hover:from-white/20 hover:to-white/10 hover:border-blue-500/50 transition-all duration-200 hover:scale-[1.02] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      WC
                    </div>
                    <span className="font-semibold">WalletConnect</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </button>
              </div>
            )}

            {walletStep === "approve" && (
              <div className="text-center">
                <div className="mb-6 text-gray-300 text-sm">
                  Approve the connection request in your{" "}
                  <span className="text-white font-semibold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{selectedWallet}</span> wallet
                </div>
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center animate-pulse">
                      <Leaf className="h-10 w-10 text-green-400" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-green-500/30 animate-ping" />
                  </div>
                </div>
                <button
                  onClick={handleApprove}
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 py-3.5 text-sm font-semibold text-black hover:from-green-400 hover:to-emerald-400 transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
                >
                  Simulate Approval
                </button>
              </div>
            )}

            {walletStep === "confirm" && (
              <div className="text-center">
                <div className="inline-flex p-3 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-4">
                  <CheckCircle className="h-12 w-12 text-green-400" />
                </div>
                <p className="text-gray-300 text-sm mb-2">Connected Hedera Account</p>
                <div className="bg-white/5 rounded-xl border border-white/20 p-4 mb-6">
                  <p className="text-xl font-mono font-bold text-white">{accountId}</p>
                </div>
                <button
                  onClick={handleConfirm}
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 py-3.5 text-sm font-semibold text-black hover:from-green-400 hover:to-emerald-400 transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
                >
                  Continue to Dashboard →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

