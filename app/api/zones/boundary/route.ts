import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { findDronesInZone } from "@/lib/geoUtils";
import { ethers } from "ethers";
import { BOUNDARY_ZONE_REGISTRY_ADDRESS, BOUNDARY_ZONE_REGISTRY_ABI } from "@/lib/contracts";

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

    // 3. Fetch all drones from database
    const allDrones = await db.drones.findMany();
    console.log(`📦 Found ${allDrones.length} drones in database`);
    
    // Log drones with location data
    allDrones.forEach(drone => {
      if (drone.registrationLat && drone.registrationLng) {
        console.log(`  ✓ ${drone.cairnDroneId}: [${drone.registrationLat}, ${drone.registrationLng}]`);
      } else {
        console.log(`  ✗ ${drone.cairnDroneId}: NO LOCATION DATA`);
      }
    });

    // 4. Find drones within this zone's boundary
    console.log(`🔍 Checking zone "${zoneId}" with ${coordinates.length} boundary points:`);
    coordinates.forEach((coord, i) => {
      console.log(`  Point ${i + 1}: [${coord.lat}, ${coord.lng}]`);
    });
    
    const dronesInZone = findDronesInZone(allDrones, coordinates);
    
    console.log(`✅ Found ${dronesInZone.length} drones inside zone boundary`);

    // 5. Update each drone's assigned zone in the database
    for (const droneId of dronesInZone) {
      try {
        const drone = allDrones.find(d => d.cairnDroneId === droneId);
        if (drone) {
          await db.drones.update(drone.id, {
            assignedZoneId: zoneId
          });
          console.log(`  ✓ Updated ${droneId} → ${zoneId}`);
        }
      } catch (updateError) {
        console.warn(`  ✗ Failed to update drone ${droneId}:`, updateError);
      }
    }

    // 6. Update zone in local database (for caching)
    try {
      const existingZone = await db.zones.findByZoneId(zoneId);
      if (existingZone) {
        await db.zones.update(zoneId, {
          assignedDrones: dronesInZone,
          coordinates,
          name: zoneName,
        });
      } else {
        await db.zones.create({
          zoneId,
          name: zoneName,
          coordinates,
          assignedDrones: dronesInZone,
        });
      }
    } catch (dbError) {
      console.warn("Zone DB update failed (non-critical):", dbError);
    }

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


