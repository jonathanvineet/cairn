import { ethers } from "ethers";
import { DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI } from "@/lib/contracts";

const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";

/**
 * List deployed drones from blockchain contract
 * All drone data now comes from the smart contract (database eliminated)
 */
export async function POST(request: Request) {
  try {
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const contract = new ethers.Contract(DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI, provider);

    const allDrones = await contract.getAllDrones();
    console.log(`📡 Found ${allDrones.length} drones on blockchain contract`);

    const drones = allDrones.map((d: any) => ({
      cairnId: d.cairnId.trim(),
      evmAddress: d.accountId,
      model: d.model,
      zoneId: d.zoneId,
      hederaAccountId: d.hederaAccountId,
      agentTopicId: d.agentTopicId,
      registeredAt: new Date(Number(d.registeredAt) * 1000).toISOString(),
      isActive: d.isActive,
    }));

    return Response.json({
      success: true,
      message: "All drones fetched from blockchain contract (no local database)",
      totalCount: drones.length,
      drones,
    });
  } catch (err: any) {
    console.error("Error fetching drones:", err);
    return Response.json(
      { success: false, error: err.message || "Failed to fetch drones" },
      { status: 500 }
    );
  }
}
