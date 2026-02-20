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
    <div className="min-h-screen bg-[#0a1a0f] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Leaf className="h-7 w-7 text-green-400" />
        <span className="text-xl font-bold text-white tracking-tight">BoundaryTruth</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-2xl font-bold text-white text-center mb-8">
          Sign In to BoundaryTruth
        </h1>

        {/* HashPack button */}
        <button
          onClick={openWalletFlow}
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-green-500 py-3.5 text-base font-semibold text-black hover:bg-green-400 transition mb-6"
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
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-white/10 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f2016] p-6 shadow-2xl">
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
                  className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-3">
                    <Leaf className="h-5 w-5 text-green-400" />
                    <span className="font-medium">HashPack</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                <button
                  onClick={() => handleChooseWallet("WalletConnect")}
                  className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-blue-400" />
                    <span className="font-medium">WalletConnect</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            )}

            {walletStep === "approve" && (
              <div className="text-center">
                <div className="mb-4 text-gray-400 text-sm">
                  Approve the connection request in your{" "}
                  <span className="text-white font-medium">{selectedWallet}</span> wallet
                </div>
                <div className="mb-6 flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-green-500/15 flex items-center justify-center animate-pulse">
                    <Leaf className="h-8 w-8 text-green-400" />
                  </div>
                </div>
                <button
                  onClick={handleApprove}
                  className="w-full rounded-lg bg-green-500 py-3 text-sm font-semibold text-black hover:bg-green-400 transition"
                >
                  Simulate Approval
                </button>
              </div>
            )}

            {walletStep === "confirm" && (
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-400 text-sm mb-2">Connected Hedera Account</p>
                <p className="text-xl font-mono font-bold text-white mb-6">{accountId}</p>
                <button
                  onClick={handleConfirm}
                  className="w-full rounded-lg bg-green-500 py-3 text-sm font-semibold text-black hover:bg-green-400 transition"
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
