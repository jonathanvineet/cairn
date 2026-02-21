"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWalletStore } from "@/stores/walletStore";
import { Wallet, LogOut, Shield } from "lucide-react";

export function WalletConnect() {
  const { connected, address, connect, disconnect } = useWalletStore();

  if (connected) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="blockchain" className="gap-1.5">
          <Shield className="h-3 w-3" />
          {address}
        </Badge>
        <Button variant="ghost" size="icon" onClick={disconnect} className="h-8 w-8">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={connect} className="gap-2">
      <Wallet className="h-4 w-4" />
      Connect Hedera Wallet
    </Button>
  );
}
