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

const DRONE_MODELS = [
    {
        id: "dji-m30t",
        name: "DJI Matrice 30T",
        image: "/drones/dji-matrice-30t.png",
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
        specs: {
            flightTime: "38 mins",
            range: "9 km",
            sensor: "8K + Thermal",
            protection: "Wind resistant"
        },
        sensorTypes: ["8K Optical", "Radiometric Thermal", "Night Vision"]
    }
];

const ZONES = [
    { id: "Wayanad-11", name: "Wayanad WY-11" },
    { id: "Nilgiris-04", name: "Nilgiris NG-04" },
    { id: "Coorg-07", name: "Coorg CG-07" },
    { id: "Anamalai-02", name: "Anamalai AN-02" }
];

export default function RegisterDronePage() {
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
    const [registrationStep, setRegistrationStep] = useState(0); // 0: input, 1: processing, 2: success
    const [processingStatus, setProcessingStatus] = useState<string[]>([]);
    const [registeredDrone, setRegisteredDrone] = useState<any>(null);

    const currentModel = DRONE_MODELS[currentModelIndex];

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            sensorType: currentModel.sensorTypes[0]
        }));
    }, [currentModel]);

    const nextModel = () => {
        setCurrentModelIndex((prev) => (prev + 1) % DRONE_MODELS.length);
    };

    const prevModel = () => {
        setCurrentModelIndex((prev) => (prev - 1 + DRONE_MODELS.length) % DRONE_MODELS.length);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setRegistrationStep(1);

        // Simulated processing steps
        const steps = [
            "Generating secure keypair...",
            "Creating Hedera account...",
            "Funding drone wallet (20 HBAR)...",
            "Minting DroneCredential NFT...",
            "Updating BoundaryZoneRegistry smart contract..."
        ];

        for (let i = 0; i < steps.length; i++) {
            setProcessingStatus(prev => [...prev, steps[i]]);
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));
        }

        try {
            const response = await fetch("/api/drones/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    model: currentModel.name,
                    registeredByOfficerId: "OFFICER-001" // Mock officer ID
                }),
            });

            const result = await response.json();
            if (result.success) {
                setRegisteredDrone(result.drone);
                setRegistrationStep(2);
            } else {
                alert("Registration failed: " + result.error);
                setRegistrationStep(0);
                setProcessingStatus([]);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred during registration");
            setRegistrationStep(0);
            setProcessingStatus([]);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020d06] text-white topo-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-2 glass rounded-lg group-hover:glow-green transition-all">
                            <ChevronLeft className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-gray-400 group-hover:text-white transition-colors">Back to Terminal</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Badge variant="blockchain" className="gap-1.5 glass bg-green-500/10 border-green-500/30">
                            <Shield className="h-3 w-3 text-green-400" />
                            Officer ID: OFFICER-001
                        </Badge>
                        <Badge variant="outline" className="glass">
                            Hedera Testnet
                        </Badge>
                    </div>
                </header>

                {registrationStep === 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* LEFT SIDE: FORM */}
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

                        {/* RIGHT SIDE: MODEL SELECTOR */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex flex-col gap-8"
                        >
                            <div className="relative glass-strong rounded-3xl p-8 border-white/10 overflow-hidden aspect-[4/3] flex items-center justify-center group">
                                <div className="absolute top-4 left-4 z-10">
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
                                        SELECTED MODEL
                                    </Badge>
                                </div>

                                {/* Model Navigation */}
                                <button
                                    onClick={prevModel}
                                    className="absolute left-4 z-20 p-3 glass rounded-full hover:glow-green transition-all"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={nextModel}
                                    className="absolute right-4 z-20 p-3 glass rounded-full hover:glow-green transition-all"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentModel.id}
                                        initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
                                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="relative w-full h-full flex items-center justify-center p-8"
                                    >
                                        <img
                                            src={currentModel.image}
                                            alt={currentModel.name}
                                            className="max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(34,197,94,0.3)] group-hover:drop-shadow-[0_25px_60px_rgba(34,197,94,0.5)] transition-all duration-500"
                                        />
                                    </motion.div>
                                </AnimatePresence>

                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                    {DRONE_MODELS.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1.5 w-6 rounded-full transition-all duration-300 ${i === currentModelIndex ? 'bg-green-400 w-10' : 'bg-white/10'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                            </div>
                        </motion.div>
                    </div>
                )}

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
                                <Link href="/dashboard" className="flex-1">
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
