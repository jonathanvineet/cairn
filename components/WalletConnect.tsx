"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    setMounted(true);
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
        <Badge variant="blockchain" className="gap-1.5 glass bg-green-500/10 border-green-500/30">
          <Shield className={`h-3 w-3 ${walletType === 'META_MASK' ? 'text-orange-400' : 'text-green-400'}`} />
          <span className="font-mono text-[10px] max-w-[100px] truncate">
            {selectedAccount.id}
          </span>
          <span className="text-[8px] opacity-50 ml-1">
            {walletType === 'META_MASK' ? 'ETH' : 'HBAR'}
          </span>
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={disconnect}
          disabled={isInitializing}
          className="h-8 w-8 hover:bg-white/5"
          title="Disconnect wallet"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1 group">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            disabled={isInitializing}
            className="gap-2 glass border-green-500/20 hover:border-green-500/50 pr-2"
          >
            <Wallet className="h-4 w-4" />
            {isInitializing ? "Connecting..." : "Connect Wallet"}
            <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 glass-strong border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => handleConnect("META_MASK")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
            >
              <div className="p-1.5 bg-orange-500/10 rounded-lg">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Mirror_Logo.svg" className="h-4 w-4" alt="MetaMask" />
              </div>
              <div>
                <p className="text-xs font-bold">MetaMask</p>
                <p className="text-[10px] text-gray-400 underline decoration-green-500/50">Hedera EVM</p>
              </div>
            </button>
            <div className="h-[1px] bg-white/5" />
            <button
              onClick={() => handleConnect("HASH_PACK")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
            >
              <div className="p-1.5 bg-green-500/10 rounded-lg">
                <Shield className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-xs font-bold">HashPack</p>
                <p className="text-[10px] text-gray-400">Hedera Native</p>
              </div>
            </button>
          </div>
        )}

        {showError && error && (
          <div className="absolute top-full right-0 mt-14 w-64 flex items-center gap-2 text-[10px] text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20 backdrop-blur-md z-50">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
