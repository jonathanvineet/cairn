import { NextRequest } from "next/server";
import { findDronesInZone } from "@/lib/geoUtils";
import { ethers } from "ethers";
import { BOUNDARY_ZONE_REGISTRY_ADDRESS, BOUNDARY_ZONE_REGISTRY_ABI, DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI } from "@/lib/contracts";

const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";

// Called after a client-side createBoundaryZone tx completes.
// This fetches the zone from blockchain and auto-assigns drones based on location.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { zoneId } = body;

    if (!zoneId || typeof zoneId !== "string") {
      return Response.json({ success: false, error: "Invalid or missing zoneId" }, { status: 400 });
    }

    // 1. Fetch zone details from blockchain
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const contract = new ethers.Contract(
      BOUNDARY_ZONE_REGISTRY_ADDRESS,
      BOUNDARY_ZONE_REGISTRY_ABI,
      provider
    );

    const zoneIdBytes32 = ethers.id(zoneId);
    const [creator, timestamp, coordsBytes]: [string, bigint, string] = await contract.getZone(zoneIdBytes32);

    if (timestamp === BigInt(0)) {
      return Response.json({ success: false, error: "Zone not found on blockchain" }, { status: 404 });
    }

    // 2. Decode coordinates
    const coordsStr = ethers.toUtf8String(coordsBytes);
    const pipeIdx = coordsStr.indexOf("|");
    const zoneName = pipeIdx !== -1 ? coordsStr.slice(0, pipeIdx) : zoneId.slice(0, 10);
    const coordsPart = pipeIdx !== -1 ? coordsStr.slice(pipeIdx + 1) : coordsStr;
    const nums = coordsPart.split(",").map(Number).filter(n => !isNaN(n));
    const coordinates: { lat: number; lng: number }[] = [];
    for (let i = 0; i < nums.length - 1; i += 2) {
      coordinates.push({
        lat: nums[i] / 1_000_000,
        lng: nums[i + 1] / 1_000_000,
      });
    }

    if (coordinates.length < 3) {
      return Response.json({ 
        success: false, 
        error: "Invalid zone coordinates (must have at least 3 points)" 
      }, { status: 400 });
    }

    // 3. Fetch all drones from contract
    const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";
    const droneProvider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const droneContract = new ethers.Contract(DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI, droneProvider);
    
    let allDrones: any[] = [];
    try {
      allDrones = await droneContract.getAllDrones();
    } catch (err: any) {
      return Response.json({
        success: false,
        error: `Failed to fetch drones from contract: ${err.message}`
      }, { status: 500 });
    }
    
    console.log(`📦 Found ${allDrones.length} drones on contract`);
    
    // Filter drones in zone
    const dronesInZone = allDrones
      .filter((d: any) => findDronesInZone([d], coordinates).includes(d.cairnId.trim()))
      .map((d: any) => d.cairnId.trim());
    
    console.log(`✅ Found ${dronesInZone.length} drones inside zone boundary`);
    console.log(`✅ Zone ${zoneId}: Auto-assigned ${dronesInZone.length} drones`);
    console.log("Assigned drones:", dronesInZone);

    return Response.json({
      success: true,
      autoAssignedDrones: dronesInZone,
      autoAssignedCount: dronesInZone.length,
      zoneDetails: {
        zoneId,
        zoneName,
        coordinates,
        creator,
        createdAt: Number(timestamp),
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/zones/boundary:", error);
    return Response.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


