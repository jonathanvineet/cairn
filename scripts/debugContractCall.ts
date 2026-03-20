/**
 * Debug: Check what registerDrone function parameters the contract actually expects
 */

import { ethers } from "ethers";

const DRONE_REGISTRY_ADDRESS = "0x7DcDB67053047eddd0192c200E69f4560Cdc07C5";
const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";

// Let's test with simpler parameters first
async function testRegistration() {
  console.log("🧪 TESTING DRONE REGISTRATION\n");
  console.log("=".repeat(60));
  
  try {
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    
    // Get contract bytecode to verify it exists
    const code = await provider.getCode(DRONE_REGISTRY_ADDRESS);
    if (code === "0x") {
      console.log("❌ No contract found at this address!");
      return;
    }
    
    console.log("✅ Contract exists at address");
    console.log(`   Address: ${DRONE_REGISTRY_ADDRESS}`);
    console.log(`   Code size: ${code.length} bytes`);
    
    // Try to call a read function to verify ABI is correct
    const ABI = [
      {
        "inputs": [],
        "name": "getTotalDrones",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    const contract = new ethers.Contract(DRONE_REGISTRY_ADDRESS, ABI, provider);
    const total = await contract.getTotalDrones();
    
    console.log(`\n✅ Successfully called getTotalDrones()`)
    console.log(`   Current total: ${total.toString()}`);
    
    // Now let's check what parameters registerDrone actually expects
    console.log("\n📝 Checking registerDrone signature...");
    console.log("Expected parameters from ABI:");
    console.log("   1. _cairnId (string)");
    console.log("   2. _accountId (address)");
    console.log("   3. _zoneId (string)");
    console.log("   4. _model (string)");
    console.log("   5. _hederaAccountId (string)");
    console.log("   6. _encryptedPrivateKey (string)");
    
    console.log("\n💡 If contract reverts with these parameters:");
    console.log("   - Check that strings aren't empty");
    console.log("   - Check that address format is valid");
    console.log("   - Check if contract has validation rules");
    console.log("   - Check if cairnId already exists");
    
  } catch (error: any) {
    console.error("\n❌ ERROR:", error.message);
  }
  
  console.log("\n" + "=".repeat(60));
}

testRegistration().catch(console.error);
