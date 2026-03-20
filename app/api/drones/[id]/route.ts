import { DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI } from "@/lib/contracts";
import { ethers } from "ethers";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";
        const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
        const contract = new ethers.Contract(DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI, provider);

        // Get all drones and search for the one matching the ID (cairnId, hederaAccountId, or evmAddress)
        const drones = await contract.getAllDrones();
        let drone = null;

        for (const droneData of drones) {
            if (
                droneData.cairnId === id ||
                droneData.cairnId.trim() === id ||
                droneData.hederaAccountId === id ||
                droneData.accountId.toLowerCase() === id.toLowerCase()
            ) {
                drone = droneData;
                break;
            }
        }

        if (!drone) {
            return Response.json({
                success: false,
                error: "Drone not found"
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            drone: {
                cairnDroneId: drone.cairnId.trim(),
                evmAddress: drone.accountId,
                model: drone.model,
                assignedZoneId: drone.zoneId,
                status: drone.isActive ? "ACTIVE" : "INACTIVE",
                registeredAt: new Date(Number(drone.registeredAt) * 1000).toISOString(),
                hederaAccountId: drone.hederaAccountId,
                agentTopicId: drone.agentTopicId,
            },
        });

    } catch (error: any) {
        console.error("GET /api/drones/[id] error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to fetch drone"
        }, { status: 500 });
    }
}
