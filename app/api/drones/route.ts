import { NextRequest } from "next/server";
import { ethers } from "ethers";
import { DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI } from "@/lib/contracts";

const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";

// Retry logic for transient RPC errors
async function fetchDroneWithRetry(
  contract: ethers.Contract,
  index: number,
  maxRetries: number = 2
): Promise<string | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const droneAddress: string = await contract.allDrones(index);
      return droneAddress;
    } catch (err: any) {
      // Retry on 502 or timeout errors
      if (
        err.message?.includes("502") ||
        err.message?.includes("timeout") ||
        err.code === "SERVER_ERROR"
      ) {
        if (attempt < maxRetries - 1) {
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
          continue;
        }
      }
      throw err;
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const contract = new ethers.Contract(DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI, provider);

    const totalDrones = await contract.getTotalDrones();
    const count = Number(totalDrones);
    console.log(`📡 DroneRegistry has ${count} drones on-chain`);

    const drones: any[] = [];
    const seenAddresses = new Set<string>();

    for (let i = 0; i < count; i++) {
      try {
        const droneAddress = await fetchDroneWithRetry(contract, i);
        if (!droneAddress) continue;
        
        if (seenAddresses.has(droneAddress.toLowerCase())) continue;
        seenAddresses.add(droneAddress.toLowerCase());

        const droneData = await contract.getDrone(droneAddress);

        // Normalize cairnId - trim whitespace as blockchain may return padded strings
        const normalizedCairnId = (droneData.cairnId || '').trim();

        drones.push({
          cairnDroneId: normalizedCairnId,
          evmAddress: droneAddress,
          model: droneData.model || "Unknown Model",
          assignedZoneId: droneData.zoneId || "UNASSIGNED",
          status: droneData.isActive ? "ACTIVE" : "INACTIVE",
          registeredAt: new Date(Number(droneData.registeredAt) * 1000).toISOString(),
          // Hedera account and agent topic from blockchain
          hederaAccountId: droneData.hederaAccountId || null,
          agentTopicId: droneData.agentTopicId || null,
        });
      } catch (err: any) {
        console.error(`  ❌ Error fetching drone at index ${i}:`, err.message);
      }
    }

    // Deduplicate by evmAddress (keep first occurrence) - this is the unique identifier on-chain
    const unique = Array.from(
      new Map(drones.map((d) => [d.evmAddress.toLowerCase(), d])).values()
    );

    console.log(`📊 Total drones returned: ${unique.length} (all from blockchain)`);
    console.log(`   Drone IDs:`, unique.map(d => `${d.cairnDroneId}`).join(', '));

    return Response.json({ success: true, drones: unique, count: unique.length });
  } catch (error: any) {
    console.error("Error in GET /api/drones:", error);
    return Response.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
