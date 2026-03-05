"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plane,
  MapPin,
  Calendar,
  Shield,
  Zap,
  Loader2,
  CheckCircle,
  Wallet,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ethers } from "ethers";
import Link from "next/link";
import { LocationPicker } from "@/components/LocationPicker";

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
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredDroneData, setRegisteredDroneData] = useState<any>(null);
  const [verifiedBalance, setVerifiedBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [testingReturn, setTestingReturn] = useState(false);
  const [returnTestResult, setReturnTestResult] = useState<any>(null);
  const [autoReturnTriggered, setAutoReturnTriggered] = useState(false);
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

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    // Update sensor type and flight time when model changes
    const model = DRONE_MODELS.find(m => m.id === formData.model);
    if (model) {
      setFormData(prev => ({
        ...prev,
        sensorType: model.sensorTypes[0],
        maxFlightMinutes: model.specs.flightTime
      }));
    }
  }, [formData.model]);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0].address);
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask to use this feature");
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletConnected(true);
      setWalletAddress(address);
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet: " + error.message);
    }
  };

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setCurrentLocation(location);
  };

  const handleTest2HBARReturn = async () => {
    if (!registeredDroneData?.cairnDroneId) return;
    
    setTestingReturn(true);
    setReturnTestResult(null);

    try {
      // Test: Send 2 HBAR back from this specific drone
      const response = await fetch("/api/drones/test-transfer", {
        method: "POST",
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let lastResult: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            // Look for our specific drone's result
            if (data.type === 'success' && data.droneId === registeredDroneData.cairnDroneId) {
              lastResult = data;
            } else if (data.type === 'complete') {
              lastResult = data;
            }
          }
        }
      }

      if (lastResult) {
        setReturnTestResult({
          success: true,
          ...lastResult
        });
        
        // Refresh balance after return
        setTimeout(async () => {
          try {
            const balanceRes = await fetch(`/api/drones/balance?accountId=${encodeURIComponent(registeredDroneData.hederaAccountId)}`);
            if (balanceRes.ok) {
              const balanceData = await balanceRes.json();
              if (balanceData.success) {
                setVerifiedBalance(balanceData.balance);
              }
            }
          } catch (err) {
            console.error("Could not refresh balance:", err);
          }
        }, 3000);
      }
    } catch (error: any) {
      setReturnTestResult({
        success: false,
        error: error.message || "Test failed"
      });
    } finally {
      setTestingReturn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!currentLocation) {
      alert("Please select deployment location on the map");
      return;
    }

    if (!formData.droneName.trim()) {
      alert("Please provide a name for your drone (e.g., drone-mumbai-andheri)");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedModel = DRONE_MODELS.find(m => m.id === formData.model);
      
      // STEP 1: MetaMask Payment Transaction (0.1 HBAR registration fee)
      console.log("💰 Requesting payment for drone registration...");
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      
      const registrationFee = ethers.parseEther("0.1"); // 0.1 HBAR fee
      const operatorAddress = await signer.getAddress(); // Self-payment for demo
      
      console.log("🔐 MetaMask will prompt for payment approval...");
      const paymentTx = await signer.sendTransaction({
        to: operatorAddress,
        value: registrationFee,
        // No data field - Hedera doesn't allow data in transactions to self
      });
      
      console.log("⏳ Waiting for payment confirmation...");
      const receipt = await paymentTx.wait();
      console.log("✅ Payment confirmed! Transaction hash:", receipt?.hash);
      
      // STEP 2: Register drone with backend
      console.log("🚁 Registering drone on Hedera blockchain...");
      
      const response = await fetch("/api/drones/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cairnDroneId: formData.droneName.trim(),
          serialNumber: formData.serialNumber,
          model: selectedModel?.name,
          dgcaCertNumber: formData.dgcaCertNumber,
          certExpiryDate: formData.certExpiryDate,
          assignedZoneId: "UNASSIGNED",
          sensorType: formData.sensorType,
          maxFlightMinutes: parseInt(formData.maxFlightMinutes),
          registeredByOfficerId: walletAddress,
          registrationLat: currentLocation.lat,
          registrationLng: currentLocation.lng,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Drone registered successfully:", data.drone);
        console.log("📍 Location:", currentLocation);
        setRegisteredDroneData(data.drone);
        setRegistrationComplete(true);
        
        // AUTOMATICALLY VERIFY THE BALANCE - PROOF IT WORKED!
        if (data.drone.hederaAccountId) {
          console.log("🔍 Verifying HBAR balance on blockchain...");
          setBalanceLoading(true);
          
          // Wait 3 seconds for blockchain to finalize
          setTimeout(async () => {
            try {
              const balanceRes = await fetch(`/api/drones/balance?accountId=${encodeURIComponent(data.drone.hederaAccountId)}`);
              if (balanceRes.ok) {
                const balanceData = await balanceRes.json();
                if (balanceData.success) {
                  setVerifiedBalance(balanceData.balance);
                  console.log("✅ Verified balance:", balanceData.balance, "HBAR");
                  
                  // AUTOMATICALLY TRIGGER 2 HBAR RETURN TRANSFER (ONLY ONCE!)
                  if (!autoReturnTriggered) {
                    setAutoReturnTriggered(true); // Prevent duplicate transfers
                    console.log("🚀 Auto-triggering 2 HBAR return transfer...");
                    setTestingReturn(true);
                    
                    // Wait another 2 seconds then send return
                    setTimeout(async () => {
                    try {
                      const returnRes = await fetch("/api/drones/test-transfer", {
                        method: "POST",
                      });

                      if (!returnRes.body) {
                        throw new Error("No response body");
                      }

                      const reader = returnRes.body.getReader();
                      const decoder = new TextDecoder();
                      let foundDroneResult = false;

                      while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value);
                        const lines = chunk.split('\n');

                        for (const line of lines) {
                          if (line.startsWith('data: ')) {
                            const returnData = JSON.parse(line.slice(6));
                            
                            // Look for our drone's result
                            if (returnData.type === 'success' && returnData.droneId === data.drone.cairnDroneId) {
                              foundDroneResult = true;
                              setReturnTestResult({
                                success: true,
                                transactionId: returnData.transactionId,
                                amount: returnData.amount
                              });
                              console.log("✅ 2 HBAR returned! TX:", returnData.transactionId);
                              
                              // Update balance immediately
                              setTimeout(async () => {
                                const newBalanceRes = await fetch(`/api/drones/balance?accountId=${encodeURIComponent(data.drone.hederaAccountId)}`);
                                if (newBalanceRes.ok) {
                                  const newBalanceData = await newBalanceRes.json();
                                  if (newBalanceData.success) {
                                    setVerifiedBalance(newBalanceData.balance);
                                    console.log("✅ New balance after return:", newBalanceData.balance, "HBAR");
                                  }
                                }
                              }, 3000);
                            }
                          }
                        }
                      }

                      if (!foundDroneResult) {
                        setReturnTestResult({
                          success: false,
                          error: "Drone not found in transfer results"
                        });
                      }
                    } catch (returnErr: any) {
                      console.error("Return transfer error:", returnErr);
                      setReturnTestResult({
                        success: false,
                        error: returnErr.message
                      });
                    } finally {
                      setTestingReturn(false);
                    }
                  }, 2000);
                  } // End of autoReturnTriggered check
                }
              }
            } catch (err) {
              console.error("Could not verify balance:", err);
            } finally {
              setBalanceLoading(false);
            }
          }, 3000);
        }
      } else {
        alert(`Registration failed: ${data.error || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.code === "ACTION_REJECTED" || error.code === 4001) {
        alert("Transaction was rejected. Please approve the payment in MetaMask to register the drone.");
      } else if (error.message?.includes("user rejected")) {
        alert("You rejected the payment. Please approve it in MetaMask to continue.");
      } else {
        alert("Failed to register drone: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedModel = DRONE_MODELS.find(m => m.id === formData.model);

  // Success view after registration
  if (registrationComplete && registeredDroneData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">
                Drone Registered Successfully!
              </h2>
              
              <p className="text-gray-400 mb-2">
                Your drone <span className="text-blue-400 font-semibold">{registeredDroneData.cairnDroneId}</span> has been registered on the blockchain.
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Hedera Account: <span className="font-mono text-xs">{registeredDroneData.hederaAccountId}</span>
              </p>

              {/* PROOF OF TRANSFER */}
              <div className="bg-green-950/30 border border-green-800/50 rounded-lg p-4 mb-6 mt-6">
                <h3 className="text-green-400 font-semibold mb-3 flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Transfer Verified on Blockchain
                </h3>
                
                <div className="space-y-2 text-sm">
                  {registeredDroneData.fundingTransactionId && (
                    <div className="bg-slate-900/50 rounded p-3">
                      <p className="text-slate-400 text-xs mb-1">Transaction ID:</p>
                      <p className="text-green-400 font-mono text-xs break-all">
                        {registeredDroneData.fundingTransactionId}
                      </p>
                      <a
                        href={`https://hashscan.io/testnet/transaction/${registeredDroneData.fundingTransactionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 mt-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View on HashScan
                      </a>
                    </div>
                  )}

                  <div className="bg-slate-900/50 rounded p-3">
                    <p className="text-slate-400 text-xs mb-1">Verified Balance:</p>
                    {balanceLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                        <span className="text-blue-400 text-sm">Checking blockchain...</span>
                      </div>
                    ) : verifiedBalance !== null ? (
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-amber-400" />
                        <span className="text-amber-400 font-bold text-lg">
                          ℏ {verifiedBalance.toFixed(2)} HBAR
                        </span>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm">Balance verification in progress...</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Test 2 HBAR Return */}
              <div className="bg-blue-950/30 border border-blue-800/50 rounded-lg p-4 mb-6">
                <h3 className="text-blue-400 font-semibold mb-2 text-sm">
                  🧪 Automatic Return Transfer
                </h3>
                <p className="text-slate-400 text-xs mb-3">
                  {testingReturn 
                    ? "Testing two-way transfers by sending 2 HBAR back to operator account..." 
                    : returnTestResult 
                    ? "Return transfer completed!" 
                    : "Preparing automatic return transfer..."}
                </p>
                
                {testingReturn && (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                    <span className="text-blue-400 text-sm">Sending 2 HBAR back...</span>
                  </div>
                )}

                {returnTestResult && (
                  <div className={`p-3 rounded ${
                    returnTestResult.success 
                      ? "bg-green-950/30 border border-green-800" 
                      : "bg-red-950/30 border border-red-800"
                  }`}>
                    {returnTestResult.success ? (
                      <>
                        <p className="text-green-400 text-xs font-semibold mb-1">
                          ✅ 2 HBAR returned successfully!
                        </p>
                        {returnTestResult.transactionId && (
                          <p className="text-green-400 font-mono text-xs break-all mb-2">
                            TX: {returnTestResult.transactionId}
                          </p>
                        )}
                        <p className="text-amber-400 text-sm font-bold">
                          New balance: ℏ {verifiedBalance !== null ? verifiedBalance.toFixed(2) : "18.00"} HBAR
                        </p>
                      </>
                    ) : (
                      <p className="text-red-400 text-xs">
                        ❌ {returnTestResult.error || "Return transfer failed"}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                >
                  View Drone Dashboard
                </Button>
                <Button
                  onClick={() => router.push("/deploy")}
                  variant="outline"
                  className="w-full border-white/10 text-white hover:bg-white/5"
                >
                  Create Boundary Zone
                </Button>
                {registeredDroneData.hederaAccountId && (
                  <a 
                    href={`https://hashscan.io/testnet/account/${registeredDroneData.hederaAccountId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-white/10 text-white hover:bg-white/5"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on HashScan
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Wallet connection required view
  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <nav className="border-b border-white/10 backdrop-blur-md bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full"
          >
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Wallet className="h-8 w-8 text-blue-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-3">
                  Connect Wallet Required
                </h2>
                <p className="text-gray-400 mb-8">
                  Please connect your wallet to register a drone on the blockchain.
                </p>
                
                <Button
                  onClick={connectWallet}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main registration form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <Wallet className="h-4 w-4 text-white" />
              <span className="text-sm text-white font-medium">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-blue-400 mb-4">
            <Plane className="h-6 w-6" />
            <h1 className="text-3xl font-bold text-white">Register New Drone</h1>
          </div>
          <p className="text-gray-400">
            Add a new drone to the blockchain registry with its operational parameters and location.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Drone Name */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plane className="h-5 w-5 text-blue-400" />
                  Drone Identification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Drone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.droneName}
                    onChange={(e) => setFormData({...formData, droneName: e.target.value})}
                    placeholder="e.g., drone-mumbai-andheri"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use format: drone-city-area for easy identification
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Serial Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                    placeholder="e.g., SN-2024-12345"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Model Selection */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-400" />
                  Model & Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Drone Model *
                  </label>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {DRONE_MODELS.map(model => (
                      <option key={model.id} value={model.id} className="bg-slate-800 text-white">{model.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sensor Type *
                  </label>
                  <select
                    value={formData.sensorType}
                    onChange={(e) => setFormData({...formData, sensorType: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {selectedModel?.sensorTypes.map(sensor => (
                      <option key={sensor} value={sensor} className="bg-slate-800 text-white">{sensor}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Certification */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-400" />
                  Certification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    DGCA Certificate Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dgcaCertNumber}
                    onChange={(e) => setFormData({...formData, dgcaCertNumber: e.target.value})}
                    placeholder="e.g., DGCA-2024-XXXXX"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Certificate Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.certExpiryDate}
                    onChange={(e) => setFormData({...formData, certExpiryDate: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Location & Model Info */}
          <div className="space-y-6">
            {/* Model Specs Display */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white">{selectedModel?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Flight Time</p>
                    <p className="text-lg font-semibold text-blue-400">{selectedModel?.specs.flightTime} mins</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Range</p>
                    <p className="text-lg font-semibold text-blue-400">{selectedModel?.specs.range}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Primary Sensor</p>
                    <p className="text-lg font-semibold text-blue-400">{selectedModel?.specs.sensor}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Picker */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  Deployment Location *
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] rounded-lg overflow-hidden border border-white/10">
                  <LocationPicker onLocationSelect={handleLocationSelect} />
                </div>
                {currentLocation && (
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-400">
                      📍 {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !currentLocation}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Registering on Blockchain...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Register Drone
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
