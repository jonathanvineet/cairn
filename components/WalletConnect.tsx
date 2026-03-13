"use client";

import { useState, useEffect, useRef } from "react";
import { useWalletStore } from "@/stores/walletStore";
import { useRouter } from "next/navigation";

export function WalletConnect() {
  const router = useRouter();
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-redirect to dashboard when wallet connects
  useEffect(() => {
    if (connected && selectedAccount && mounted) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [connected, selectedAccount, mounted, router]);

  if (!mounted) {
    return null;
  }

  const handleConnect = async () => {
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
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          padding: "6px 12px",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          background: "var(--card)",
          fontSize: 9,
          fontWeight: 600,
          color: "var(--fg)",
          fontFamily: "monospace",
          letterSpacing: ".05em",
          maxWidth: 180,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}>
          {selectedAccount.id}
        </div>
        <button
          onClick={() => disconnect()}
          disabled={isInitializing}
          style={{
            height: 32,
            width: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            cursor: "pointer",
            fontSize: 16,
            transition: "all 0.15s",
            opacity: isInitializing ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--muted)";
            e.currentTarget.style.borderColor = "var(--fg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
          title="Disconnect wallet"
        >
          🔓
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <button
        type="button"
        onClick={handleConnect}
        disabled={isInitializing || isConnecting}
        style={{
          padding: "8px 16px",
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          background: "var(--fg)",
          color: "var(--bg)",
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: ".08em",
          cursor: isInitializing || isConnecting ? "not-allowed" : "pointer",
          transition: "all 0.15s",
          opacity: isInitializing || isConnecting ? 0.7 : 1
        }}
      >
        {(isInitializing || isConnecting) ? "⟳ CONNECTING..." : "🔗 CONNECT HASHPACK"}
      </button>

      {(isInitializing || isConnecting) && (
        <div style={{
          display: "flex",
          gap: 8,
          padding: "10px 12px",
          background: "var(--muted)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          fontSize: 9,
          color: "var(--muted-fg)",
          lineHeight: 1.4
        }}>
          <span style={{ marginTop: 1 }}>ℹ️</span>
          <div>
            <div style={{ fontWeight: 600, color: "var(--fg)", marginBottom: 4 }}>Approve Connection</div>
            <div>Check browser extension (top-right) or scan QR code with HashPack mobile app.</div>
          </div>
        </div>
      )}

      {showError && error && (
        <div style={{
          display: "flex",
          gap: 8,
          padding: "10px 12px",
          background: "#fee",
          border: "1px solid #fcc",
          borderRadius: "var(--radius)",
          fontSize: 9,
          color: "#c00",
          lineHeight: 1.4
        }}>
          <span style={{ marginTop: 1 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 3 }}>Connection Failed</div>
            <div>{error}</div>
          </div>
        </div>
      )}
    </div>
  );
}
