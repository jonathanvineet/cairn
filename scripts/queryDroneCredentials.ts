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

async function queryDrone() {
  const rpc = process.env.HEDERA_TESTNET_RPC || "https://testnet.hashio.io/api";
  const droneId = process.argv[2] || "fdhsrhrth";
  const contractAddr =
    process.env.DRONE_REGISTRY_ADDRESS || "0xC53EeE798A81DE4E6D74A65bCFE8563490AEE769";

  console.log(`\n🔍 Querying drone: ${droneId}`);
  console.log(`📍 Contract: ${contractAddr}`);
  console.log(`🌐 RPC: ${rpc}\n`);

  try {
    const provider = new ethers.JsonRpcProvider(rpc);
    const contract = new ethers.Contract(
      contractAddr,
      DRONE_REGISTRY_ABI,
      provider
    );

    console.log("📡 Calling getDroneByCAIRNId()...\n");
    const drone = await contract.getDroneByCAIRNId(droneId);

    console.log("✅ Drone found!\n");
    console.log("=== DRONE DATA ===");
    console.log(`CAIRN ID: ${drone.cairnId}`);
    console.log(`Account Address: ${drone.accountId}`);
    console.log(`Zone ID: ${drone.zoneId}`);
    console.log(`Model: ${drone.model}`);
    console.log(`Hedera Account ID: ${drone.hederaAccountId}`);
    console.log(
      `\n🔐 ENCRYPTED PRIVATE KEY:\n   Length: ${drone.encryptedPrivateKey.length} characters`
    );
    console.log(
      `   Empty: ${drone.encryptedPrivateKey.length === 0 ? "YES ❌" : "NO ✅"}`
    );
    if (drone.encryptedPrivateKey.length > 0) {
      console.log(
        `   First 50 chars: ${drone.encryptedPrivateKey.substring(0, 50)}`
      );
      console.log(
        `   Last 50 chars: ${drone.encryptedPrivateKey.substring(drone.encryptedPrivateKey.length - 50)}`
      );
    }
    console.log(`\nAgent Topic ID: ${drone.agentTopicId}`);
    console.log(
      `Registered At: ${new Date(Number(drone.registeredAt) * 1000).toISOString()}`
    );
    console.log(`Active: ${drone.isActive ? "Yes ✅" : "No ❌"}`);
    console.log("\n===================\n");

    if (drone.encryptedPrivateKey.length === 0) {
      console.log("❌ PROBLEM: Encrypted private key is EMPTY on-chain!");
      console.log(
        "   The drone was registered but without the encrypted credentials."
      );
      console.log("   Evidence submission will fail.\n");
    } else {
      console.log("✅ SUCCESS: Encrypted private key is stored on-chain!");
      console.log("   Evidence submission should work.\n");
    }
  } catch (error: any) {
    if (error.message.includes("Drone not found")) {
      console.log(`❌ Drone "${droneId}" not found on contract`);
    } else {
      console.error(`Error querying contract:`, error.message);
    }
  }
}

queryDrone();
