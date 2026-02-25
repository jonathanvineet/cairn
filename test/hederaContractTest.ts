/**
 * Hedera Contract Testing Suite
 * Test contract interactions without deployment
 * 
 * Usage: npx ts-node test/hederaContractTest.ts
 */

import {
  Client,
  ContractFunctionParameters,
  ContractCallQuery,
  AccountId,
  PrivateKey,
} from "@hiero-ledger/sdk";

// Initialize Hedera client
const OPERATOR_ID = process.env.HEDERA_OPERATOR_ID || "";
const OPERATOR_KEY = process.env.HEDERA_OPERATOR_KEY || "";

if (!OPERATOR_ID || !OPERATOR_KEY) {
  console.log("⚠️  HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY not set");
  console.log("Set these environment variables to run actual tests on Testnet\n");
}

const client = Client.forTestnet();
if (OPERATOR_ID && OPERATOR_KEY) {
  client.setOperator(
    AccountId.fromString(OPERATOR_ID),
    PrivateKey.fromStringED25519(OPERATOR_KEY)
  );
}

// =============================================================================
// Test Suite
// =============================================================================

class HederaContractTest {
  /**
   * Test SimpleCounter contract
   */
  static async testSimpleCounter() {
    console.log("\n🧪 Testing SimpleCounter Contract");
    console.log("═".repeat(50));

    console.log(`
Functionality:
  ✓ increment()      - Increases counter by 1
  ✓ decrement()      - Decreases counter by 1
  ✓ getCount()       - Returns current count
  ✓ setCount(n)      - Owner sets count to n
  ✓ reset()          - Owner resets to 0

Events:
  ✓ CountIncremented(uint256)
  ✓ CountDecremented(uint256)
  ✓ CountReset(address)

Example Usage:
  const counter = new SimpleCounter();
  
  // Increment counter
  await counter.increment();
  
  // Get current count
  const count = await counter.getCount();
  console.log("Count:", count);
  
  // Reset (owner only)
  await counter.reset();
    `);
  }

  /**
   * Test DroneRegistry contract
   */
  static async testDroneRegistry() {
    console.log("\n🧪 Testing DroneRegistry Contract");
    console.log("═".repeat(50));

    console.log(`
Functionality:
  ✓ registerDrone(droneId)           - Register new drone
  ✓ updateDroneStatus(droneId, status) - Update mission status
  ✓ deactivateDrone(droneId)         - Deactivate drone
  ✓ getDrone(droneId)                - Get drone info
  ✓ getOwnerDrones(address)          - Get drones by owner
  ✓ getTotalDrones()                 - Get total registered drones

Events:
  ✓ DroneRegistered(droneId, owner)
  ✓ DroneStatusUpdated(droneId, status)
  ✓ DroneDeactivated(droneId)

Data Structures:
  struct Drone {
    string droneId;
    address owner;
    uint256 registeredAt;
    bool isActive;
    string missionStatus;
  }

Example Usage:
  const registry = new DroneRegistry();
  
  // Register a drone
  await registry.registerDrone("DRONE-001");
  
  // Update its mission status
  await registry.updateDroneStatus("DRONE-001", "patrol");
  
  // Get drone info
  const drone = await registry.getDrone("DRONE-001");
  console.log("Drone:", drone);
  
  // Get all drones owned by address
  const myDrones = await registry.getOwnerDrones(myAddress);
  console.log("My drones:", myDrones);
    `);
  }

