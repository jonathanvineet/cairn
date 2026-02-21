"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleConnect = async () => {
    setShowError(false);
    try {
      await connect();
    } catch {
      setShowError(true);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setShowError(false);
    } catch {
      setShowError(true);
    }
  };

  if (connected && selectedAccount) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="blockchain" className="gap-1.5">
          <Shield className="h-3 w-3" />
          <span className="font-mono text-xs">{selectedAccount.id}</span>
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDisconnect}
          disabled={isInitializing}
          className="h-8 w-8"
          title="Disconnect wallet"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleConnect}
        disabled={isInitializing}
        className="gap-2"
      >
        <Wallet className="h-4 w-4" />
        {isInitializing ? "Connecting..." : "Connect Hedera Wallet"}
      </Button>
      {showError && error && (
        <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
