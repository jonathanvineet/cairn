"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, CheckCircle2, Loader2, MapPin, Plane, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BOUNDARY_ZONE_REGISTRY_ADDRESS, BOUNDARY_ZONE_REGISTRY_ABI } from "@/lib/contracts";
import { useWalletStore } from "@/stores/walletStore";
import { useHederaWallet } from "@/lib/useHederaWallet";

const InteractiveMap = dynamic(
  () => import("@/components/InteractiveMap").then((mod) => mod.InteractiveMap),
  { ssr: false }
);

interface Coordinate { lat: number; lng: number; }

export default function DeployPage() {
  const router = useRouter();
  const { connected: walletConnected, selectedAccount, hasHydrated, isInitializing: walletInitializing } = useWalletStore();
  const { signAndExecuteTransaction } = useHederaWallet();
  const [boundaryCoords, setBoundaryCoords] = useState<Coordinate[] | null>(null);
  const [zoneId, setZoneId] = useState("");
  const [savedZoneId, setSavedZoneId] = useState<string | null>(null);
  const [autoAssignedDrones, setAutoAssignedDrones] = useState<string[]>([]);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [patrolSubmitted, setPatrolSubmitted] = useState(false);
  const [patrolSubmitSuccess, setPatrolSubmitSuccess] = useState<string | null>(null);
  const [deploymentZoneId, setDeploymentZoneId] = useState<string | null>(null);
  const [deploymentDroneIds, setDeploymentDroneIds] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(l => [...l, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  useEffect(() => {
    if (!walletConnected) { alert("Please connect your HashPack wallet first"); router.push("/"); }
  }, [walletConnected, router]);

  useEffect(() => {
    fetch("/api/sync-blockchain", { method: "POST" })
      .then(() => refetchDrones())
      .catch((e) => console.warn("Background sync failed:", e));
  }, []);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (countdown !== 0 || patrolSubmitted || !deploymentZoneId) return;
    const submitPatrolToVault = async () => {
      setPatrolSubmitted(true);
      try {
        const dronesList = deploymentDroneIds.length > 0 ? deploymentDroneIds.join(", ") : "No drones assigned";
        setPatrolSubmitSuccess(`Gazebo simulation complete for zone ${deploymentZoneId} with ${deploymentDroneIds.length} drone(s)`);
      } catch (error: any) {
        setPatrolSubmitSuccess("Simulation failed (see console)");
      }
    };
    submitPatrolToVault();
  }, [countdown, patrolSubmitted, deploymentZoneId, deploymentDroneIds]);

  const { data: zonesData, refetch: refetchZones } = useQuery({
    queryKey: ["zones"],
    queryFn: async () => { const res = await fetch("/api/zones"); return res.json(); },
  });

  const { data: dronesData, refetch: refetchDrones } = useQuery({
    queryKey: ["drones"],
    queryFn: async () => { const res = await fetch("/api/drones"); if (!res.ok) throw new Error("Failed"); return res.json(); },
  });

  const handleBoundaryComplete = (coordinates: Coordinate[]) => setBoundaryCoords(coordinates);

  const handleSaveBoundary = async () => {
    if (!zoneId.trim()) { alert("Please enter a Zone ID"); return; }
    if (!boundaryCoords || boundaryCoords.length < 3) { alert("Please draw a boundary first"); return; }
    if (walletInitializing) { alert("Wallet is initializing, please wait..."); return; }
    if (!walletConnected || !selectedAccount) { alert("Please connect your wallet first"); return; }
    setIsPaymentProcessing(true);
    setLogs([]);
    try {
      const { ContractExecuteTransaction, ContractFunctionParameters, ContractId } = await import("@hiero-ledger/sdk");
      const { ethers } = await import("ethers");
      const zoneIdBytes32 = ethers.id(zoneId);
      const provider = new ethers.JsonRpcProvider("https://testnet.hashio.io/api");
      const contract = new ethers.Contract(BOUNDARY_ZONE_REGISTRY_ADDRESS, BOUNDARY_ZONE_REGISTRY_ABI, provider);
      const [, timestamp] = await contract.getZone(zoneIdBytes32);
      if (Number(timestamp) > 0) { setIsPaymentProcessing(false); alert(`Zone ID "${zoneId}" already exists!`); return; }
      const coordsStr = zoneId + "|" + boundaryCoords.flatMap(c => [Math.round(c.lat * 1_000_000).toString(), Math.round(c.lng * 1_000_000).toString()]).join(",");
      const coordsBytes = ethers.toUtf8Bytes(coordsStr);
      addLog(`Creating boundary zone "${zoneId}"...`);
      const zoneTx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromEvmAddress(0, 0, BOUNDARY_ZONE_REGISTRY_ADDRESS)).setGas(500000)
        .setFunction("createBoundaryZone", new ContractFunctionParameters().addBytes32(ethers.getBytes(zoneIdBytes32)).addBytes(coordsBytes));
      const txResult = await signAndExecuteTransaction(zoneTx);
      if (!txResult || !txResult.transactionId) throw new Error("Transaction failed");
      addLog(`✓ Zone saved on-chain! TX: ${txResult.transactionId.toString()}`);
      const zonesRes = await fetch("/api/zones/boundary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ zoneId }) });
      const zonesResData = await zonesRes.json();
      setSavedZoneId(zoneId);
      setAutoAssignedDrones(zonesResData.autoAssignedDrones || []);
      setIsPaymentProcessing(false);
      refetchZones(); refetchDrones();
    } catch (err: any) {
      setIsPaymentProcessing(false);
      if (err.code === 4001 || err.code === "ACTION_REJECTED") alert("Transaction cancelled.");
      else { console.error("❌ Error:", err); alert("Error: " + (err.reason || err.message)); }
    }
  };

  const handleConfirmAndProceed = async () => {
    const activeZoneId = selectedZone?.zoneId || savedZoneId;
    const activeBoundary = selectedZone?.coordinates || boundaryCoords;
    if (!activeZoneId || !activeBoundary || activeBoundary.length === 0) { alert("Please select or create a boundary zone first"); return; }
    sessionStorage.setItem("pendingZoneId", activeZoneId);
    sessionStorage.setItem("pendingBoundary", JSON.stringify(activeBoundary));
    sessionStorage.setItem("zoneSelectedThisSession", "true");
    window.location.href = "/analysis";
  };

  const pct = countdown !== null ? ((30 - countdown) / 30) * 100 : 0;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>

      {/* header */}
      <header className="page-header">
        <div className="page-header-left">
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <button className="back-btn">← CAIRN</button>
          </Link>
          <span className="header-divider">|</span>
          <span className="header-subtitle">DEPLOY MISSION</span>
        </div>
        <div className="page-header-right">
          <div className="live-dot" />
          <span className="network-label">HEDERA TESTNET</span>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", height: "100%" }}>

        {/* map */}
        <div style={{ flex: 1, position: "relative", height: "100%", minHeight: 0, minWidth: 0 }}>
          <InteractiveMap
            onBoundaryComplete={handleBoundaryComplete}
            drones={dronesData?.drones || []}
            selectedZone={selectedZone}
          />
        </div>

        {/* right sidebar */}
        <div style={{ width: 340, borderLeft: "1px solid var(--border)", background: "var(--bg)", overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* select existing zone */}
          <div className="card anim-up d0" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em" }}>① SELECT EXISTING ZONE</div>
              {selectedZone && <span className="badge" style={{ background: "var(--fg)", color: "var(--bg)" }}>SET ✓</span>}
            </div>
            {zonesData?.zones && zonesData.zones.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                {zonesData.zones.map((zone: any) => {
                  const zoneName = zone.zoneName || zone.zoneId.split('|')[0] || zone.zoneId.substring(0, 20);
                  return (
                    <button key={zone.zoneId} onClick={() => setSelectedZone(zone)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: "var(--radius)", border: `1px solid ${selectedZone?.zoneId === zone.zoneId ? "var(--fg)" : "var(--border)"}`, background: selectedZone?.zoneId === zone.zoneId ? "var(--fg)" : "var(--bg)", color: selectedZone?.zoneId === zone.zoneId ? "var(--bg)" : "var(--fg)", cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>{zoneName}</div>
                      <div style={{ fontSize: 10, opacity: .6, marginTop: 2 }}>{zone.drones?.length || 0} drones · {zone.coordinates?.length || 0} points</div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: "var(--muted-fg)", textAlign: "center", padding: 16 }}>No zones yet</div>
            )}
            {selectedZone && <button className="btn btn-ghost" style={{ width: "100%", marginTop: 8, fontSize: 10 }} onClick={() => setSelectedZone(null)}>CLEAR</button>}
          </div>

          {/* create new zone */}
          <div className="card anim-up d1" style={{ padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", marginBottom: 14 }}>② CREATE NEW ZONE</div>
            <div style={{ marginBottom: 12 }}>
              <label className="lbl">ZONE ID</label>
              <input className="inp" placeholder="e.g. patrol-zone-1" value={zoneId} onChange={e => setZoneId(e.target.value)} />
            </div>
            {boundaryCoords && boundaryCoords.length > 0 && (
              <div style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 11, color: "var(--muted-fg)", background: "var(--muted)", marginBottom: 10 }}>
                ✓ Boundary: {boundaryCoords.length} points
              </div>
            )}
            <button className="btn btn-ghost" onClick={handleSaveBoundary} disabled={isPaymentProcessing || !boundaryCoords || boundaryCoords.length < 3 || !zoneId.trim()} style={{ width: "100%", fontSize: 11 }}>
              {isPaymentProcessing ? "SAVING TO CHAIN..." : "SAVE TO BLOCKCHAIN"}
            </button>
          </div>

          {/* blockchain log */}
          <div className="card anim-up d2" style={{ padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", marginBottom: 10 }}>BLOCKCHAIN LOG</div>
            <div style={{ minHeight: 80, fontSize: 11, color: "var(--muted-fg)", lineHeight: 1.9 }}>
              {logs.length === 0
                ? <span style={{ color: "var(--border)" }}>// awaiting action...</span>
                : logs.map((l, i) => (
                  <div key={i} className="anim-left" style={{ animationDelay: `${i * 40}ms`, color: l.includes("✓") ? "var(--fg)" : "var(--muted-fg)", fontWeight: l.includes("✓") ? 700 : 400 }}>{l}</div>
                ))
              }
              {isPaymentProcessing && <div style={{ display: "flex", gap: 4, marginTop: 4 }}><span className="think-dot" /><span className="think-dot" /><span className="think-dot" /></div>}
            </div>
          </div>

          {/* success state */}
          {savedZoneId && (
            <div className="card card-offset anim-scale" style={{ padding: 20, textAlign: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid var(--fg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 18, fontWeight: 700 }}>✓</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Zone Created!</div>
              <div style={{ fontSize: 11, color: "var(--muted-fg)", marginBottom: 14 }}>ID: {savedZoneId}</div>
              {autoAssignedDrones.length > 0 && (
                <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "8px 12px", fontSize: 11, color: "var(--muted-fg)", marginBottom: 10, textAlign: "left" }}>
                  {autoAssignedDrones.length} drone(s) auto-assigned
                </div>
              )}
              {patrolSubmitSuccess && (
                <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "8px 12px", fontSize: 11, color: "var(--fg)", marginBottom: 10 }}>{patrolSubmitSuccess}</div>
              )}
            </div>
          )}

          {/* proceed to analysis */}
          {(savedZoneId || selectedZone) && (
            <div className="card anim-up d0" style={{ padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", marginBottom: 14 }}>③ ANALYZE & DEPLOY</div>
              <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "10px 13px", background: "var(--muted)", marginBottom: 14 }}>
                <div className="lbl" style={{ marginBottom: 3 }}>SELECTED ZONE</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>
                  {selectedZone ? (selectedZone.zoneName || selectedZone.zoneId.split('|')[0] || selectedZone.zoneId.substring(0, 20)) : savedZoneId}
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleConfirmAndProceed} style={{ width: "100%", fontSize: 12 }}>
                ANALYZE & DEPLOY →
              </button>
            </div>
          )}

          {/* available drones */}
          <div className="card anim-up d3" style={{ padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", marginBottom: 12 }}>AVAILABLE DRONES</div>
            {dronesData?.drones && dronesData.drones.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto" }}>
                {dronesData.drones.map((drone: any) => (
                  <div key={drone.evmAddress} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>{drone.cairnDroneId}</div>
                      <div style={{ fontSize: 10, color: "var(--muted-fg)", marginTop: 2 }}>{drone.model}</div>
                    </div>
                    <span className="badge" style={{ background: drone.status === "ACTIVE" ? "#000" : "transparent", color: drone.status === "ACTIVE" ? "#fff" : "var(--muted-fg)", border: drone.status === "ACTIVE" ? "none" : "1px solid var(--border)" }}>
                      {drone.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: "var(--muted-fg)", textAlign: "center", padding: 16 }}>No drones registered</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
