"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coins, Loader2 } from "lucide-react";

interface Drone {
    cairnDroneId: string;
    hederaAccountId?: string;
    evmAddress: string;
    status: string;
    assignedZoneId?: string;
}

export default function FundDronesPage() {
    const [drones, setDrones] = useState<Drone[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [result, setResult] = useState<any>(null);
    const [amount, setAmount] = useState(20);

    useEffect(() => {
        fetchDrones();
    }, []);

    const fetchDrones = async () => {
        try {
            const res = await fetch("/api/drones");
            if (res.ok) {
                const data = await res.json();
                setDrones(data.drones || []);
            }
        } catch (error) {
            console.error("Failed to fetch drones:", error);
        } finally {
            setPageLoading(false);
        }
    };

    const handleFundDrone = async (droneId: string) => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch("/api/drones/fund", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ droneId, amount }),
            });

            const data = await response.json();
            setResult(data);
            
            if (data.success) {
                // Refresh drone list
                fetchDrones();
            }
        } catch (error: any) {
            setResult({
                success: false,
                error: error.message || "Request failed",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFundAll = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch("/api/drones/fund", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fundAll: true, amount }),
            });

            const data = await response.json();
            setResult(data);
            
            if (data.success) {
                fetchDrones();
            }
        } catch (error: any) {
            setResult({
                success: false,
                error: error.message || "Request failed",
            });
        } finally {
            setLoading(false);
        }
    };

    const dronesWithAccounts = drones.filter(d => d.hederaAccountId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">
                    💰 Fund Existing Drones
                </h1>

                <Card className="bg-slate-800/50 backdrop-blur border-slate-700 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Transfer HBAR to Existing Drone Accounts
                    </h2>
                    <p className="text-slate-300 mb-4">
                        Send HBAR from your operator account to drones that already have Hedera accounts. 
                        Useful for topping up balance or funding drones imported from blockchain.
                    </p>

                    <div className="flex items-center gap-4 mb-4">
                        <label className="text-white">Amount per drone:</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            min="1"
                            max="100"
                            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white w-24"
                        />
                        <span className="text-slate-400">HBAR</span>
                    </div>

                    <Button
                        onClick={handleFundAll}
                        disabled={loading || dronesWithAccounts.length === 0}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Funding...
                            </>
                        ) : (
                            `💸 Fund All Drones (${dronesWithAccounts.length} drones × ${amount} HBAR)`
                        )}
                    </Button>
                </Card>

                {result && (
                    <Card className={`${
                        result.success 
                            ? "bg-green-900/30 border-green-700" 
                            : "bg-red-900/30 border-red-700"
                    } backdrop-blur p-6 mb-6`}>
                        <h3 className="text-xl font-semibold text-white mb-4">
                            {result.success ? "✅ Funding Complete" : "❌ Error"}
                        </h3>

                        {result.success ? (
                            <>
                                <div className="bg-slate-900/50 rounded p-4 mb-4">
                                    <p className="text-slate-300 mb-2">
                                        <strong>Total Drones:</strong> {result.summary.totalDrones}
                                    </p>
                                    <p className="text-green-400 mb-2">
                                        <strong>Successful:</strong> {result.summary.successful}
                                    </p>
                                    <p className="text-red-400 mb-2">
                                        <strong>Failed:</strong> {result.summary.failed}
                                    </p>
                                    <p className="text-blue-400">
                                        <strong>Total Transferred:</strong> {result.summary.totalTransferred}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    {result.results.map((r: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`p-3 rounded ${
                                                r.success
                                                    ? "bg-green-950/30 border border-green-800"
                                                    : "bg-red-950/30 border border-red-800"
                                            }`}
                                        >
                                            <p className="text-white font-medium">{r.droneId}</p>
                                            <p className="text-slate-400 text-sm font-mono">{r.droneAccount}</p>
                                            {r.success ? (
                                                <>
                                                    <p className="text-green-400 text-sm">✅ {r.amount} transferred</p>
                                                    <p className="text-slate-500 text-xs font-mono mt-1">
                                                        TX: {r.transactionId}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-red-400 text-sm">❌ {r.error}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-red-300">{result.error}</p>
                        )}
                    </Card>
                )}

                <Card className="bg-slate-800/50 backdrop-blur border-slate-700 p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">
                        Individual Drone Funding
                    </h3>

                    {pageLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        </div>
                    ) : dronesWithAccounts.length === 0 ? (
                        <p className="text-slate-400 py-8 text-center">
                            No drones with Hedera accounts found. Register a drone first.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dronesWithAccounts.map((drone) => (
                                <div
                                    key={drone.cairnDroneId}
                                    className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="text-white font-bold">{drone.cairnDroneId}</h4>
                                            <p className="text-slate-400 text-xs font-mono">
                                                {drone.hederaAccountId}
                                            </p>
                                            {drone.assignedZoneId && (
                                                <p className="text-blue-400 text-xs mt-1">
                                                    Zone: {drone.assignedZoneId}
                                                </p>
                                            )}
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            drone.status === "ACTIVE"
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-gray-500/20 text-gray-400"
                                        }`}>
                                            {drone.status}
                                        </span>
                                    </div>

                                    <Button
                                        onClick={() => handleFundDrone(drone.cairnDroneId)}
                                        disabled={loading}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        size="sm"
                                    >
                                        <Coins className="h-4 w-4 mr-2" />
                                        Fund {amount} HBAR
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
