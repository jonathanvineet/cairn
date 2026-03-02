import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI } from "@/lib/contracts";
import { db } from "@/lib/db";

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

    const syncedDrones: any[] = [];
    const errors: any[] = [];

    // Fetch each drone
    for (let i = 0; i < count; i++) {
      try {
        const droneAddress = await contract.allDrones(i);
        console.log(`  [${i}] Getting drone at address: ${droneAddress}`);
        
        const droneData = await contract.getDrone(droneAddress);
        
        // Check if already exists in local DB (by EVM address OR cairnDroneId)
        let existingDrone = await db.drones.findByEvmAddress(droneAddress);
        if (!existingDrone) {
          existingDrone = await db.drones.findByCairnId(droneData.cairnId);
        }
        
        if (!existingDrone) {
          console.log(`    ✓ Found new drone: ${droneData.cairnId}`);
          
          // Add to local database
          const newDrone = await db.drones.create({
            cairnDroneId: droneData.cairnId,
            hederaAccountId: droneAddress, // Using EVM address as account ID for now
            hederaPublicKey: "synced_from_blockchain",
            hederaPrivateKeyEncrypted: "not_stored_locally",
            evmAddress: droneAddress,
            serialNumber: `SYNC-${Date.now()}-${i}`,
            model: droneData.model || "Unknown Model",
            dgcaCertNumber: "DGCA-SYNCED",
            certExpiryDate: new Date("2025-12-31"),
            assignedZoneId: droneData.zoneId || "UNASSIGNED",
            sensorType: "Thermal",
            maxFlightMinutes: 30,
            registeredByOfficerId: "blockchain_sync",
            status: droneData.isActive ? "ACTIVE" : "INACTIVE",
            missionCount: 0,
            completionRate: null,
            registeredAt: new Date(Number(droneData.registeredAt) * 1000),
            initialHBARBalance: 10,
          });
          
          syncedDrones.push({
            cairnId: droneData.cairnId,
            evmAddress: droneAddress,
            model: droneData.model,
            zoneId: droneData.zoneId,
            isActive: droneData.isActive,
            registeredAt: new Date(Number(droneData.registeredAt) * 1000).toISOString(),
          });
        } else {
          console.log(`    ⏩ Drone already in DB: ${droneData.cairnId}`);
        }
      } catch (err: any) {
        console.error(`    ❌ Error fetching drone at index ${i}:`, err.message);
        errors.push({ index: i, error: err.message });
      }
    }

    // Cleanup: Remove duplicates by cairnDroneId (keep the most recent one)
    console.log("🧹 Cleaning up duplicate entries...");
    const allDrones = await db.drones.findMany();
    const cairnIdMap = new Map<string, any[]>();
    
    // Group drones by cairnDroneId
    allDrones.forEach((drone: any) => {
      if (!cairnIdMap.has(drone.cairnDroneId)) {
        cairnIdMap.set(drone.cairnDroneId, []);
      }
      cairnIdMap.get(drone.cairnDroneId)!.push(drone);
    });
    
    let duplicatesRemoved = 0;
    const memoryDb = global.prismaMock as any;
    
    // For each cairnDroneId with duplicates, keep only the most recent
    for (const [cairnId, drones] of cairnIdMap.entries()) {
      if (drones.length > 1) {
        console.log(`  ⚠️ Found ${drones.length} duplicates for ${cairnId}`);
        // Sort by registeredAt, keep the newest
        drones.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
        
        // Remove all except the first (newest)
        for (let i = 1; i < drones.length; i++) {
          if (memoryDb && memoryDb.drones) {
            const index = memoryDb.drones.findIndex((d: any) => d.id === drones[i].id);
            if (index !== -1) {
              memoryDb.drones.splice(index, 1);
              duplicatesRemoved++;
              console.log(`    🗑️ Removed duplicate entry for ${cairnId}`);
            }
          }
        }
      }
    }

    const response = {
      success: true,
      message: `Synced ${syncedDrones.length} new drones from blockchain${duplicatesRemoved > 0 ? ` and removed ${duplicatesRemoved} duplicates` : ''}`,
      stats: {
        totalOnChain: count,
        newlySynced: syncedDrones.length,
        skipped: count - syncedDrones.length - errors.length,
        duplicatesRemoved,
        errors: errors.length,
      },
      syncedDrones,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log("✅ Sync complete:", response.stats);
    
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
