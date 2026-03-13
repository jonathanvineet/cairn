"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plane, MapPin, Shield, CheckCircle, Loader2, ArrowLeft, Zap } from "lucide-react";
import { LocationPicker } from "@/components/LocationPicker";
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
  const [logs, setLogs] = useState<string[]>([]);

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

  const addLog = (msg: string) => setLogs(l => [...l, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !selectedAccount) { alert("Please connect your wallet first"); return; }
    if (!currentLocation) { alert("Please select deployment location on the map"); return; }
    if (!formData.droneName.trim()) { alert("Please provide a name for your drone"); return; }
    setIsSubmitting(true);
    setLogs([]);
    try {
      const selectedModel = DRONE_MODELS.find(m => m.id === formData.model);
      addLog("Creating drone account...");
      const createAccRes = await fetch("/api/drones/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createDroneAccount", cairnDroneId: formData.droneName.trim(), serialNumber: formData.serialNumber, model: selectedModel?.name, registrationLat: currentLocation.lat, registrationLng: currentLocation.lng }),
      });
      const createAccData = await createAccRes.json();
      if (!createAccRes.ok) throw new Error(createAccData.error || "Failed to create drone account");
      const { droneAccountId, evmAddress, encryptedPrivateKey, encryptedPublicKey } = createAccData;
      addLog(`✓ Account: ${droneAccountId}`);
      addLog("Waiting for HashPack approval...");
      let contractTransactionIdString = "";
      try {
        const { ContractExecuteTransaction, ContractFunctionParameters, ContractId, AccountId } = await import("@hiero-ledger/sdk");
        const droneTx = new ContractExecuteTransaction()
          .setContractId(ContractId.fromEvmAddress(0, 0, DRONE_REGISTRY_ADDRESS)).setGas(300000)
          .setFunction("registerDrone", new ContractFunctionParameters().addString(formData.droneName.trim()).addAddress(AccountId.fromString(droneAccountId).toEvmAddress()).addString("UNASSIGNED").addString(selectedModel?.name || "Unknown"));
        const contractResult = await signAndExecuteTransaction(droneTx);
        if (contractResult && contractResult.transactionId) { contractTransactionIdString = contractResult.transactionId.toString(); addLog("✓ Contract registered"); }
        else throw new Error("Contract registration failed");
      } catch (contractErr: any) { throw new Error(`Contract failed: ${contractErr.message}`); }
      addLog("Finalizing registration...");
      const finalizeRes = await fetch("/api/drones/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "completeRegistration", droneAccountId, evmAddress, encryptedPrivateKey, encryptedPublicKey, cairnDroneId: formData.droneName.trim(), serialNumber: formData.serialNumber, model: selectedModel?.name, dgcaCertNumber: formData.dgcaCertNumber, certExpiryDate: formData.certExpiryDate, assignedZoneId: "UNASSIGNED", sensorType: formData.sensorType, maxFlightMinutes: parseInt(formData.maxFlightMinutes), registeredByOfficerId: selectedAccount.id, userWalletAddress: selectedAccount.id, registrationLat: currentLocation.lat, registrationLng: currentLocation.lng, contractTransactionId: contractTransactionIdString }),
      });
      const finalizeData = await finalizeRes.json();
      if (!finalizeRes.ok) throw new Error(finalizeData.error || "Failed to finalize");
      addLog("✓ Registration complete!");
      setRegisteredDroneData(finalizeData.drone);
      setRegistrationComplete(true);
    } catch (error: any) { console.error("❌ Error:", error); alert(error.message || "Failed to register drone"); }
    finally { setIsSubmitting(false); }
  };

  const selectedModel = DRONE_MODELS.find(m => m.id === formData.model);

  // ── SUCCESS SCREEN ──
  if (registrationComplete && registeredDroneData) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} className="grid-bg scanlines">
        <div className="card card-offset anim-scale" style={{ maxWidth: 520, width: "100%", padding: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid var(--fg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 22, fontWeight: 700 }}>✓</div>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.01em", marginBottom: 5 }}>Drone registered.</div>
            <div style={{ fontSize: 12, color: "var(--muted-fg)" }}>{registeredDroneData.cairnDroneId} is now live on Hedera Testnet</div>
          </div>
          {[
            { l: "HEDERA ACCOUNT", v: registeredDroneData.hederaAccountId },
            { l: "MODEL",          v: registeredDroneData.model },
          ].map(r => (
            <div key={r.l} style={{ marginBottom: 10 }}>
              <div className="lbl">{r.l}</div>
              <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "8px 12px", fontSize: 11, color: "var(--muted-fg)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{r.v}</span>
                <button onClick={() => navigator.clipboard.writeText(r.v)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-fg)", fontSize: 13, marginLeft: 8 }}>⎘</button>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <Link href="/dashboard" style={{ flex: 1 }}><button className="btn btn-ghost" style={{ width: "100%" }}>DASHBOARD</button></Link>
            <Link href="/deploy" style={{ flex: 1 }}><button className="btn btn-primary" style={{ width: "100%" }}>DEPLOY →</button></Link>
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
                <div style={{ height: 280, border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: 12 }}>
                  <LocationPicker onLocationSelect={handleLocationSelect} />
                </div>
                {currentLocation && (
                  <div style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 11, color: "var(--muted-fg)", background: "var(--muted)" }}>
                    📍 {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </div>
                )}
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
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button className="btn btn-ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ opacity: step === 0 ? .3 : 1 }}>← BACK</button>
              {step < 3
                ? <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>NEXT →</button>
                : <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "REGISTERING..." : "REGISTER DRONE →"}</button>
              }
            </div>
          </div>

          {/* right — log */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card anim-up d2" style={{ padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", marginBottom: 12 }}>TRANSACTION LOG</div>
              <div style={{ minHeight: 170, fontSize: 11, color: "var(--muted-fg)", lineHeight: 1.9 }}>
                {logs.length === 0
                  ? <span style={{ color: "var(--border)" }}>// awaiting submission...</span>
                  : logs.map((l, i) => (
                    <div key={i} className="anim-left" style={{ animationDelay: `${i * 40}ms`, color: l.includes("✓") ? "var(--fg)" : "var(--muted-fg)", fontWeight: l.includes("✓") ? 700 : 400 }}>{l}</div>
                  ))
                }
                {isSubmitting && <div style={{ display: "flex", gap: 4, marginTop: 4 }}><span className="think-dot" /><span className="think-dot" /><span className="think-dot" /></div>}
              </div>
            </div>
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
