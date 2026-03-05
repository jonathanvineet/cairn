"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TransferLog {
    type: string;
    timestamp: Date;
    droneId?: string;
    droneAccount?: string;
    status?: string;
    transactionId?: string;
    error?: string;
    current?: number;
    total?: number;
    totalDrones?: number;
    successful?: number;
    failed?: number;
    totalTransferred?: string;
}

export default function TestTransferPage() {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<TransferLog[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const handleTestTransfer = async () => {
        setLoading(true);
        setLogs([]);
        setSummary(null);
        setProgress({ current: 0, total: 0 });

        try {
            const response = await fetch("/api/drones/test-transfer", {
                method: "POST",
            });

            if (!response.body) {
                throw new Error("No response body");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.slice(6));
                        const logEntry: TransferLog = {
                            ...data,
                            timestamp: new Date(),
                        };

                        setLogs(prev => [...prev, logEntry]);

                        if (data.type === 'start') {
                            setProgress({ current: 0, total: data.totalDrones });
                        } else if (data.type === 'progress' || data.type === 'success' || data.type === 'failure') {
                            setProgress({ current: data.current || 0, total: data.total || 0 });
                        } else if (data.type === 'complete') {
                            setSummary(data);
                        }
                    }
                }
            }
        } catch (error: any) {
            setLogs(prev => [...prev, {
                type: 'error',
                error: error.message || "Request failed",
                timestamp: new Date(),
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">
                    🧪 Test Drone HBAR Transfers (Live)
                </h1>

                <Card className="bg-slate-800/50 backdrop-blur border-slate-700 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Send 2 HBAR from Each Drone to Operator
                    </h2>
                    <p className="text-slate-300 mb-6">
                        Watch in real-time as each drone sends 2 HBAR back to your operator account. 
                        Each transaction is signed and executed live on Hedera testnet.
                    </p>

                    <Button
                        onClick={handleTestTransfer}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? "⚡ Transferring..." : "🚀 Execute Test Transfers"}
                    </Button>

                    {loading && progress.total > 0 && (
                        <div className="mt-4">
                            <div className="flex justify-between text-sm text-slate-300 mb-2">
                                <span>Progress: {progress.current} / {progress.total}</span>
                                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                                <div 
                                    className="bg-blue-500 h-full transition-all duration-300 ease-out"
                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </Card>

                {summary && (
                    <Card className="bg-green-900/30 border-green-700 backdrop-blur p-6 mb-6">
                        <h3 className="text-xl font-semibold text-white mb-4">
                            ✅ Transfer Complete!
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900/50 rounded p-3">
                                <p className="text-slate-400 text-sm">Total Drones</p>
                                <p className="text-2xl font-bold text-white">{summary.totalDrones}</p>
                            </div>
                            <div className="bg-slate-900/50 rounded p-3">
                                <p className="text-slate-400 text-sm">Total Transferred</p>
                                <p className="text-2xl font-bold text-blue-400">{summary.totalTransferred}</p>
                            </div>
                            <div className="bg-slate-900/50 rounded p-3">
                                <p className="text-slate-400 text-sm">Successful</p>
                                <p className="text-2xl font-bold text-green-400">{summary.successful}</p>
                            </div>
                            <div className="bg-slate-900/50 rounded p-3">
                                <p className="text-slate-400 text-sm">Failed</p>
                                <p className="text-2xl font-bold text-red-400">{summary.failed}</p>
                            </div>
                        </div>
                    </Card>
                )}

                {logs.length > 0 && (
                    <Card className="bg-slate-800/50 backdrop-blur border-slate-700 p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">
                            📜 Live Transaction Log
                        </h3>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {logs.map((log, idx) => (
                                <div
                                    key={idx}
                                    className={`p-3 rounded border font-mono text-sm ${
                                        log.type === 'start' 
                                            ? 'bg-blue-950/30 border-blue-800 text-blue-300'
                                        : log.type === 'processing' 
                                            ? 'bg-yellow-950/30 border-yellow-800 text-yellow-300'
                                        : log.type === 'progress'
                                            ? 'bg-purple-950/30 border-purple-800 text-purple-300'
                                        : log.type === 'success'
                                            ? 'bg-green-950/30 border-green-800 text-green-300'
                                        : log.type === 'failure'
                                            ? 'bg-red-950/30 border-red-800 text-red-300'
                                        : log.type === 'complete'
                                            ? 'bg-emerald-950/30 border-emerald-700 text-emerald-300'
                                        : 'bg-slate-900/50 border-slate-700 text-slate-300'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            {log.type === 'start' && (
                                                <div>
                                                    <p className="font-semibold">🎬 Starting transfers...</p>
                                                    <p className="text-xs mt-1 opacity-80">
                                                        {log.total} drones queued
                                                    </p>
                                                </div>
                                            )}
                                            {log.type === 'progress' && (
                                                <div>
                                                    <p className="font-semibold">⏳ Processing {log.droneId}</p>
                                                    <p className="text-xs mt-1 opacity-80">{log.droneAccount}</p>
                                                </div>
                                            )}
                                            {log.type === 'success' && (
                                                <div>
                                                    <p className="font-semibold">✅ {log.droneId}</p>
                                                    <p className="text-xs mt-1 opacity-80">{log.droneAccount}</p>
                                                    <p className="text-xs mt-1">
                                                        TX: {log.transactionId?.substring(0, 30)}...
                                                    </p>
                                                </div>
                                            )}
                                            {log.type === 'failure' && (
                                                <div>
                                                    <p className="font-semibold">❌ {log.droneId} Failed</p>
                                                    <p className="text-xs mt-1 opacity-80">{log.droneAccount}</p>
                                                    <p className="text-xs mt-1 text-red-400">{log.error}</p>
                                                </div>
                                            )}
                                            {log.type === 'complete' && (
                                                <div>
                                                    <p className="font-semibold">🎉 All transfers complete!</p>
                                                    <p className="text-xs mt-1 opacity-80">
                                                        {log.successful} successful, {log.failed} failed
                                                    </p>
                                                </div>
                                            )}
                                            {log.type === 'error' && (
                                                <div>
                                                    <p className="font-semibold">⚠️ Error</p>
                                                    <p className="text-xs mt-1">{log.error}</p>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs opacity-60 whitespace-nowrap">
                                            {log.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
