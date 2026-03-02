import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI } from "@/lib/contracts";

export async function POST(req: NextRequest) {
  try {
    console.log("🔄 Starting blockchain sync...");
    
    // Use Hedera's JSON-RPC relay for testnet
    const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";
    
    console.log("📡 Connecting to Hedera testnet via:", HEDERA_TESTNET_RPC);
    
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);

    const contract = new ethers.Contract(
      DRONE_REGISTRY_ADDRESS,
      DRONE_REGISTRY_ABI,
      provider
    );

    console.log("📡 Connected to DroneRegistry at:", DRONE_REGISTRY_ADDRESS);

    // Get total drones from blockchain
    console.log("⏳ Calling getTotalDrones()...");
    const totalDrones = await contract.getTotalDrones();
    const count = Number(totalDrones);
    
    console.log(`📊 Total drones on blockchain: ${count}`);

    const drones: any[] = [];
    const errors: any[] = [];
    const seenAddresses = new Set<string>();

    // Fetch each drone directly from chain
    for (let i = 0; i < count; i++) {
      try {
        const droneAddress: string = await contract.allDrones(i);
        console.log(`  [${i}] ${droneAddress}`);

        if (seenAddresses.has(droneAddress.toLowerCase())) continue;
        seenAddresses.add(droneAddress.toLowerCase());

        const droneData = await contract.getDrone(droneAddress);
        drones.push({
          cairnId: droneData.cairnId,
          evmAddress: droneAddress,
          model: droneData.model || "Unknown Model",
          zoneId: droneData.zoneId || "UNASSIGNED",
          isActive: droneData.isActive,
          registeredAt: new Date(Number(droneData.registeredAt) * 1000).toISOString(),
        });
      } catch (err: any) {
        console.error(`  ❌ Error fetching drone at index ${i}:`, err.message);
        errors.push({ index: i, error: err.message });
      }
    }

    // Deduplicate by cairnId
    const unique = Array.from(new Map(drones.map((d) => [d.cairnId, d])).values());

    const response = {
      success: true,
      message: `Read ${unique.length} drones from blockchain`,
      stats: {
        totalOnChain: count,
        returned: unique.length,
        errors: errors.length,
      },
      drones: unique,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log("✅ Blockchain read complete:", response.stats);

    return Response.json(response);
  } catch (error: any) {
    console.error("❌ Sync failed:", error);
    return Response.json(
      { 
        success: false, 
        error: error.message || "Failed to sync from blockchain",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
