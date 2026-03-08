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
        <Badge variant="blockchain" className="gap-1.5 glass bg-green-500/10 border-green-500/30 py-1.5 px-3">
          <Shield className="h-3 w-3 text-green-400" />
          <span className="font-mono text-[10px] max-w-[120px] truncate">
            {selectedAccount.id}
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
          onClick={handleConnect}
          disabled={isInitializing || isConnecting}
          className="gap-2 glass border-green-500/30 hover:border-green-500/60 pr-3 h-10 transition-all"
        >
          <Wallet className="h-4 w-4 text-green-400" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            {(isInitializing || isConnecting) ? "Connecting..." : "Connect HashPack"}
          </span>
        </Button>

        {(isInitializing || isConnecting) && (
          <div className="flex items-start gap-2 text-[10px] text-cyan-400 bg-cyan-500/10 p-2.5 rounded border border-cyan-500/20">
            <Shield className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-semibold mb-1">Approve Connection</p>
              <p className="text-gray-400">If you have HashPack extension: check browser extensions (top-right). Otherwise: scan QR code with HashPack mobile app.</p>
            </div>
          </div>
        )}

        {showError && error && (
          <div className="flex flex-col gap-2 text-[11px] text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleConnect}
              className="border-green-500/30 hover:border-green-500/60 h-8 text-[10px] font-semibold"
            >
              🔄 Retry Connection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
