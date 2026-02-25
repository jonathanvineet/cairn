"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWalletStore, WalletType } from "@/stores/walletStore";
import { Wallet, LogOut, Shield, AlertCircle, ChevronDown } from "lucide-react";

export function WalletConnect() {
  const {
    connected,
    selectedAccount,
    walletType,
    connect,
    disconnect,
    error,
    isInitializing,
  } = useWalletStore();

  const [showError, setShowError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleConnect = async (type: WalletType) => {
    setShowError(false);
    setIsOpen(false);
    try {
      await connect(type);
    } catch {
      setShowError(true);
    }
  };

  if (connected && selectedAccount) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="blockchain" className="gap-1.5 glass bg-green-500/10 border-green-500/30 py-1.5 px-3">
          <Shield className={`h-3 w-3 ${walletType === 'META_MASK' ? 'text-orange-400' : 'text-green-400'}`} />
          <span className="font-mono text-[10px] max-w-[120px] truncate">
            {selectedAccount.id}
          </span>
          <span className="text-[9px] font-bold opacity-60 ml-1 px-1 bg-white/5 rounded">
            {walletType === 'META_MASK' ? 'EVM' : 'NATIVE'}
          </span>
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => disconnect()}
          disabled={isInitializing}
          className="h-9 w-9 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          title="Disconnect wallet"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isInitializing}
          className={`gap-2 glass border-green-500/30 hover:border-green-500/60 pr-3 h-10 transition-all ${isOpen ? 'bg-green-500/10 ring-2 ring-green-500/20' : ''}`}
        >
          <Wallet className="h-4 w-4 text-green-400" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            {isInitializing ? "Initializing..." : "Connect Wallet"}
          </span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </Button>

        {isOpen && (
          <div className="absolute top-[calc(100%+8px)] right-0 w-56 glass-strong border border-white/10 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[999] animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-2 space-y-1">
              <button
                type="button"
                onClick={() => handleConnect("META_MASK")}
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-lg transition-all group text-left"
              >
                <div className="p-2 bg-orange-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Mirror_Logo.svg" className="h-5 w-5" alt="MetaMask" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">MetaMask</p>
                  <p className="text-[10px] text-gray-400">Hedera EVM (Hashio)</p>
                </div>
              </button>

              <div className="h-px bg-white/5 mx-2" />

              <button
                type="button"
                onClick={() => handleConnect("HASH_PACK")}
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-lg transition-all group text-left"
              >
                <div className="p-2 bg-green-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Shield className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">HashPack</p>
                  <p className="text-[10px] text-gray-400">Hedera Native (SDK)</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {showError && error && (
          <div className="absolute top-[calc(100%+60px)] right-0 w-64 flex items-center gap-3 text-[11px] text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 backdrop-blur-xl z-[1000] shadow-xl">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
