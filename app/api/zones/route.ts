import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { BOUNDARY_ZONE_REGISTRY_ADDRESS, BOUNDARY_ZONE_REGISTRY_ABI } from "@/lib/contracts";

const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";

export async function GET(req: NextRequest) {
  try {
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const contract = new ethers.Contract(
      BOUNDARY_ZONE_REGISTRY_ADDRESS,
      BOUNDARY_ZONE_REGISTRY_ABI,
      provider
    );

    const zoneIdsBytes32: string[] = await contract.getAllZoneIds();
    console.log(`📋 Found ${zoneIdsBytes32.length} zones on-chain`);

    // Fetch full zone data for each ID in parallel
    const rawZones = await Promise.all(
      zoneIdsBytes32.map(async (zoneIdBytes32: string) => {
        try {
          const [creator, timestamp, coordsBytes]: [string, bigint, string] = await contract.getZone(zoneIdBytes32);

          // Decode bytes: format is "zoneName|lat0,lng0,lat1,lng1,..."
          const coordsStr = ethers.toUtf8String(coordsBytes);
          const pipeIdx = coordsStr.indexOf("|");
          const zoneName = pipeIdx !== -1 ? coordsStr.slice(0, pipeIdx) : zoneIdBytes32.slice(0, 10);
          const coordsPart = pipeIdx !== -1 ? coordsStr.slice(pipeIdx + 1) : coordsStr;
          const nums = coordsPart.split(",").map(Number).filter(n => !isNaN(n));
          const coordinates: { lat: number; lng: number }[] = [];
          for (let i = 0; i < nums.length - 1; i += 2) {
            coordinates.push({
              lat: nums[i] / 1_000_000,
              lng: nums[i + 1] / 1_000_000,
            });
          }

          return {
            zoneId: zoneIdBytes32,
            zoneName,
            createdBy: creator,
            createdAt: Number(timestamp),
            exists: timestamp > 0n,
            coordinates,
            assignedDrones: [],
          };
        } catch (err) {
          console.error(`Failed to fetch zone ${zoneIdBytes32}:`, err);
          return null;
        }
      })
    );

    const zones = rawZones.filter(Boolean);

    return NextResponse.json({
      success: true,
      count: zones.length,
      zones,
    });
  } catch (error: any) {
    console.error("Error fetching zones from chain:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch zones from blockchain" },
      { status: 500 }
    );
  }
}
