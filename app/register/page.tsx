"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Shield,
    Cpu,
    Zap,
    CheckCircle2,
    Lock,
    MapPin,
    Calendar,
    Scan,
    BarChart3,
    Loader2,
    ArrowRight,
    ExternalLink,
    Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";
import { useWalletStore } from "@/stores/walletStore";
import {
    ContractExecuteTransaction,
    ContractFunctionParameters,
    ContractId,
    AccountId
} from "@hiero-ledger/sdk";
import {
    BOUNDARY_ZONE_REGISTRY_ADDRESS,
    DRONE_REGISTRY_ADDRESS
} from "@/lib/contracts";
import dynamic from "next/dynamic";

// Dynamically import 3D selector (client-only, no SSR)
const DroneSelector3D = dynamic(
    () => import("@/components/DroneSelector3D").then((mod) => mod.DroneSelector3D),
    { 
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-green-400" />
            </div>
        )
    }
);

const DRONE_MODELS = [
    {
        id: "dji-m30t",
        name: "DJI Matrice 30T",
        image: "/drones/dji-matrice-30t.png",
        accentColor: "green",
        specs: {
            flightTime: "41 mins",
            range: "15 km",
            sensor: "RGB + Thermal",
            protection: "IP55 rated"
        },
        sensorTypes: ["RGB + Thermal", "Optical Zoom", "Laser Rangefinder"]
    },
    {
        id: "dji-mavic-3e",
        name: "DJI Mavic 3 Enterprise",
        image: "/drones/dji-mavic-3e.png",
        accentColor: "blue",
        specs: {
            flightTime: "45 mins",
            range: "15 km",
            sensor: "4/3 CMO Wide",
            protection: "Ultra Portable"
        },
        sensorTypes: ["High-Res RGB", "Multispectral", "RTK Mapping"]
    },
    {
        id: "autel-evo-2",
        name: "Autel Evo II Dual 640T",
        image: "/drones/autel-evo-2.png",
        accentColor: "orange",
        specs: {
            flightTime: "38 mins",
            range: "9 km",
            sensor: "8K + Thermal",
            protection: "Wind resistant"
        },
        sensorTypes: ["8K Optical", "Radiometric Thermal", "Night Vision"]
    },
    {
        id: "skydio-x10",
        name: "Skydio X10",
        image: "/drones/skydio-x10.png",
        accentColor: "purple",
        specs: {
            flightTime: "35 mins",
            range: "12 km",
            sensor: "AI Autonomy",
            protection: "Obstacle Avoid"
        },
        sensorTypes: ["AI Navigation", "4K Wide", "Night Ops"]
    }
];

