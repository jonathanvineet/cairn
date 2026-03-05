import { NextRequest } from "next/server";
import { ethers } from "ethers";
import { DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI } from "@/lib/contracts";
import { db } from "@/lib/db";

const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";

export async function GET(req: NextRequest) {
  try {
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const contract = new ethers.Contract(DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI, provider);

    const totalDrones = await contract.getTotalDrones();
    const count = Number(totalDrones);
    console.log(`📡 DroneRegistry has ${count} drones on-chain`);

    const droneIndices = Array.from({ length: count }, (_, i) => i);
    const droneDataResults = await Promise.all(
      droneIndices.map(async (i) => {
        try {
          const droneAddress: string = await contract.allDrones(i);
          const droneData = await contract.getDrone(droneAddress);

          // Merge with local DB data to get location info and updated zone assignment
          const localDrone = await db.drones.findByEvmAddress(droneAddress);

          return {
            cairnDroneId: droneData.cairnId,
            evmAddress: droneAddress,
            model: droneData.model || "Unknown Model",
            // Prioritize local DB zone assignment (updated by boundary API) over blockchain
            assignedZoneId: localDrone?.assignedZoneId || droneData.zoneId || "UNASSIGNED",
            status: droneData.isActive ? "ACTIVE" : "INACTIVE",
            registeredAt: new Date(Number(droneData.registeredAt) * 1000).toISOString(),
            // Add location data from local DB
            registrationLat: localDrone?.registrationLat,
            registrationLng: localDrone?.registrationLng,
            // AI Agent fields from local DB
            agentTopicId: localDrone?.agentTopicId || null,
            agentManifestSequence: localDrone?.agentManifestSequence || null,
            isAgent: !!localDrone?.agentTopicId,
          };
        } catch (err: any) {
          console.error(`  ❌ Error fetching drone at index ${i}:`, err.message);
          return null;
        }
      })
    );

    const drones = droneDataResults.filter((d): d is any => d !== null);

    // Deduplicate by evmAddress (keep first occurrence) - this is the unique identifier on-chain
    const unique = Array.from(
      new Map(drones.map((d) => [d.evmAddress.toLowerCase(), d])).values()
    );

    // ALSO include drones that are in local DB but not yet on blockchain
    const allLocalDrones = await db.drones.findMany();
    const blockchainAddresses = new Set(unique.map(d => d.evmAddress.toLowerCase()));

    for (const localDrone of allLocalDrones) {
      if (!blockchainAddresses.has(localDrone.evmAddress.toLowerCase())) {
        console.log(`📝 Adding local-only drone: ${localDrone.cairnDroneId} (not yet on blockchain)`);
        unique.push({
          cairnDroneId: localDrone.cairnDroneId,
          evmAddress: localDrone.evmAddress,
          model: localDrone.model || "Unknown Model",
          assignedZoneId: localDrone.assignedZoneId || "UNASSIGNED",
          status: localDrone.status || "ACTIVE",
          registeredAt: localDrone.registeredAt?.toISOString() || new Date().toISOString(),
          registrationLat: localDrone.registrationLat,
          registrationLng: localDrone.registrationLng,
          agentTopicId: localDrone.agentTopicId || null,
          agentManifestSequence: localDrone.agentManifestSequence || null,
          isAgent: !!localDrone.agentTopicId,
          serialNumber: localDrone.serialNumber,
        });
      }
    }

    console.log(`📊 Total drones returned: ${unique.length} (${count} on blockchain, ${unique.length - count} local-only)`);

    return Response.json({ success: true, drones: unique, count: unique.length });
  } catch (error: any) {
    console.error("Error in GET /api/drones:", error);
    return Response.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
