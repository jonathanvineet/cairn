"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plane, MapPin, Shield, CheckCircle, Loader2, ArrowLeft, Zap } from "lucide-react";
import { LocationPicker } from "@/components/LocationPicker";
import { TransactionLog, TransactionLogEntry } from "@/components/TransactionLog";
import { useWalletStore } from "@/stores/walletStore";
import { useHederaWallet } from "@/lib/useHederaWallet";
import { DRONE_REGISTRY_ADDRESS } from "@/lib/contracts";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const DRONE_MODELS = [
  { id: "dji-m30t",     name: "DJI Matrice 30T",        specs: { flightTime: "41", range: "15 km", sensor: "RGB + Thermal"  }, sensorTypes: ["RGB + Thermal", "Optical Zoom", "Laser Rangefinder"] },
  { id: "dji-mavic-3e", name: "DJI Mavic 3 Enterprise", specs: { flightTime: "45", range: "15 km", sensor: "4/3 CMOS Wide"  }, sensorTypes: ["High-Res RGB", "Multispectral", "RTK Mapping"] },
  { id: "autel-evo-2",  name: "Autel Evo II Dual 640T", specs: { flightTime: "38", range: "9 km",  sensor: "8K + Thermal"   }, sensorTypes: ["8K Optical", "Radiometric Thermal", "Night Vision"] },
  { id: "skydio-x10",   name: "Skydio X10",             specs: { flightTime: "35", range: "12 km", sensor: "AI Autonomy"    }, sensorTypes: ["AI Navigation", "4K Wide", "Night Ops"] },
];

const STEPS = ["DRONE INFO", "CERTIFICATION", "LOCATION", "REVIEW"];

