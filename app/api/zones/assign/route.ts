import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ethers } from "ethers";
import { BOUNDARY_ZONE_REGISTRY_ABI, BOUNDARY_ZONE_REGISTRY_ADDRESS } from "@/lib/contracts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { zoneId, droneIds } = body;

    // Validation
    if (!zoneId || typeof zoneId !== "string") {
      return Response.json(
        { success: false, error: "Invalid or missing zoneId" },
        { status: 400 }
      );
    }

    if (!Array.isArray(droneIds) || droneIds.length === 0) {
      return Response.json(
        { success: false, error: "Invalid droneIds. Must be a non-empty array." },
        { status: 400 }
      );
    }

    // Check if zone exists
    const zone = await db.zones.findByZoneId(zoneId);
    if (!zone) {
      return Response.json(
        { success: false, error: "Zone not found. Create boundary first." },
        { status: 404 }
      );
    }

    // Verify all drones exist and get their EVM addresses
    const droneDetails: { cairnId: string; evmAddress: string }[] = [];
    for (const droneId of droneIds) {
      const drone = await db.drones.findByCairnId(droneId);
      if (!drone) {
        return Response.json(
          { success: false, error: `Drone ${droneId} not found` },
          { status: 404 }
        );
      }
      droneDetails.push({
        cairnId: droneId,
        evmAddress: drone.evmAddress,
      });
    }

    // Blockchain verification using BoundaryZoneRegistry
    const verificationResults: any[] = [];
    
    try {
      // Use Hedera's JSON-RPC relay for testnet
      const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";
      const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);

      const contract = new ethers.Contract(
        BOUNDARY_ZONE_REGISTRY_ADDRESS,
        BOUNDARY_ZONE_REGISTRY_ABI,
        provider
      );

      // Convert zoneId to bytes32 format
      const zoneIdBytes32 = ethers.encodeBytes32String(zoneId);

      // Verify each drone's authorization
      for (const drone of droneDetails) {
        try {
          const isAuthorized = await contract.isDroneAuthorized(
            zoneIdBytes32,
            drone.evmAddress
          );

          verificationResults.push({
            droneId: drone.cairnId,
            evmAddress: drone.evmAddress,
            isAuthorized,
            verified: true,
          });
        } catch (verifyError: any) {
          console.log(`Verification failed for ${drone.cairnId}:`, verifyError.message);
          verificationResults.push({
            droneId: drone.cairnId,
            evmAddress: drone.evmAddress,
            isAuthorized: false,
            verified: false,
            error: verifyError.message,
          });
        }
      }
    } catch (contractError: any) {
      console.error("Blockchain verification error:", contractError);
      // Continue with database update even if blockchain verification fails
      verificationResults.push({
        error: "Blockchain verification unavailable",
        message: contractError.message,
      });
    }

    // Update zone in database with assigned drones
    const existingDrones = zone.assignedDrones || [];
    const newDrones = droneIds.filter((id: string) => !existingDrones.includes(id));
    const updatedDrones = [...existingDrones, ...newDrones];

    const updatedZone = await db.zones.update(zoneId, {
      assignedDrones: updatedDrones,
    });

    if (!updatedZone) {
      return Response.json(
        { success: false, error: "Failed to update zone assignments" },
        { status: 500 }
      );
    }

    // Update each drone with the assigned zone
    for (const droneId of droneIds) {
      const drone = await db.drones.findByCairnId(droneId);
      if (drone) {
        drone.assignedZoneId = zoneId;
        drone.status = "ACTIVE";
      }
    }

    return Response.json({
      success: true,
      message: `${newDrones.length} drone(s) assigned to zone ${zoneId}`,
      zone: updatedZone,
      verificationResults,
      summary: {
        total: droneIds.length,
        newAssignments: newDrones.length,
        previousAssignments: existingDrones.length,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/zones/assign:", error);
    return Response.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
