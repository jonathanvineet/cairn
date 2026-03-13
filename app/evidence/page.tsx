"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWalletStore } from "@/stores/walletStore";
import { useHederaWallet } from "@/lib/useHederaWallet";
import { DRONE_EVIDENCE_VAULT_ADDRESS } from "@/lib/contracts";
import * as ethers from "ethers";

interface SelectedDrone {
  cairnDroneId: string;
  evmAddress: string;
  location: { lat: number; lng: number };
  batteryLevel: number;
  health: string;
  score: number;
  reason: string;
}

export default function EvidencePage() {
  const router = useRouter();
  const { connected, selectedAccount, hasHydrated } = useWalletStore();
  const { signAndExecuteTransaction } = useHederaWallet();

  const [drone, setDrone] = useState<SelectedDrone | null>(null);
  const [countdown, setCountdown] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [evidenceHash, setEvidenceHash] = useState<string>("");
  const [imageData, setImageData] = useState<{ path: string; hash: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
  };

  // Mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load selected drone from sessionStorage
  useEffect(() => {
    try {
      const droneData = sessionStorage.getItem("selectedDrone");
      if (droneData) {
        setDrone(JSON.parse(droneData));
      }
    } catch (error) {
      console.error("Failed to load drone data:", error);
    }
  }, []);

  // Check wallet connection - only redirect after hydration
  useEffect(() => {
    if (hasHydrated && !connected) {
      router.push("/");
    }
  }, [connected, hasHydrated, router]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0 || submitted) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, submitted]);

  // Submit patrol when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && !submitted && drone) {
      submitPatrol();
    }
  }, [countdown, submitted, drone]);

  const submitPatrol = async () => {
    if (!drone || !selectedAccount) {
      addLog("❌ Missing drone or account data");
      return;
    }

    // Import SDK types
    const { ContractExecuteTransaction, ContractFunctionParameters, ContractId } = await import("@hiero-ledger/sdk");

    setIsSubmitting(true);
    setSubmitted(true);

    try {
      // Mock image hash (simulating drone evidence data)
      // In a real scenario, this would be computed from actual drone footage
      const mockImagePath = "C:\\Users\\hp\\Documents\\broken-metallic-fence.jpg";
      // Convert ethers.id() result to proper bytes32 format
      const hashHex = ethers.id(mockImagePath);
      const hashBytes32 = ethers.getBytes(hashHex); // Convert hex string to bytes

      addLog(`🎬 Simulating drone patrol data collection...`);
      
      // Step 1: Register drone on vault if not already registered
      addLog(`🔐 Registering drone on DroneEvidenceVault...`);
      try {
        const registerTx = new ContractExecuteTransaction()
          .setContractId(ContractId.fromEvmAddress(0, 0, DRONE_EVIDENCE_VAULT_ADDRESS))
          .setGas(500000)
          .setFunction("registerDrone", new ContractFunctionParameters().addString(drone.cairnDroneId));

        const registerResult = await signAndExecuteTransaction(registerTx);
        addLog(`✓ Drone registered! TX: ${registerResult?.transactionId?.toString() || "pending"}`);
      } catch (error: any) {
        if (error.message?.includes("already") || error.message?.includes("registered")) {
          addLog(`✓ Drone already registered`);
        } else {
          addLog(`⚠️ Registration error (continuing): ${error.message}`);
        }
      }

      // Step 2: Submit patrol data
      addLog(`📤 Submitting patrol evidence to blockchain...`);
      const zoneId = sessionStorage.getItem("deploymentZoneId") || "patrol-zone-1";
      const ipfsCid = "QmXxxx...mock-cid"; // Mock IPFS CID

      const submitTx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromEvmAddress(0, 0, DRONE_EVIDENCE_VAULT_ADDRESS))
        .setGas(500000)
        .setFunction(
          "submitPatrol",
          new ContractFunctionParameters()
            .addString(drone.cairnDroneId)
            .addString(zoneId)
            .addString(ipfsCid)
            .addBytes32(hashBytes32)
        );

      const submitResult = await signAndExecuteTransaction(submitTx);
      addLog(`✓ Patrol submitted! TX: ${submitResult?.transactionId?.toString()}`);
      addLog(`📍 Location: ${drone.location.lat.toFixed(4)}°, ${drone.location.lng.toFixed(4)}°`);
      addLog(`🖼️ Evidence Hash: ${hashHex.substring(0, 16)}...`);
      addLog(`✅ Evidence secured on-chain!`);
      
      // Store evidence data for display
      setEvidenceHash(hashHex);
      setImageData({
        path: mockImagePath,
        hash: hashHex
      });
    } catch (error: any) {
      const errorMsg = error?.message || JSON.stringify(error);
      addLog(`❌ Submission failed: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (hasHydrated && !connected) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 16 }}>🔗</div>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Please Connect Your Wallet</h1>
        <p style={{ fontSize: 12, color: "var(--muted-fg)", marginBottom: 24 }}>You need to connect your wallet to submit evidence</p>
        <Link href="/">
          <button className="btn btn-primary">← Back to Home</button>
        </Link>
      </div>
    );
  }

  if (!drone) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 16 }}>❌</div>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Drone Selected</h1>
        <p style={{ fontSize: 12, color: "var(--muted-fg)", marginBottom: 24 }}>Please run analysis first</p>
        <Link href="/analysis">
          <button className="btn btn-primary">← Back to Analysis</button>
        </Link>
      </div>
    );
  }

  const progressPercent = ((30 - countdown) / 30) * 100;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* header */}
      <header className="page-header">
        <div className="page-header-left">
          <Link href="/analysis" style={{ textDecoration: "none" }}>
            <button className="back-btn">← CAIRN</button>
          </Link>
          <span className="header-divider">|</span>
          <span className="header-subtitle">EVIDENCE SUBMISSION</span>
        </div>
        <div className="page-header-right">
          <div className="live-dot" />
          <span className="network-label">HEDERA TESTNET</span>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", padding: 28, gap: 28, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        {/* Left: Drone Info */}
        <div style={{ flex: 0.4, display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card anim-up d0" style={{ padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", marginBottom: 18, textTransform: "uppercase", color: "var(--muted-fg)" }}>
              📡 SELECTED DRONE
            </div>

            <div style={{ backgroundColor: "var(--muted)", padding: 18, borderRadius: "var(--radius)", marginBottom: 18, borderLeft: "3px solid var(--fg)" }}>
              <div style={{ fontSize: 10, color: "var(--muted-fg)", marginBottom: 6, fontWeight: 500 }}>DRONE ID</div>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: ".02em" }}>{drone.cairnDroneId}</div>
            </div>

            {[
              { label: "SCORE", value: `${Math.round(drone.score)}/100` },
              { label: "BATTERY", value: `${drone.batteryLevel}%` },
              { label: "HEALTH", value: drone.health },
              { label: "LOCATION", value: `${drone.location.lat.toFixed(4)}°, ${drone.location.lng.toFixed(4)}°` },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: "var(--muted-fg)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>{item.value}</div>
              </div>
            ))}

            <div style={{ padding: 12, backgroundColor: "var(--card)", borderRadius: "var(--radius)", marginTop: 16, borderLeft: "2px solid var(--fg)" }}>
              <div style={{ fontSize: 10, color: "var(--muted-fg)", lineHeight: 1.6, fontStyle: "italic" }}>
                "{drone.reason}"
              </div>
            </div>
          </div>
        </div>

        {/* Right: Submission Status */}
        <div style={{ flex: 0.6, display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Countdown */}
          <div className="card card-offset anim-scale" style={{ padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-fg)", letterSpacing: ".1em", marginBottom: 16, textTransform: "uppercase" }}>
              📸 SIMULATING DRONE PATROL
            </div>

            <div style={{
              fontSize: 64,
              fontWeight: 700,
              color: countdown > 10 ? "var(--fg)" : countdown > 5 ? "#f59e0b" : "#dc2626",
              marginBottom: 16,
              fontFamily: "monospace",
              lineHeight: 1
            }}>
              {countdown}s
            </div>

            {/* Progress bar */}
            <div style={{
              width: "100%",
              height: 6,
              backgroundColor: "var(--muted)",
              borderRadius: 3,
              overflow: "hidden",
              marginBottom: 18
            }}>
              <div
                style={{
                  height: "100%",
                  background: countdown > 10 ? "var(--fg)" : countdown > 5 ? "#f59e0b" : "#dc2626",
                  width: `${progressPercent}%`,
                  transition: "width 0.3s linear"
                }}
              />
            </div>

            <div style={{ fontSize: 11, color: "var(--muted-fg)", lineHeight: 1.6 }}>
              Collecting patrol evidence...
              <br />
              Mock image: broken-metallic-fence.jpg
              <br />
              Will submit to chain after completion
            </div>
          </div>

          {/* Blockchain Log */}
          <div className="card anim-up d0" style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", marginBottom: 12, textTransform: "uppercase", color: "var(--muted-fg)" }}>
              📋 BLOCKCHAIN LOG
            </div>
            <div style={{
              flex: 1,
              overflowY: "auto",
              fontSize: 10,
              fontFamily: "monospace",
              color: "var(--muted-fg)",
              lineHeight: 1.8,
              borderTop: "1px solid var(--border)",
              paddingTop: 12
            }}>
              {logs.length === 0
                ? <div style={{ color: "var(--border)" }}>// awaiting action...</div>
                : logs.map((log, i) => (
                    <div key={i} style={{
                      color: log.includes("✓") || log.includes("✅") ? "var(--fg)" : log.includes("❌") || log.includes("⚠️") ? "#dc2626" : "var(--muted-fg)",
                      fontWeight: log.includes("✓") || log.includes("✅") ? 600 : 400
                    }}>
                      {log}
                    </div>
                  ))}
            </div>
          </div>

          {/* Evidence Display - shown after successful submission */}
          {submitted && evidenceHash && imageData && (
            <div className="card card-offset anim-scale" style={{ padding: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", marginBottom: 16, textTransform: "uppercase", color: "var(--muted-fg)" }}>
                ✅ EVIDENCE SUBMITTED
              </div>

              {/* Image Information */}
              <div style={{ backgroundColor: "var(--muted)", padding: 16, borderRadius: "var(--radius)", marginBottom: 16, borderLeft: "3px solid var(--fg)" }}>
                <div style={{ fontSize: 9, color: "var(--muted-fg)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>
                  📸 IMAGE FILE
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg)", fontFamily: "monospace", wordBreak: "break-all", marginBottom: 8 }}>
                  {imageData.path}
                </div>
              </div>

              {/* Image Preview */}
              <div style={{ backgroundColor: "var(--card)", padding: 16, borderRadius: "var(--radius)", marginBottom: 16, border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "var(--muted-fg)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 12 }}>
                  📷 EVIDENCE PREVIEW
                </div>
                <img
                  src="/evidence-samples/broken-metallic-fence.jpg"
                  alt="Broken Metallic Fence Evidence"
                  style={{
                    width: "100%",
                    maxHeight: 240,
                    borderRadius: "var(--radius)",
                    objectFit: "cover",
                    border: "2px solid var(--border)"
                  }}
                />
              </div>

              {/* Hash Value */}
              <div style={{ backgroundColor: "var(--card)", padding: 16, borderRadius: "var(--radius)", marginBottom: 16, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 9, color: "var(--muted-fg)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>
                  🔐 SUBMITTED HASH (bytes32)
                </div>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--fg)", wordBreak: "break-all", lineHeight: 1.6, fontWeight: 500 }}>
                  {evidenceHash}
                </div>
              </div>

              {/* Short Hash */}
              <div style={{ backgroundColor: "var(--card)", padding: 12, borderRadius: "var(--radius)", border: "1px dashed var(--border)", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "var(--muted-fg)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>
                  HASH REFERENCE
                </div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "var(--fg)", fontWeight: 700 }}>
                  {evidenceHash.substring(0, 18)}...{evidenceHash.substring(-16)}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <Link href="/dashboard" style={{ flex: 1 }}>
                  <button className="btn btn-primary" style={{ width: "100%", fontSize: 11 }}>← BACK TO DASHBOARD</button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
