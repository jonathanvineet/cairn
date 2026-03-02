"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink, MapPin, Clock, RefreshCw } from "lucide-react";
import { BOUNDARY_ZONE_REGISTRY_ADDRESS } from "@/lib/contracts";

interface ChainZone {
  zoneId: string;
  zoneName: string;
  createdBy: string;
  createdAt: number;
  exists: boolean;
  coordinates: { lat: number; lng: number }[];
  assignedDrones: string[];
}

export default function SavedZones() {
  const { data: zonesData, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const res = await fetch("/api/zones");
      if (!res.ok) throw new Error("Failed to fetch zones from blockchain");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="glass-strong border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-sm text-blue-400">Boundary Zones</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">Loading from blockchain...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-strong border-red-500/30">
        <CardHeader>
          <CardTitle className="text-sm text-red-400">Boundary Zones</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">Failed to load from blockchain</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2 w-full h-7 text-xs">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const zones: ChainZone[] = zonesData?.zones || [];

  if (zones.length === 0) {
    return (
      <Card className="glass-strong border-gray-500/30">
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Boundary Zones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-500" />
            <p className="text-sm text-gray-400 mb-2">No zones on-chain yet</p>
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
          <CardTitle className="text-sm text-green-400">Boundary Zones</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              On-Chain
            </Badge>
            <Badge variant="outline" className="text-xs">{zones.length}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {zones.map((zone) => (
            <div
              key={zone.zoneId}
              className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-green-500/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white truncate">{zone.zoneName || zone.zoneId}</h3>
                <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                  {zone.coordinates.length} pts
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Created:
                  </span>
                  <span className="text-gray-300 font-mono">
                    {new Date(zone.createdAt * 1000).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-400">
                  <span>Creator:</span>
                  <span className="text-blue-400 font-mono">
                    {zone.createdBy.slice(0, 6)}...{zone.createdBy.slice(-4)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-400">
                  <span>Assigned Drones:</span>
                  <span className="text-gray-300 font-semibold">{zone.assignedDrones.length}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://hashscan.io/testnet/contract/${BOUNDARY_ZONE_REGISTRY_ADDRESS}`, "_blank")}
                  className="w-full h-7 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View on HashScan
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-full h-8 text-xs"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Refreshing..." : "Refresh from Chain"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
