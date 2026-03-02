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

    // Get all zone IDs from chain (returns bytes32[])
    const zoneIdsBytes32: string[] = await contract.getAllZoneIds();

    // Fetch full zone data for each ID in parallel
    const zones = await Promise.all(
      zoneIdsBytes32.map(async (zoneIdBytes32: string) => {
        const [creator, timestamp, coordsBytes]: [string, bigint, string] = await contract.getZone(zoneIdBytes32);

        // Decode bytes back to string, then parse coords
        const coordsStr = ethers.toUtf8String(coordsBytes);
        const nums = coordsStr.split(",").map(Number);
        const coordinates: { lat: number; lng: number }[] = [];
        for (let i = 0; i < nums.length - 1; i += 2) {
          coordinates.push({
            lat: nums[i] / 1_000_000,
            lng: nums[i + 1] / 1_000_000,
          });
        }

        return {
          zoneId: zoneIdBytes32,
          createdBy: creator,
          createdAt: Number(timestamp),
          exists: timestamp > 0n,
          coordinates,
          assignedDrones: [],
        };
      })
    );

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
