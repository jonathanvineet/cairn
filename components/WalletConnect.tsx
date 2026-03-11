"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWalletStore } from "@/stores/walletStore";
import { Wallet, LogOut, Shield, AlertCircle } from "lucide-react";

export function WalletConnect() {
  const {
    connected,
    selectedAccount,
    connect,
    disconnect,
    error,
    isInitializing,
  } = useWalletStore();

  const [showError, setShowError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleConnect = async () => {
    // Prevent multiple concurrent connections
    if (isConnecting || isInitializing) {
      console.log('⚠️ Connection already in progress');
      return;
    }
    
    setShowError(false);
    setIsConnecting(true);
    
    try {
      console.log('🔵 Starting wallet connection...');
      await connect();
      console.log('✅ Wallet connected successfully');
    } catch (error) {
      console.error('❌ Connection failed:', error);
      setShowError(true);
    } finally {
      setIsConnecting(false);
    }
  };

  if (connected && selectedAccount) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-3 py-1.5 border border-[#D9D9D9] rounded-full bg-[#2E2E2E] text-[#FAFAFA] text-[10px] font-semibold">
          <span className="font-mono max-w-[120px] truncate block">
            {selectedAccount.id}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          disabled={isInitializing}
          className="h-9 w-9 flex items-center justify-center hover:bg-[#D9D9D9] transition-colors rounded-lg"
          title="Disconnect wallet"
        >
          <LogOut className="h-4 w-4 text-[#696969]" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleConnect}
          disabled={isInitializing || isConnecting}
          className="btn-primary gap-2 flex items-center px-4 py-2 h-10 disabled:opacity-50"
        >
          <Wallet className="h-4 w-4" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            {(isInitializing || isConnecting) ? "Connecting..." : "Connect HashPack"}
          </span>
        </button>

        {(isInitializing || isConnecting) && (
          <div className="flex items-start gap-2 text-[10px] text-[#2E2E2E] bg-[#D9D9D9] p-2.5 rounded border border-[#696969]">
            <Shield className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-semibold mb-1">Approve Connection</p>
              <p className="text-[#696969]">If you have HashPack extension: check browser extensions (top-right). Otherwise: scan QR code with HashPack mobile app.</p>
            </div>
          </div>
        )}

        {showError && error && (
          <div className="flex flex-col gap-2 text-[11px] text-[#2E2E2E] bg-[#FFE6E6] p-3 rounded-lg border border-[#D9D9D9]">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
            <button
              onClick={handleConnect}
              className="btn-ghost h-8 text-[10px] font-semibold"
            >
              🔄 Retry Connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
