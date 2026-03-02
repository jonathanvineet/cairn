import { NextRequest } from "next/server";
import { ethers } from "ethers";
import { BOUNDARY_ZONE_REGISTRY_ADDRESS, BOUNDARY_ZONE_REGISTRY_ABI } from "@/lib/contracts";

const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";

// Called after a client-side createBoundaryZone tx to fetch assigned drones from chain
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { zoneId } = body;

    if (!zoneId || typeof zoneId !== "string") {
      return Response.json({ success: false, error: "Invalid or missing zoneId" }, { status: 400 });
    }

    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const contract = new ethers.Contract(
      BOUNDARY_ZONE_REGISTRY_ADDRESS,
      BOUNDARY_ZONE_REGISTRY_ABI,
      provider
    );

    const droneAddresses: string[] = await contract.getDronesInZone(zoneId);

    return Response.json({
      success: true,
      autoAssignedDrones: droneAddresses,
      autoAssignedCount: droneAddresses.length,
    });
  } catch (error: any) {
    console.error("Error in POST /api/zones/boundary:", error);
    return Response.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