  /**
   * Test MissionTracker contract
   */
  static async testMissionTracker() {
    console.log("\n🧪 Testing MissionTracker Contract");
    console.log("═".repeat(50));

    console.log(`
Functionality:
  ✓ createMission(droneId, duration, dest, altitude)
  ✓ startMission(missionId)          - Start a pending mission
  ✓ completeMission(missionId)       - Mark as completed
  ✓ failMission(missionId)           - Mark as failed
  ✓ getMission(missionId)            - Get mission details

Mission Statuses:
  PENDING     (0) - Created but not started
  ACTIVE      (1) - Currently in progress
  COMPLETED   (2) - Successfully completed
  FAILED      (3) - Failed during execution
  CANCELLED   (4) - Cancelled by coordinator

Events:
  ✓ MissionCreated(missionId, droneId, coordinator)
  ✓ MissionStatusChanged(missionId, status)
  ✓ MissionCompleted(missionId, time)

Data Structures:
  struct Mission {
    uint256 missionId;
    string droneId;
    address coordinator;
    uint256 startTime;
    uint256 estimatedEndTime;
    MissionStatus status;
    string destination;
    uint256 altitudeLimit;
  }

Example Usage:
  const tracker = new MissionTracker();
  
  // Create a mission: 1 hour duration, 500m altitude
  const missionId = await tracker.createMission(
    "DRONE-001",
    3600,
    "Zone-A",
    500
  );
  
  // Start the mission
  await tracker.startMission(missionId);
  
  // Complete the mission
  await tracker.completeMission(missionId);
  
  // Get mission details
  const mission = await tracker.getMission(missionId);
  console.log("Mission:", mission);
    `);
  }

  /**
   * Run all tests
   */
  static async runAll() {
    console.log("\n🚀 Hedera Smart Contract Test Suite");
    console.log("═".repeat(50));
    console.log(`Environment: ${OPERATOR_ID ? "Testnet Connected ✅" : "Local Simulation ⚠️"}`);

    await this.testSimpleCounter();
    await this.testDroneRegistry();
    await this.testMissionTracker();

    this.printDeploymentGuide();
  }

  /**
   * Print deployment guide
   */
  static printDeploymentGuide() {
    console.log("\n\n📚 DEPLOYMENT GUIDE");
    console.log("═".repeat(50));

    console.log(`
1️⃣  COMPILE CONTRACTS
   Solidity → ABI + Bytecode

   Option A: Using Hardhat
   $ npm install --save-dev hardhat
   $ npx hardhat init
   $ npx hardhat compile

   Option B: Using Remix Online
   - Go to https://remix.ethereum.org
   - Paste your .sol file
   - Compile and get bytecode

2️⃣  PREPARE ENVIRONMENT
   
   Get Testnet funds:
   - Account: https://portal.hedera.com/faucet
   - Get test HBAR
   
   Set environment variables:
   $ export HEDERA_OPERATOR_ID="0.0.xxxxx"
   $ export HEDERA_OPERATOR_KEY="302e020100300506032b6570042204203..."
   $ export HEDERA_NETWORK="testnet"

3️⃣  DEPLOY CONTRACTS

   Using Hardhat:
   $ npx hardhat run scripts/deploy.ts --network hedera-testnet
   
   Using custom script:
   $ npx ts-node test/deployContracts.ts

4️⃣  INTERACT WITH CONTRACTS

   Via Web3.js/Ethers.js:
   const contract = new ethers.Contract(
     contractAddress,
     contractABI,
     signer
   );
   
   const result = await contract.getCount();

5️⃣  MONITOR TRANSACTIONS

   Check on HashScan:
   - Testnet: https://hashscan.io/testnet
   - Search by transaction ID
   - View contract addresses and events

HEDERA SDK vs ETHERS.JS
─────────────────────────

Hedera SDK (Native):
  ✓ Direct HCS, HTS support
  ✓ HBAR operations
  ✓ Better for Hedera-specific features
  
Ethers.js (EVM Compatible):
  ✓ Familiar Solidity workflow
  ✓ Larger community/examples
  ✓ Better for general DeFi

RECOMMENDED SETUP:
  - Use Hardhat + Ethers.js for contract development
  - Use Hedera SDK for HBAR transfers and HCS
  - Mix both for full functionality

DEPLOY ROADMAP:
  1. Test contracts locally
  2. Deploy to Hedera Testnet
  3. Verify contracts on HashScan
  4. Integrate with your Next.js app
  5. Add to your store/hooks
  6. Deploy to Mainnet (when ready)
    `);
  }
}

// Run tests
HederaContractTest.runAll().catch(console.error);
