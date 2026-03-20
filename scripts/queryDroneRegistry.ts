/**
 * Query Drone Registry directly from blockchain
 */

import { ethers } from "ethers";

const DRONE_REGISTRY_ADDRESS = "0x7DcDB67053047eddd0192c200E69f4560Cdc07C5";
const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";

// Minimal ABI for querying drones
const DRONE_REGISTRY_ABI = [
  {
    "inputs": [],
    "name": "getTotalDrones",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "allDrones",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_accountId", "type": "address"}],
    "name": "getDrone",
    "outputs": [{
      "components": [
        {"internalType": "string", "name": "cairnId", "type": "string"},
        {"internalType": "address", "name": "accountId", "type": "address"},
        {"internalType": "string", "name": "zoneId", "type": "string"},
        {"internalType": "string", "name": "model", "type": "string"},
        {"internalType": "string", "name": "hederaAccountId", "type": "string"},
        {"internalType": "string", "name": "encryptedPrivateKey", "type": "string"},
        {"internalType": "string", "name": "agentTopicId", "type": "string"},
        {"internalType": "uint256", "name": "registeredAt", "type": "uint256"},
        {"internalType": "bool", "name": "isActive", "type": "bool"}
      ],
      "internalType": "struct DroneRegistry.Drone",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

async function queryDroneRegistry() {
  console.log("🔍 QUERYING DRONE REGISTRY\n");
  console.log("=".repeat(60));
  
  try {
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const contract = new ethers.Contract(
      DRONE_REGISTRY_ADDRESS,
      DRONE_REGISTRY_ABI,
      provider
    );

    // Get total drones
    const totalDrones = await contract.getTotalDrones();
    const count = Number(totalDrones);
    
    console.log("\n📊 REGISTRY STATUS:");
    console.log(`   Contract Address: ${DRONE_REGISTRY_ADDRESS}`);
    console.log(`   Total Drones: ${count}`);
    console.log("=".repeat(60));

    if (count === 0) {
      console.log("\n⚠️  No drones registered yet\n");
      return;
    }

    // Fetch each drone
    console.log("\n📋 REGISTERED DRONES:\n");
    for (let i = 0; i < count; i++) {
      try {
        const droneAddress: string = await contract.allDrones(i);
        const droneData = await contract.getDrone(droneAddress);
        
        console.log(`[${i + 1}] ${droneData.cairnId.trim()}`);
        console.log(`    EVM Address: ${droneAddress}`);
        console.log(`    Model: ${droneData.model}`);
        console.log(`    Zone: ${droneData.zoneId}`);
        console.log(`    Hedera Account: ${droneData.hederaAccountId}`);
        console.log(`    Agent Topic: ${droneData.agentTopicId}`);
        console.log(`    Status: ${droneData.isActive ? "ACTIVE" : "INACTIVE"}`);
        console.log(`    Registered: ${new Date(Number(droneData.registeredAt) * 1000).toISOString()}`);
        console.log();
      } catch (err: any) {
        console.error(`❌ Error fetching drone ${i}:`, err.message);
      }
    }

    console.log("=".repeat(60));
  } catch (error: any) {
    console.error("\n❌ ERROR:", error.message);
    console.log("\n💡 Make sure:");
    console.log("   1. Contract address is correct: 0x7DcDB67053047eddd0192c200E69f4560Cdc07C5");
    console.log("   2. RPC endpoint is accessible: https://testnet.hashio.io/api");
    console.log("   3. Contract exists on Hedera Testnet EVM");
  }
}

queryDroneRegistry().catch(console.error);