export default function RegisterDronePage() {
  const router = useRouter();
  const { connected, selectedAccount } = useWalletStore();
  const { signAndExecuteTransaction } = useHederaWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredDroneData, setRegisteredDroneData] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
  const [step, setStep] = useState(0);
  const [transactionLogs, setTransactionLogs] = useState<TransactionLogEntry[]>([]);

  const [formData, setFormData] = useState({
    droneName: "", model: "dji-m30t", serialNumber: "",
    dgcaCertNumber: "", certExpiryDate: "", sensorType: "RGB + Thermal", maxFlightMinutes: "41",
  });

  useEffect(() => {
    if (!connected) { alert("Please connect your HashPack wallet first"); router.push("/"); }
  }, [connected, router]);

  useEffect(() => {
    const model = DRONE_MODELS.find(m => m.id === formData.model);
    if (model) setFormData(prev => ({ ...prev, sensorType: model.sensorTypes[0], maxFlightMinutes: model.specs.flightTime }));
  }, [formData.model]);

  const handleLocationSelect = (location: { lat: number; lng: number }) => setCurrentLocation(location);

  const addLog = (message: string, status: "info" | "success" | "error" | "loading" = "info", transactionId?: string, explorerLink?: string, type?: "account" | "transfer" | "contract" | "topic" | "manifest") => {
    setTransactionLogs(l => [...l, {
      timestamp: new Date().toLocaleTimeString(),
      message,
      status,
      transactionId,
      explorerLink,
      type
    }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !selectedAccount) { alert("Please connect your wallet first"); return; }
    if (!currentLocation) { alert("Please select deployment location on the map"); return; }
    if (!formData.droneName.trim()) { alert("Please provide a name for your drone"); return; }
    setIsSubmitting(true);
    setTransactionLogs([]);
    try {
      const selectedModel = DRONE_MODELS.find(m => m.id === formData.model);
      addLog("Creating drone account...", "loading");
      const createAccRes = await fetch("/api/drones/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createDroneAccount", cairnDroneId: formData.droneName.trim(), serialNumber: formData.serialNumber, model: selectedModel?.name, registrationLat: currentLocation.lat, registrationLng: currentLocation.lng }),
      });
      const createAccData = await createAccRes.json();
      if (!createAccRes.ok) throw new Error(createAccData.error || "Failed to create drone account");
      const { droneAccountId, evmAddress, encryptedPrivateKey, encryptedPublicKey, transactionId: accountCreationTxId, explorerLink: accountExplorerLink } = createAccData;
      addLog(`Account created: ${droneAccountId}`, "success", accountCreationTxId, accountExplorerLink, "account");
      
      addLog("Requesting HashPack approval...", "loading");
      let contractTransactionIdString = "";
      let contractExplorerLink = "";
      try {
        const { ContractExecuteTransaction, ContractFunctionParameters, ContractId, AccountId } = await import("@hiero-ledger/sdk");

        // Deployed contract expects 4 parameters (old signature):
        // 1) cairnId (string)
        // 2) accountId (address - EVM form of droneAccountId)
        // 3) zoneId (string)
        // 4) model (string)
        const droneTx = new ContractExecuteTransaction()
          .setContractId(ContractId.fromEvmAddress(0, 0, DRONE_REGISTRY_ADDRESS))
          .setGas(750000)
          .setFunction(
            "registerDrone",
            new ContractFunctionParameters()
              .addString(formData.droneName.trim())
              .addAddress(AccountId.fromString(droneAccountId).toEvmAddress())
              .addString("UNASSIGNED")
              .addString(selectedModel?.name || "Unknown")
              .addString(droneAccountId)
              .addString(encryptedPrivateKey)
          );
        const contractResult = await signAndExecuteTransaction(droneTx);
        if (contractResult && contractResult.transactionId) { 
          contractTransactionIdString = contractResult.transactionId.toString();
          contractExplorerLink = `https://testnet.mirrornode.hedera.com/#/transaction/${contractTransactionIdString}`;
          addLog("Smart contract registration completed", "success", contractTransactionIdString, contractExplorerLink, "contract");
        }
        else throw new Error("Contract registration failed");
      } catch (contractErr: any) { throw new Error(`Contract failed: ${contractErr.message}`); }
      
      addLog("Finalizing registration...", "loading");
      const finalizeRes = await fetch("/api/drones/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "completeRegistration", droneAccountId, evmAddress, encryptedPrivateKey, encryptedPublicKey, cairnDroneId: formData.droneName.trim(), serialNumber: formData.serialNumber, model: selectedModel?.name, dgcaCertNumber: formData.dgcaCertNumber, certExpiryDate: formData.certExpiryDate, assignedZoneId: "UNASSIGNED", sensorType: formData.sensorType, maxFlightMinutes: parseInt(formData.maxFlightMinutes), registeredByOfficerId: selectedAccount.id, userWalletAddress: selectedAccount.id, registrationLat: currentLocation.lat, registrationLng: currentLocation.lng, contractTransactionId: contractTransactionIdString }),
      });
      const finalizeData = await finalizeRes.json();
      if (!finalizeRes.ok) throw new Error(finalizeData.error || "Failed to finalize");
      
      // Log all transaction IDs from the finalize response
      if (finalizeData.explorerLinks?.accountCreation) {
        const acctLink = finalizeData.explorerLinks.accountCreation;
        if (acctLink.transactionId) {
          addLog("Drone registration on blockchain finalized", "success", acctLink.transactionId, acctLink.explorerUrl, "account");
        }
      }
      if (finalizeData.drone?.agentTopicId) {
        addLog(`Agent topic created: ${finalizeData.drone.agentTopicId}`, "success", undefined, `https://testnet.mirrornode.hedera.com/#/topic/${finalizeData.drone.agentTopicId}`, "topic");
      }
      
      addLog("Registration complete!", "success");
      setRegisteredDroneData(finalizeData.drone);
      setRegistrationComplete(true);
    } catch (error: any) { 
      console.error("❌ Error:", error);
      addLog(error.message || "Failed to register drone", "error");
      alert(error.message || "Failed to register drone"); 
    }
    finally { setIsSubmitting(false); }
  };

  const selectedModel = DRONE_MODELS.find(m => m.id === formData.model);

  // ── SUCCESS SCREEN ──
  if (registrationComplete && registeredDroneData) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, var(--bg) 0%, rgba(0,0,0,0.02) 100%)" }}>
        
        {/* header */}
        <header className="page-header">
          <div className="page-header-left">
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <button className="back-btn">← CAIRN</button>
            </Link>
            <span className="header-divider">|</span>
            <span className="header-subtitle">REGISTRATION SUCCESS</span>
          </div>
          <div className="page-header-right">
            <div className="live-dot" />
            <span className="network-label">HEDERA TESTNET</span>
          </div>
        </header>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 28px" }}>
          <div style={{ maxWidth: 700, width: "100%" }}>
            
            {/* Success Icon */}
            <div className="anim-scale" style={{ display: "flex", justifyContent: "center", marginBottom: 38 }}>
              <div style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                border: "2px solid var(--fg)",
                background: "var(--bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                fontWeight: 700,
                color: "var(--fg)"
              }}>
                ✓
              </div>
            </div>

            {/* Main Content */}
            <div style={{ textAlign: "center", marginBottom: 42 }} className="anim-up d0">
              <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-.01em", marginBottom: 10, color: "var(--fg)" }}>Drone Registered</h1>
              <p style={{ fontSize: 14, color: "var(--muted-fg)", lineHeight: 1.7, marginBottom: 6 }}>
                {registeredDroneData.cairnDroneId} is now live on Hedera Testnet
              </p>
              <p style={{ fontSize: 12, color: "var(--border)", letterSpacing: ".05em" }}>
                READY FOR DEPLOYMENT & SURVEILLANCE MISSIONS
              </p>
            </div>

            {/* Key Details Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }} className="anim-up d1">
              {[
                { 
                  icon: "🔗", 
                  label: "Hedera Account", 
                  value: registeredDroneData.hederaAccountId,
                  mono: true
                },
                { 
                  icon: "🛩️", 
                  label: "Model", 
                  value: registeredDroneData.model,
                  mono: false
                },
              ].map((item, i) => (
                <div key={i} style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "18px",
                  background: "var(--card)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s",
                  cursor: "default"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--fg)";
                  e.currentTarget.style.background = "var(--muted)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.background = "var(--card)";
                }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                  <div style={{ fontSize: 9, color: "var(--muted-fg)", fontWeight: 700, letterSpacing: ".09em", marginBottom: 8 }}>
                    {item.label.toUpperCase()}
                  </div>
                  <div style={{ 
                    fontSize: 12, 
                    fontWeight: 600,
                    fontFamily: item.mono ? "monospace" : "inherit",
                    color: "var(--fg)",
                    wordBreak: "break-all",
                    lineHeight: 1.5
                  }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Agent Topic if available */}
            {registeredDroneData.agentTopicId && (
              <div style={{
                border: "1px solid var(--fg)",
                borderRadius: "var(--radius)",
                padding: "18px",
                background: "var(--muted)",
                marginBottom: 24,
                transition: "all 0.2s"
              }} 
              className="anim-up d2"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--card)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--muted)";
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>🤖</span>
                  <div style={{ fontSize: 9, color: "var(--muted-fg)", fontWeight: 700, letterSpacing: ".09em" }}>
                    AGENT TOPIC ID
                  </div>
                </div>
                <div style={{ 
                  fontSize: 12, 
                  fontFamily: "monospace",
                  color: "var(--fg)",
                  wordBreak: "break-all",
                  fontWeight: 600,
                  letterSpacing: ".03em"
                }}>
                  {registeredDroneData.agentTopicId}
                </div>
              </div>
            )}

            {/* Transaction Log */}
            <div style={{ marginBottom: 28 }} className="anim-up d3">
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", color: "var(--fg)", textTransform: "uppercase" }}>
                  TRANSACTION HISTORY
                </h3>
              </div>
              <div style={{ maxHeight: 280, overflow: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--card)" }}>
                <TransactionLog 
                  entries={transactionLogs}
                  title=""
                  maxHeight="280px"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }} className="anim-up d4">
              <Link href="/dashboard" style={{ textDecoration: "none" }}>
                <button style={{
                  width: "100%",
                  padding: "16px 18px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".09em",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "inherit",
                  textTransform: "uppercase"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--muted)";
                  e.currentTarget.style.borderColor = "var(--fg)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg)";
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                >
                  ← DASHBOARD
                </button>
              </Link>
              <Link href="/deploy" style={{ textDecoration: "none" }}>
                <button style={{
                  width: "100%",
                  padding: "16px 18px",
                  border: "1px solid var(--fg)",
                  borderRadius: "var(--radius)",
                  background: "var(--fg)",
                  color: "var(--bg)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".09em",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "inherit",
                  textTransform: "uppercase"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.85";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                >
                  DEPLOY MISSION →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── REGISTRATION FORM ──
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* header */}
      <header className="page-header">
        <div className="page-header-left">
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <button className="back-btn">← CAIRN</button>
          </Link>
          <span className="header-divider">|</span>
          <span className="header-subtitle">REGISTER DRONE</span>
        </div>
        <div className="page-header-right">
          <div className="live-dot" />
          <span className="network-label">HEDERA TESTNET</span>
        </div>
      </header>

      <div style={{ flex: 1, padding: 28, maxWidth: 900, margin: "0 auto", width: "100%" }}>

        {/* step bar */}
        <div className="anim-up d0" style={{ display: "flex", alignItems: "center", marginBottom: 26 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, opacity: i <= step ? 1 : .35, transition: "opacity .3s" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: i < step ? "var(--fg)" : "transparent", border: "1px solid var(--fg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: i < step ? "var(--bg)" : "var(--fg)" }}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: i === step ? "var(--fg)" : "var(--muted-fg)" }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ width: 32, height: 1, margin: "0 8px", background: i < step ? "var(--fg)" : "var(--border)", transition: "background .3s" }} />}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18 }}>

          {/* form card */}
          <div className="card anim-up d1" style={{ padding: 24 }}>

            {step === 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".09em", marginBottom: 18 }}>DRONE INFORMATION</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="lbl">DRONE NAME *</label>
                    <input className="inp" placeholder="e.g. drone-mumbai-01" value={formData.droneName} onChange={e => setFormData({...formData, droneName: e.target.value})} />
                  </div>
                  <div>
                    <label className="lbl">SERIAL NUMBER *</label>
                    <input className="inp" placeholder="SN-2024-12345" value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} />
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <label className="lbl">DRONE MODEL</label>
                  <select className="inp" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})}>
                    {DRONE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                {selectedModel && (
                  <div style={{ marginTop: 12, border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, background: "var(--muted)" }}>
                    <div><div className="lbl" style={{ marginBottom: 3 }}>FLIGHT TIME</div><div style={{ fontSize: 12, fontWeight: 600 }}>{selectedModel.specs.flightTime} min</div></div>
                    <div><div className="lbl" style={{ marginBottom: 3 }}>RANGE</div><div style={{ fontSize: 12, fontWeight: 600 }}>{selectedModel.specs.range}</div></div>
                    <div><div className="lbl" style={{ marginBottom: 3 }}>SENSOR</div><div style={{ fontSize: 11, fontWeight: 600 }}>{selectedModel.specs.sensor}</div></div>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".09em", marginBottom: 18 }}>DGCA CERTIFICATION</div>
                <div style={{ marginBottom: 14 }}>
                  <label className="lbl">DGCA CERT NUMBER</label>
                  <input className="inp" placeholder="DGCA-12345" value={formData.dgcaCertNumber} onChange={e => setFormData({...formData, dgcaCertNumber: e.target.value})} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label className="lbl">CERT EXPIRY DATE</label>
                  <input className="inp" type="date" value={formData.certExpiryDate} onChange={e => setFormData({...formData, certExpiryDate: e.target.value})} />
                </div>
                <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 14, background: "var(--muted)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", marginBottom: 5 }}>⚠ DGCA REQUIREMENT</div>
                  <div style={{ fontSize: 12, color: "var(--muted-fg)", lineHeight: 1.6 }}>All drones must have valid DGCA certification before deployment. Details stored on-chain.</div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".09em", marginBottom: 18 }}>DEPLOYMENT LOCATION</div>
                <div style={{ height: 280, border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", background: "var(--card)" }}>
                  <LocationPicker onLocationSelect={handleLocationSelect} initialLocation={currentLocation} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".09em", marginBottom: 18 }}>REVIEW & SUBMIT</div>
                {[
                  { l: "DRONE NAME",   v: formData.droneName },
                  { l: "MODEL",        v: selectedModel?.name || "" },
                  { l: "SERIAL",       v: formData.serialNumber },
                  { l: "DGCA CERT",    v: formData.dgcaCertNumber },
                  { l: "EXPIRY",       v: formData.certExpiryDate },
                  { l: "SENSOR",       v: formData.sensorType },
                  { l: "FLIGHT TIME",  v: formData.maxFlightMinutes + " min" },
                  { l: "LOCATION",     v: currentLocation ? `${currentLocation.lat.toFixed(4)}°N, ${currentLocation.lng.toFixed(4)}°E` : "Not set" },
                ].map(r => (
                  <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 10, color: "var(--muted-fg)", fontWeight: 600, letterSpacing: ".07em" }}>{r.l}</span>
                    <span style={{ fontSize: 11, maxWidth: "55%", textAlign: "right", color: r.v ? "var(--fg)" : "var(--border)" }}>{r.v || "—"}</span>
                  </div>
                ))}
              </div>
            )}

              {/* back / next */}
            <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 24 }}>
              <button className="btn btn-ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ opacity: step === 0 ? .3 : 1 }}>← BACK</button>
              {step < 3
                ? <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>NEXT →</button>
                : <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "REGISTERING..." : "REGISTER DRONE →"}</button>
              }
            </div>
          </div>

          {/* right — log */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <TransactionLog 
              entries={transactionLogs} 
              isLoading={isSubmitting}
              title="TRANSACTION LOG"
              maxHeight="420px"
            />
            <div className="card anim-up d3" style={{ padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", marginBottom: 12 }}>WHAT HAPPENS</div>
              {[
                { n: "①", t: "Create Hedera account with 10 HBAR" },
                { n: "②", t: "Register as HCS agent with manifest" },
                { n: "③", t: "Store on DroneRegistry contract" },
                { n: "④", t: "Finalize on-chain" },
              ].map(s => (
                <div key={s.n} style={{ display: "flex", gap: 9, marginBottom: 9 }}>
                  <span style={{ fontSize: 11, color: "var(--muted-fg)", flexShrink: 0 }}>{s.n}</span>
                  <span style={{ fontSize: 11, color: "var(--muted-fg)", lineHeight: 1.5 }}>{s.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
