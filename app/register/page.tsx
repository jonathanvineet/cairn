"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plane,
  MapPin,
  Shield,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Calendar,
  Hash,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationPicker } from "@/components/LocationPicker";
import { useWalletStore } from "@/stores/walletStore";
import { useHederaWallet } from "@/lib/useHederaWallet";
import { DRONE_REGISTRY_ADDRESS } from "@/lib/contracts";
import Link from "next/link";

const DRONE_MODELS = [
  {
    id: "dji-m30t",
    name: "DJI Matrice 30T",
    specs: {
      flightTime: "41",
      range: "15 km",
      sensor: "RGB + Thermal",
    },
    sensorTypes: ["RGB + Thermal", "Optical Zoom", "Laser Rangefinder"]
  },
  {
    id: "dji-mavic-3e",
    name: "DJI Mavic 3 Enterprise",
    specs: {
      flightTime: "45",
      range: "15 km",
      sensor: "4/3 CMOS Wide",
    },
    sensorTypes: ["High-Res RGB", "Multispectral", "RTK Mapping"]
  },
  {
    id: "autel-evo-2",
    name: "Autel Evo II Dual 640T",
    specs: {
      flightTime: "38",
      range: "9 km",
      sensor: "8K + Thermal",
    },
    sensorTypes: ["8K Optical", "Radiometric Thermal", "Night Vision"]
  },
  {
    id: "skydio-x10",
    name: "Skydio X10",
    specs: {
      flightTime: "35",
      range: "12 km",
      sensor: "AI Autonomy",
    },
    sensorTypes: ["AI Navigation", "4K Wide", "Night Ops"]
  }
];

