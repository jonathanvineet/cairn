import { ethers } from "ethers";

const DRONE_REGISTRY_ABI = [
  {
    inputs: [{ internalType: "string", name: "_cairnId", type: "string" }],
    name: "getDroneByCAIRNId",
    outputs: [
      {
        components: [
          { internalType: "string", name: "cairnId", type: "string" },
          { internalType: "address", name: "accountId", type: "address" },
          { internalType: "string", name: "zoneId", type: "string" },
          { internalType: "string", name: "model", type: "string" },
          { internalType: "string", name: "hederaAccountId", type: "string" },
          {
            internalType: "string",
            name: "encryptedPrivateKey",
            type: "string",
          },
          { internalType: "string", name: "agentTopicId", type: "string" },
          { internalType: "uint256", name: "registeredAt", type: "uint256" },
          { internalType: "bool", name: "isActive", type: "bool" },
        ],
        internalType: "struct DroneRegistry.Drone",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

async function checkDrone(droneId: string) {
  const rpc = process.env.HEDERA_TESTNET_RPC || "https://testnet.hashio.io/api";
  const contractAddr =
    process.env.DRONE_REGISTRY_ADDRESS || "0xC53EeE798A81DE4E6D74A65bCFE8563490AEE769";

  try {
    const provider = new ethers.JsonRpcProvider(rpc);
    const contract = new ethers.Contract(
      contractAddr,
      DRONE_REGISTRY_ABI,
      provider
    );

    const drone = await contract.getDroneByCAIRNId(droneId);

    return {
      found: true,
      agentTopicId: drone.agentTopicId,
      encryptedKeyLength: drone.encryptedPrivateKey.length,
    };
  } catch (e: any) {
    if (e.message.includes("Drone not found")) {
      return { found: false };
    }
    throw e;
  }
}

// Check all drones
async function main() {
  const drones = ["fdhsrhrth", "sfgsfg", "testdrone"];

  for (const droneId of drones) {
    try {
      const result = await checkDrone(droneId);
      if (result.found) {
        console.log(`✅ ${droneId}`);
        console.log(
          `   Agent Topic: ${result.agentTopicId || "NOT SET ❌"}`
        );
        console.log(
          `   Encrypted Key: ${result.encryptedKeyLength} chars`
        );
      }
    } catch (e) {
      // Skip
    }
  }
}

main();
