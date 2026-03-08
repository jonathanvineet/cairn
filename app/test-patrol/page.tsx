"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SkyvaultShell from "@/components/world/SkyvaultShell";
import { Plane, Upload, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface PatrolResponse {
  success: boolean;
  message?: string;
  patrolData?: any;
  ipfsCid?: string;
  dataHash?: string;
  breachImageCID?: string;
  blockchainSubmissionIn?: string;
  error?: string;
}

export default function TestPatrolPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PatrolResponse | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleSubmitPatrol = async () => {
    setLoading(true);
    setResult(null);
    setCountdown(30);

    try {
      const response = await fetch("/api/patrol/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          droneId: "DRONE_12",
          zoneId: "ZONE_A",
          imagePath: "C:\\Users\\hp\\Documents\\broken-metallic-fence.jpg"
        })
      });

      const data = await response.json();
      setResult(data);

      // Start countdown
      if (data.success) {
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev === null || prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit patrol"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SkyvaultShell title="TEST PATROL SUBMISSION">
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-wider">
              🚁 Patrol Submission Test
            </h1>
            <p className="text-gray-400 text-sm">
              Upload breach evidence to IPFS and submit to blockchain after 30 seconds
            </p>
          </div>

          {/* Mock Data Card */}
          <Card className="bg-[#0a1628]/60 border-[#00f5ff]/30">
            <CardHeader>
              <CardTitle className="text-[#00f5ff] flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Mock Patrol Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-sm">
              <div>
                <span className="text-gray-400">Drone ID:</span>
                <span className="text-white ml-2">DRONE_12</span>
              </div>
              <div>
                <span className="text-gray-400">Zone ID:</span>
                <span className="text-white ml-2">ZONE_A</span>
              </div>
              <div>
                <span className="text-gray-400">Image Path:</span>
                <span className="text-white ml-2 break-all">
                  C:\Users\hp\Documents\broken-metallic-fence.jpg
                </span>
              </div>
              <div>
                <span className="text-gray-400">Coordinates:</span>
                <span className="text-white ml-2">4 waypoints</span>
              </div>
              <div>
                <span className="text-gray-400">Breaches:</span>
                <span className="text-red-400 ml-2">1 detected</span>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitPatrol}
            disabled={loading}
            size="lg"
            className="w-full bg-[#00f5ff] hover:bg-[#00f5ff]/80 text-black font-bold"
          >
            {loading ? (
              <>
                <Clock className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Submit Patrol to IPFS
              </>
            )}
          </Button>

          {/* Countdown */}
          {countdown !== null && countdown > 0 && (
            <Card className="bg-[#f59e0b]/10 border-[#f59e0b]/30">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 mx-auto mb-3 text-[#f59e0b] animate-pulse" />
                <div className="text-[#f59e0b] font-bold text-xl">
                  Blockchain submission in {countdown}s
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  Waiting to submit patrol data to Hedera...
                </div>
              </CardContent>
            </Card>
          )}

          {/* Result */}
          {result && (
            <Card
              className={`${
                result.success
                  ? "bg-[#10b981]/10 border-[#10b981]/30"
                  : "bg-[#ef4444]/10 border-[#ef4444]/30"
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`flex items-center gap-2 ${
                    result.success ? "text-[#10b981]" : "text-[#ef4444]"
                  }`}
                >
                  {result.success ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Success
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5" />
                      Error
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.success ? (
                  <>
                    <p className="text-white">{result.message}</p>
                    
                    {result.breachImageCID && (
                      <div className="bg-black/30 p-4 rounded font-mono text-xs">
                        <div className="text-gray-400 mb-1">Breach Image CID:</div>
                        <div className="text-[#00f5ff] break-all">{result.breachImageCID}</div>
                      </div>
                    )}

                    {result.ipfsCid && (
                      <div className="bg-black/30 p-4 rounded font-mono text-xs">
                        <div className="text-gray-400 mb-1">Patrol Data CID:</div>
                        <div className="text-[#00f5ff] break-all">{result.ipfsCid}</div>
                      </div>
                    )}

                    {result.dataHash && (
                      <div className="bg-black/30 p-4 rounded font-mono text-xs">
                        <div className="text-gray-400 mb-1">Data Hash:</div>
                        <div className="text-[#8b5cf6] break-all">{result.dataHash}</div>
                      </div>
                    )}

                    {result.patrolData && (
                      <details className="bg-black/30 p-4 rounded">
                        <summary className="cursor-pointer text-gray-400 text-sm mb-2">
                          View Full Patrol Data
                        </summary>
                        <pre className="text-xs text-white overflow-auto">
                          {JSON.stringify(result.patrolData, null, 2)}
                        </pre>
                      </details>
                    )}

                    {countdown === 0 && (
                      <div className="bg-[#10b981]/20 border border-[#10b981]/40 rounded p-4">
                        <div className="flex items-center gap-2 text-[#10b981]">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-bold">Blockchain submission completed!</span>
                        </div>
                        <div className="text-gray-400 text-sm mt-1">
                          Check your console logs for transaction details
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-[#ef4444]">{result.error}</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 text-sm space-y-2">
              <p>1️⃣ Click "Submit Patrol" to upload breach image to IPFS</p>
              <p>2️⃣ Patrol data JSON is created and uploaded to IPFS</p>
              <p>3️⃣ Wait 30 seconds for automatic blockchain submission</p>
              <p>4️⃣ Data is stored on-chain with IPFS CID reference</p>
              <p className="text-[#f59e0b] mt-4">
                ⚠️ Make sure your Hedera account credentials are set in .env
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SkyvaultShell>
  );
}