export default function RegisterDronePage() {
  const router = useRouter();
  const { connected, selectedAccount } = useWalletStore();
  const { signAndExecuteTransaction } = useHederaWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredDroneData, setRegisteredDroneData] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
  
  const [formData, setFormData] = useState({
    droneName: "",
    model: "dji-m30t",
    serialNumber: "",
    dgcaCertNumber: "",
    certExpiryDate: "",
    sensorType: "RGB + Thermal",
    maxFlightMinutes: "41",
  });
  
  // Wallet protection
  useEffect(() => {
    if (!connected) {
      alert("Please connect your HashPack wallet first");
      router.push("/");
    }
  }, [connected, router]);

  useEffect(() => {
    const model = DRONE_MODELS.find(m => m.id === formData.model);
    if (model) {
      setFormData(prev => ({
        ...prev,
        sensorType: model.sensorTypes[0],
        maxFlightMinutes: model.specs.flightTime
      }));
    }
  }, [formData.model]);

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setCurrentLocation(location);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected || !selectedAccount) {
      alert("Please connect your wallet first");
      return;
    }

    if (!currentLocation) {
      alert("Please select deployment location on the map");
      return;
    }

    if (!formData.droneName.trim()) {
      alert("Please provide a name for your drone");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedModel = DRONE_MODELS.find(m => m.id === formData.model);

      // Create drone account
      console.log("🚁 Creating drone account...");
      
      const createAccRes = await fetch("/api/drones/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createDroneAccount",
          cairnDroneId: formData.droneName.trim(),
          serialNumber: formData.serialNumber,
          model: selectedModel?.name,
          registrationLat: currentLocation.lat,
          registrationLng: currentLocation.lng,
        }),
      });

      const createAccData = await createAccRes.json();
      if (!createAccRes.ok) throw new Error(createAccData.error || "Failed to create drone account");

      const { droneAccountId, evmAddress, encryptedPrivateKey, encryptedPublicKey } = createAccData;
      console.log(`✅ Drone account: ${droneAccountId}`);

      // Contract registration
      console.log("⛓️ Please approve in HashPack...");
      
      let contractTransactionIdString = "";
      try {
        const { ContractExecuteTransaction, ContractFunctionParameters, ContractId, AccountId } = 
          await import("@hiero-ledger/sdk");
        
        const droneTx = new ContractExecuteTransaction()
          .setContractId(ContractId.fromEvmAddress(0, 0, DRONE_REGISTRY_ADDRESS))
          .setGas(300000)
          .setFunction(
            "registerDrone",
            new ContractFunctionParameters()
              .addString(formData.droneName.trim())
              .addAddress(AccountId.fromString(droneAccountId).toEvmAddress())
              .addString("UNASSIGNED")
              .addString(selectedModel?.name || "Unknown")
          );
        
        const contractResult = await signAndExecuteTransaction(droneTx);
        
        if (contractResult && contractResult.transactionId) {
          contractTransactionIdString = contractResult.transactionId.toString();
          console.log("✅ Contract TX:", contractTransactionIdString);
        } else {
          throw new Error("Contract registration failed");
        }
      } catch (contractErr: any) {
        console.error("Contract error:", contractErr);
        throw new Error(`Contract failed: ${contractErr.message}`);
      }

      // Finalize registration
      console.log("📝 Finalizing...");

      const finalizeRes = await fetch("/api/drones/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "completeRegistration",
          droneAccountId,
          evmAddress,
          encryptedPrivateKey,
          encryptedPublicKey,
          cairnDroneId: formData.droneName.trim(),
          serialNumber: formData.serialNumber,
          model: selectedModel?.name,
          dgcaCertNumber: formData.dgcaCertNumber,
          certExpiryDate: formData.certExpiryDate,
          assignedZoneId: "UNASSIGNED",
          sensorType: formData.sensorType,
          maxFlightMinutes: parseInt(formData.maxFlightMinutes),
          registeredByOfficerId: selectedAccount.id,
          userWalletAddress: selectedAccount.id,
          registrationLat: currentLocation.lat,
          registrationLng: currentLocation.lng,
          contractTransactionId: contractTransactionIdString
        }),
      });

      const finalizeData = await finalizeRes.json();
      if (!finalizeRes.ok) throw new Error(finalizeData.error || "Failed to finalize");

      console.log("✅ Complete!", finalizeData.drone);
      setRegisteredDroneData(finalizeData.drone);
      setRegistrationComplete(true);

    } catch (error: any) {
      console.error("❌ Error:", error);
      alert(error.message || "Failed to register drone");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedModel = DRONE_MODELS.find(m => m.id === formData.model);

  // Success screen
  if (registrationComplete && registeredDroneData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1e3a] to-[#0a1628] flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 backdrop-blur-xl border border-green-500/30 rounded-3xl p-12 text-center shadow-2xl">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50">
              <CheckCircle className="h-14 w-14 text-white" />
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-4">
              Registration Complete!
            </h2>
            
            <p className="text-gray-300 text-lg mb-8">
              <span className="text-green-400 font-bold">{registeredDroneData.cairnDroneId}</span> is now on the blockchain
            </p>
            
            <div className="bg-black/30 rounded-xl p-6 mb-8 text-left">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Hedera Account</p>
                  <p className="text-white font-mono">{registeredDroneData.hederaAccountId}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Model</p>
                  <p className="text-white">{registeredDroneData.model}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link href="/deploy">
                <Button className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500">
                  Deploy to Zone
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="border-white/30">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1e3a] to-[#0a1628]">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Plane className="h-6 w-6 text-green-400" />
              <h1 className="text-xl font-bold text-white">Register New Drone</h1>
            </div>
          </div>
          <p className="text-sm text-gray-400">Connected: {selectedAccount?.id.substring(0, 12)}...</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 gap-6 mt-6">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Drone Info */}
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Drone Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Drone Name *</label>
                <input
                  type="text"
                  value={formData.droneName}
                  onChange={(e) => setFormData({...formData, droneName: e.target.value})}
                  placeholder="e.g., drone-mumbai-01"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Serial Number *</label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                  placeholder="SN-2024-12345"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">DGCA Certificate</label>
                <input
                  type="text"
                  value={formData.dgcaCertNumber}
                  onChange={(e) => setFormData({...formData, dgcaCertNumber: e.target.value})}
                  placeholder="DGCA-12345"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={formData.certExpiryDate}
                  onChange={(e) => setFormData({...formData, certExpiryDate: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Model Selection */}
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="h-6 w-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Model & Specs</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Drone Model</label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                >
                  {DRONE_MODELS.map(model => (
                    <option key={model.id} value={model.id} className="bg-[#0f1e3a]">
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedModel && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-purple-500/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Flight Time</p>
                    <p className="text-lg font-bold text-purple-400">{selectedModel.specs.flightTime}m</p>
                  </div>
                  <div className="bg-cyan-500/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Range</p>
                    <p className="text-lg font-bold text-cyan-400">{selectedModel.specs.range}</p>
                  </div>
                  <div className="bg-green-500/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Sensor</p>
                    <p className="text-xs font-bold text-green-400">{selectedModel.specs.sensor}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Map & Submit */}
        <div className="space-y-6">
          {/* Map */}
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="h-6 w-6 text-green-400" />
              <h2 className="text-xl font-bold text-white">Deployment Location</h2>
            </div>

            <div className="h-80 rounded-lg overflow-hidden border border-white/10">
              <LocationPicker onLocationSelect={handleLocationSelect} />
            </div>

            {currentLocation && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-xs text-green-400">
                  📍 {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !currentLocation || !formData.droneName || !formData.serialNumber}
            className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Registering...</>
            ) : (
              <><Shield className="mr-2 h-5 w-5" /> Register Drone</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
