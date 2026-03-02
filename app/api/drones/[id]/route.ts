import { db } from "@/lib/db";
import { DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI } from "@/lib/contracts";
import { ethers } from "ethers";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        
        // Try to find drone by cairnDroneId first, then by hederaAccountId, then by evmAddress
        let drone = await db.drones.findByCairnId(id);
        
        if (!drone) {
            drone = await db.drones.findByAccountId(id);
        }
        
        if (!drone) {
            drone = await db.drones.findByEvmAddress(id);
        }
        
        if (!drone) {
            return Response.json({
                success: false,
                error: "Drone not found"
            }, { status: 404 });
        }

        // Query live status from DroneRegistry contract
        let contractStatus = null;
        try {
            const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";
            
            // Create a JSON-RPC provider for reading contract state
            const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);

            const contract = new ethers.Contract(
                DRONE_REGISTRY_ADDRESS,
                DRONE_REGISTRY_ABI,
                provider
            );

            // Call getDrone with the EVM address
            const result = await contract.getDrone(drone.evmAddress);
            
            contractStatus = {
                cairnId: result.cairnId,
                accountId: result.accountId,
                zoneId: result.zoneId,
                model: result.model,
                registeredAt: Number(result.registeredAt),
                isActive: result.isActive,
            };
        } catch (contractError: any) {
            console.error("Error reading from DroneRegistry contract:", contractError);
            // Continue without contract status - not a critical error
        }

        return Response.json({
            success: true,
            drone: {
                ...drone,
                certExpiryDate: drone.certExpiryDate.toISOString(),
                registeredAt: drone.registeredAt.toISOString(),
            },
            contractStatus,
        });

    } catch (error: any) {
        console.error("GET /api/drones/[id] error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to fetch drone"
        }, { status: 500 });
    }
}
