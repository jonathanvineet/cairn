"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ExternalLink, MapPin, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { BOUNDARY_ZONE_REGISTRY_ADDRESS, BOUNDARY_ZONE_REGISTRY_ABI } from "@/lib/contracts";

interface Zone {
  id: string;
  zoneId: string;
  name: string;
  coordinates: { lat: number; lng: number }[];
  createdAt: Date;
  assignedDrones: string[];
}

interface BlockchainZoneData {
  exists: boolean;
  createdBy?: string;
  createdAt?: number;
  loading: boolean;
  error?: string;
}

export default function SavedZones() {
  const [blockchainData, setBlockchainData] = useState<Record<string, BlockchainZoneData>>({});

  // Fetch zones from database
  const { data: zonesData, isLoading, error, refetch } = useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const res = await fetch("/api/zones");
      if (!res.ok) throw new Error("Failed to fetch zones");
      return res.json();
    },
  });

  // Verify zones on blockchain
  const verifyZoneOnChain = async (zoneId: string) => {
    setBlockchainData(prev => ({
      ...prev,
      [zoneId]: { exists: false, loading: true }
    }));

    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask not available");
      }

      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const contract = new ethers.Contract(
        BOUNDARY_ZONE_REGISTRY_ADDRESS,
        BOUNDARY_ZONE_REGISTRY_ABI,
        provider
      );

      const zoneData = await contract.zones(zoneId);
      
      if (zoneData.exists) {
        setBlockchainData(prev => ({
          ...prev,
          [zoneId]: {
            exists: true,
            createdBy: zoneData.createdBy,
            createdAt: Number(zoneData.createdAt),
            loading: false,
          }
        }));
      } else {
        setBlockchainData(prev => ({
          ...prev,
          [zoneId]: {
            exists: false,
            loading: false,
          }
        }));
      }
    } catch (error: any) {
      console.error("Error verifying zone:", error);
      setBlockchainData(prev => ({
        ...prev,
        [zoneId]: {
          exists: false,
          loading: false,
          error: error.message
        }
      }));
    }
  };

  // Verify all zones on mount
  useEffect(() => {
    if (zonesData?.zones && typeof window.ethereum !== "undefined") {
      zonesData.zones.forEach((zone: Zone) => {
        verifyZoneOnChain(zone.zoneId);
      });
    }
  }, [zonesData?.zones]);

  if (isLoading) {
    return (
      <Card className="glass-strong border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-sm text-blue-400">Saved Zones</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">Loading zones...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-strong border-red-500/30">
        <CardHeader>
          <CardTitle className="text-sm text-red-400">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">Failed to load zones</p>
        </CardContent>
      </Card>
    );
  }

  const zones: Zone[] = zonesData?.zones || [];

  if (zones.length === 0) {
    return (
      <Card className="glass-strong border-gray-500/30">
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Saved Zones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-500" />
            <p className="text-sm text-gray-400 mb-2">No zones created yet</p>
            <p className="text-xs text-gray-500">Create your first boundary zone in Deploy Mission</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-strong border-green-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-green-400">Saved Zones</CardTitle>
          <Badge variant="outline" className="text-xs">
            {zones.length} {zones.length === 1 ? 'Zone' : 'Zones'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {zones.map((zone) => {
            const chainData = blockchainData[zone.zoneId];
            const isVerified = chainData?.exists === true;
            const isChecking = chainData?.loading === true;

            return (
              <div
                key={zone.id}
                className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-green-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-white">{zone.zoneId}</h3>
                      {isChecking ? (
                        <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                          Checking...
                        </Badge>
                      ) : isVerified ? (
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          On-Chain
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-gray-500/10 text-gray-400 border-gray-500/30">
                          <XCircle className="h-3 w-3 mr-1" />
                          Database Only
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{zone.name}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Database Info */}
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Created:
                    </span>
                    <span className="text-gray-300 font-mono">
                      {new Date(zone.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-400">
                    <span>Boundary Points:</span>
                    <span className="text-gray-300 font-semibold">
                      {zone.coordinates.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-400">
                    <span>Assigned Drones:</span>
                    <span className="text-gray-300 font-semibold">
                      {zone.assignedDrones.length}
                    </span>
                  </div>

                  {/* Blockchain Info */}
                  {isVerified && chainData && (
                    <>
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-gray-500 font-semibold mb-1">Blockchain Data:</p>
                      </div>
                      
                      {chainData.createdBy && (
                        <div className="flex items-center justify-between text-gray-400">
                          <span>Creator:</span>
                          <span className="text-blue-400 font-mono text-[10px]">
                            {chainData.createdBy.slice(0, 6)}...{chainData.createdBy.slice(-4)}
                          </span>
                        </div>
                      )}

                      {chainData.createdAt && (
                        <div className="flex items-center justify-between text-gray-400">
                          <span>On-Chain Time:</span>
                          <span className="text-gray-300 font-mono text-[10px]">
                            {new Date(chainData.createdAt * 1000).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                  {!isVerified && !isChecking && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => verifyZoneOnChain(zone.zoneId)}
                      className="flex-1 h-7 text-xs"
                    >
                      Verify On-Chain
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://hashscan.io/testnet/contract/${BOUNDARY_ZONE_REGISTRY_ADDRESS}`, '_blank')}
                    className="flex-1 h-7 text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Contract
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="w-full h-8 text-xs"
          >
            Refresh Zones
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