const ACCENT_CLASSES: Record<string, { badge: string; glow: string; stat: string }> = {
    green:  { badge: "bg-green-500/20 text-green-400 border-green-500/30",  glow: "shadow-green-500/30",  stat: "text-green-400" },
    blue:   { badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",    glow: "shadow-blue-500/30",   stat: "text-blue-400" },
    orange: { badge: "bg-orange-500/20 text-orange-400 border-orange-500/30", glow: "shadow-orange-500/30", stat: "text-orange-400" },
    purple: { badge: "bg-purple-500/20 text-purple-400 border-purple-500/30", glow: "shadow-purple-500/30", stat: "text-purple-400" },
};

const ZONES = [
    { id: "Wayanad-11", name: "Wayanad WY-11" },
    { id: "Nilgiris-04", name: "Nilgiris NG-04" },
    { id: "Coorg-07", name: "Coorg CG-07" },
    { id: "Anamalai-02", name: "Anamalai AN-02" }
];


export default function RegisterDronePage() {
    const { connected, selectedAccount, connect } = useWalletStore();
    const [currentModelIndex, setCurrentModelIndex] = useState(0);
    const [formData, setFormData] = useState({
        serialNumber: "",
        dgcaCertNumber: "",
        certExpiryDate: "",
        assignedZoneId: ZONES[0].id,
        sensorType: "",
        maxFlightMinutes: "35",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registrationStep, setRegistrationStep] = useState(0);
    const [processingStatus, setProcessingStatus] = useState<string[]>([]);
    const [registeredDrone, setRegisteredDrone] = useState<any>(null);

    const currentModel = DRONE_MODELS[currentModelIndex];
    const accent = ACCENT_CLASSES[currentModel.accentColor];

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            sensorType: currentModel.sensorTypes[0]
        }));
    }, [currentModel]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!connected) {
            alert("Please connect your Hedera wallet first.");
            return;
        }

        setIsSubmitting(true);
        setRegistrationStep(1);
        setProcessingStatus([]);

        try {
            setProcessingStatus(prev => [...prev, "Initializing drone agent in backend..."]);
            const response = await fetch("/api/drones/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    model: currentModel.name,
                    registeredByOfficerId: selectedAccount?.id || "OFFICER-001"
                }),
            });

            // Check if response is JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("Non-JSON response received:", text);
                throw new Error("Server returned an error. Check browser console for details.");
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || "Backend registration failed");
            }

            const droneData = result.drone;
            setRegisteredDrone(droneData);

            const { walletType } = useWalletStore.getState();

            if (walletType === "META_MASK") {
                setProcessingStatus(prev => [...prev, "Initializing EVM provider..."]);
                const { BrowserProvider, Contract } = await import("ethers");
                const provider = new BrowserProvider((window as any).ethereum);
                const signer = await provider.getSigner();

                setProcessingStatus(prev => [...prev, "Authorizing zone access (Sign in MetaMask)..."]);
                const zoneContract = new Contract(
                    BOUNDARY_ZONE_REGISTRY_ADDRESS,
                    ["function registerDrone(address _droneAccount, string _zoneId) public returns (bool)"],
                    signer
                );
                const tx1 = await zoneContract.registerDrone(droneData.evmAddress, droneData.assignedZoneId);
                await tx1.wait();

                setProcessingStatus(prev => [...prev, "Finalizing on-chain record (Sign in MetaMask)..."]);
                const droneContract = new Contract(
                    DRONE_REGISTRY_ADDRESS,
                    ["function registerDrone(string _cairnId, address _accountId, string _zoneId, string _model) public returns (bool)"],
                    signer
                );
                const tx2 = await droneContract.registerDrone(
                    droneData.cairnDroneId,
                    droneData.evmAddress,
                    droneData.assignedZoneId,
                    droneData.model
                );
                await tx2.wait();

            } else {
                setProcessingStatus(prev => [...prev, "Authenticating with Hedera network..."]);

                const { getConnector } = await import("@/lib/hedera-connector");
                const dapp = getConnector();
                if (!dapp) throw new Error("Wallet connector not found");

                const zoneTx = new ContractExecuteTransaction()
                    .setContractId(ContractId.fromEvmAddress(0, 0, BOUNDARY_ZONE_REGISTRY_ADDRESS))
                    .setGas(250000)
                    .setFunction(
                        "registerDrone",
                        new ContractFunctionParameters()
                            .addAddress(AccountId.fromString(droneData.hederaAccountId).toEvmAddress())
                            .addString(droneData.assignedZoneId)
                    );

                setProcessingStatus(prev => [...prev, "Authorizing zone access (Sign in HashPack)..."]);
                await (dapp as any).executeTransaction(zoneTx);

                const droneTx = new ContractExecuteTransaction()
                    .setContractId(ContractId.fromEvmAddress(0, 0, DRONE_REGISTRY_ADDRESS))
                    .setGas(300000)
                    .setFunction(
                        "registerDrone",
                        new ContractFunctionParameters()
                            .addString(droneData.cairnDroneId)
                            .addAddress(AccountId.fromString(droneData.hederaAccountId).toEvmAddress())
                            .addString(droneData.assignedZoneId)
                            .addString(droneData.model)
                    );

                setProcessingStatus(prev => [...prev, "Finalizing on-chain record (Sign in HashPack)..."]);
                await (dapp as any).executeTransaction(droneTx);
            }

            setProcessingStatus(prev => [...prev, "Registration complete!"]);
            setRegistrationStep(2);

        } catch (error: any) {
            console.error("Registration flow error:", error);
            alert("Registration failed: " + (error.message || "Unknown error"));
            setRegistrationStep(0);
            setProcessingStatus([]);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020d06] text-white topo-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto relative z-10">
                <header className="mb-12 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-2 glass rounded-lg group-hover:glow-green transition-all">
                            <ChevronLeft className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-gray-400 group-hover:text-white transition-colors">Back to Terminal</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Badge variant="blockchain" className="hidden md:flex gap-1.5 glass bg-green-500/10 border-green-500/30">
                            <Shield className="h-3 w-3 text-green-400" />
                            Officer Terminal
                        </Badge>
                        <WalletConnect />
                        <Badge variant="outline" className="hidden sm:flex glass">
                            Hedera Testnet
                        </Badge>
                    </div>
                </header>

                {registrationStep === 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* LEFT SIDE: FORM — unchanged */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                                    Register <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">New Drone Agent</span>
                                </h1>
                                <p className="mt-4 text-gray-400 text-lg">
                                    Initialize a new autonomous unit into the BoundaryTruth evidence network.
                                    This will create a dedicated Hedera wallet for the drone.
                                </p>
                            </div>

                            <Card className="glass-strong border-white/10 overflow-hidden relative z-1">
                                <CardContent className="p-8">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                    <Scan className="h-4 w-4 text-green-400" />
                                                    Serial Number
                                                </label>
                                                <input
                                                    required
                                                    name="serialNumber"
                                                    value={formData.serialNumber}
                                                    onChange={handleInputChange}
                                                    placeholder="DJI-M30T-SN-..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-gray-600"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-green-400" />
                                                    DGCA Certificate
                                                </label>
                                                <input
                                                    required
                                                    name="dgcaCertNumber"
                                                    value={formData.dgcaCertNumber}
                                                    onChange={handleInputChange}
                                                    placeholder="DGCA-UAS-..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-gray-600"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-green-400" />
                                                    Certificate Expiry
                                                </label>
                                                <input
                                                    required
                                                    type="date"
                                                    name="certExpiryDate"
                                                    value={formData.certExpiryDate}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-gray-300"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-green-400" />
                                                    Assigned Zone
                                                </label>
                                                <select
                                                    name="assignedZoneId"
                                                    value={formData.assignedZoneId}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-gray-300 appearance-none"
                                                >
                                                    {ZONES.map(zone => (
                                                        <option key={zone.id} value={zone.id} className="bg-[#0d1f12]">
                                                            {zone.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                    <Cpu className="h-4 w-4 text-green-400" />
                                                    Sensor Type
                                                </label>
                                                <select
                                                    name="sensorType"
                                                    value={formData.sensorType}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-gray-300 appearance-none"
                                                >
                                                    {currentModel.sensorTypes.map(type => (
                                                        <option key={type} value={type} className="bg-[#0d1f12]">
                                                            {type}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                    <Zap className="h-4 w-4 text-green-400" />
                                                    Max Flight Time (min)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="maxFlightMinutes"
                                                    value={formData.maxFlightMinutes}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-gray-300"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-8 text-xl font-bold glow-green-strong hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 mt-4"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-6 w-6 animate-spin" />
                                                    Registering...
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="h-6 w-6" />
                                                    Register Drone
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* RIGHT SIDE: 3D DRONE CHARACTER SELECTOR */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex flex-col gap-6"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Select Unit</p>
                                    <AnimatePresence mode="wait">
                                        <motion.h2
                                            key={currentModel.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.25 }}
                                            className="text-2xl font-bold text-white"
                                        >
                                            {currentModel.name}
                                        </motion.h2>
                                    </AnimatePresence>
                                </div>
                                <Badge className={`${accent.badge} px-3 py-1 text-xs font-bold`}>
                                    READY TO DEPLOY
                                </Badge>
                            </div>

                            {/* 3D Viewer Panel */}
                            <div
                                className="relative glass-strong rounded-3xl border border-white/10 overflow-hidden"
                                style={{ height: 320 }}
                            >
                                {/* Subtle scanline overlay for sci-fi feel */}
                                <div
                                    className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
                                    style={{
                                        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)",
                                    }}
                                />

                                {/* Corner decorations */}
                                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-green-500/40 z-10" />
                                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-green-500/40 z-10" />
                                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-green-500/40 z-10" />
                                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-green-500/40 z-10" />

                                {/* Select model label */}
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                                    <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                                        — SELECT MODEL —
                                    </span>
                                </div>

                                <DroneSelector3D
                                    selectedIndex={currentModelIndex}
                                    onSelect={setCurrentModelIndex}
                                />
                            </div>

                            {/* Specs Grid */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentModel.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <div className="glass p-5 rounded-2xl flex items-center gap-4 border-white/5">
                                        <div className="p-3 bg-blue-500/10 rounded-xl">
                                            <Zap className="h-6 w-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">FLIGHT TIME</p>
                                            <p className="font-bold text-lg">{currentModel.specs.flightTime}</p>
                                        </div>
                                    </div>
                                    <div className="glass p-5 rounded-2xl flex items-center gap-4 border-white/5">
                                        <div className="p-3 bg-purple-500/10 rounded-xl">
                                            <Scan className="h-6 w-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">RANGE</p>
                                            <p className="font-bold text-lg">{currentModel.specs.range}</p>
                                        </div>
                                    </div>
                                    <div className="glass p-5 rounded-2xl flex items-center gap-4 border-white/5">
                                        <div className="p-3 bg-orange-500/10 rounded-xl">
                                            <Cpu className="h-6 w-6 text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">SENSOR</p>
                                            <p className="font-bold text-sm leading-tight">{currentModel.specs.sensor}</p>
                                        </div>
                                    </div>
                                    <div className="glass p-5 rounded-2xl flex items-center gap-4 border-white/5">
                                        <div className="p-3 bg-green-500/10 rounded-xl">
                                            <Shield className="h-6 w-6 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">STATUS</p>
                                            <p className="font-bold text-green-400">READY</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}

                {/* Processing and Success steps — unchanged */}
                {registrationStep === 1 && (
                    <div className="max-w-2xl mx-auto py-12">
                        <h2 className="text-3xl font-bold text-center mb-8">Processing Registration</h2>
                        <Card className="glass-strong border-white/10 overflow-hidden relative z-1 p-8">
                            <div className="space-y-6">
                                {processingStatus.map((status, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-4"
                                    >
                                        {i === processingStatus.length - 1 && isSubmitting ? (
                                            <Loader2 className="h-5 w-5 text-green-400 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                                        )}
                                        <span className={i === processingStatus.length - 1 ? "text-white font-medium" : "text-gray-400"}>
                                            {status}
                                        </span>
                                    </motion.div>
                                ))}
                                <div className="pt-6">
                                    <Progress value={(processingStatus.length / 5) * 100} className="h-2 bg-white/5" />
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {registrationStep === 2 && registeredDrone && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-4xl mx-auto space-y-8"
                    >
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center p-4 bg-green-500/20 rounded-full mb-4">
                                <CheckCircle2 className="h-12 w-12 text-green-400" />
                            </div>
                            <h2 className="text-4xl font-extrabold">DRONE REGISTERED ✓</h2>
                            <p className="text-gray-400 text-xl">
                                Unit <span className="text-green-400 font-bold">{registeredDrone.cairnDroneId}</span> is now active on the BoundaryTruth network.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="glass p-6 text-center border-white/5 relative z-1">
                                <p className="text-xs text-gray-500 mb-1">HEDERA WALLET</p>
                                <p className="font-mono text-lg text-green-400">{registeredDrone.hederaAccountId}</p>
                                <div className="flex justify-center mt-3">
                                    <Badge variant="outline" className="text-[10px] glass">NETWORK ADDRESS</Badge>
                                </div>
                            </Card>
                            <Card className="glass p-6 text-center border-white/5 relative z-1">
                                <p className="text-xs text-gray-500 mb-1">INITIAL FUNDING</p>
                                <p className="font-bold text-2xl">{registeredDrone.initialBalance}</p>
                                <div className="flex justify-center mt-3">
                                    <Badge variant="outline" className="text-[10px] glass">FOR HCS FEES</Badge>
                                </div>
                            </Card>
                            <Card className="glass p-6 text-center border-white/5 relative z-1">
                                <p className="text-xs text-gray-500 mb-1">CREDENTIAL NFT</p>
                                <p className="font-bold text-2xl">#{registeredDrone.nftSerialNumber}</p>
                                <div className="flex justify-center mt-3">
                                    <Badge variant="outline" className="text-[10px] glass">IMMUTABLE IDENTITY</Badge>
                                </div>
                            </Card>
                        </div>

                        <Card className="glass-strong border-white/10 p-8 relative z-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Scan className="h-5 w-5 text-green-400" />
                                        Technical Passport
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-gray-500">Drone Model</span>
                                            <span className="font-medium">{registeredDrone.model}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-gray-500">Serial Number</span>
                                            <span className="font-medium">{registeredDrone.serialNumber}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-gray-500">Assigned Zone</span>
                                            <span className="font-medium">{registeredDrone.assignedZoneId}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-gray-500">Status</span>
                                            <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20">ACTIVE</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-green-400" />
                                        On-Chain Security
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="p-3 bg-white/5 rounded-lg space-y-1">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">EVM ADDRESS</p>
                                            <p className="text-xs font-mono break-all text-gray-300">{registeredDrone.evmAddress}</p>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-lg space-y-1">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">PUBLIC KEY (ECDSA)</p>
                                            <p className="text-xs font-mono break-all text-gray-300 truncate">{registeredDrone.hederaPublicKey}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 p-3 rounded-lg border border-amber-400/20">
                                            <Shield className="h-4 w-4 flex-shrink-0" />
                                            <span>Private key generated and stored in secure backend HSM. Never exposed to browser.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex flex-wrap gap-4">
                                <Link href={`https://hashscan.io/testnet/account/${registeredDrone.hederaAccountId}`} target="_blank" className="flex-1">
                                    <Button variant="outline" className="w-full gap-2 py-6 glass hover:bg-white/5 transition-all">
                                        <ExternalLink className="h-4 w-4" />
                                        View on Mirror Node
                                    </Button>
                                </Link>
                                <Link href={`/dashboard?drone=${registeredDrone.cairnDroneId}`} className="flex-1">
                                    <Button className="w-full gap-2 py-6 glow-green-strong">
                                        <BarChart3 className="h-4 w-4" />
                                        View Drone Profile
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </div>

            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-green-900/10 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-green-900/10 blur-[120px] rounded-full" />
            </div>
        </div>
    );
}