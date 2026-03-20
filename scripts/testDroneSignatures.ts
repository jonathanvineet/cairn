/**
 * Try to call registerDrone with different parameter counts
 */

import {
    Client,
    AccountId,
    PrivateKey,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    ContractId
} from "@hiero-ledger/sdk";
import dotenv from "dotenv";

dotenv.config();

const DRONE_REGISTRY_ADDRESS = "0x7DcDB67053047eddd0192c200E69f4560Cdc07C5";

async function testRegisterDroneSignatures() {
  console.log("🔍 TESTING DIFFERENT REGISTER SIGNATURES\n");
  console.log("=".repeat(60));
  
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_PRIVATE_KEY;
  
  if (!operatorId || !operatorKey) {
    console.error("❌ Missing operator credentials in .env");
    return;
  }

  try {
    const client = Client.forTestnet();
    let operatorPrivKey: PrivateKey;
    
    try {
      let keyString = operatorKey.startsWith("0x") ? operatorKey.slice(2) : operatorKey;
      if (keyString.startsWith("302e") || keyString.startsWith("3030")) {
        operatorPrivKey = PrivateKey.fromStringED25519(keyString);
      } else if (keyString.startsWith("3026") || keyString.startsWith("3041")) {
        operatorPrivKey = PrivateKey.fromStringECDSA(keyString);
      } else {
        try {
          operatorPrivKey = PrivateKey.fromStringECDSA(keyString);
        } catch {
          operatorPrivKey = PrivateKey.fromStringED25519(keyString);
        }
      }
    } catch (e: any) {
      console.error("❌ Could not parse private key");
      return;
    }

    client.setOperator(operatorId, operatorPrivKey);

    // Try to decode what parameters the contract expects
    console.log("Testing contract parameter formats...\n");
    
    // Create test data
    const testCairnId = "TEST-DRONE-001";
    const testAccountId = "0.0.999999"; // Non-existent account
    const testZoneId = "ZONE-001";
    const testModel = "DJI-Mavic";
    const testHederaAccountId = "0.0.999999";
    const testEncryptedKey = "0x" + "a".repeat(128); // 64-byte hex string
    
    const evmAddress = AccountId.fromString(testAccountId).toEvmAddress();
    
    console.log("Test Parameters:");
    console.log(`  cairnDroneId: "${testCairnId}"`);
    console.log(`  evmAddress: ${evmAddress}`);
    console.log(`  zoneId: "${testZoneId}"`);
    console.log(`  model: "${testModel}"`);
    console.log(`  hederaAccountId: "${testHederaAccountId}"`);
    console.log(`  encryptedKey: "${testEncryptedKey}"`);
    
    console.log("\n💡 The contract might expect:");
    console.log("  Option A: (cairnId, address, zoneId, model, hederaAccountId, encryptedPrivateKey)");
    console.log("  Option B: (cairnId, address, zoneId, model)");
    console.log("  Option C: (cairnId, address, zoneId, model, hederaAccountId)");
    console.log("\nYour ABI says Option A, but contract might have been deployed with Option B");
    
    client.close();
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }

  console.log("\n" + "=".repeat(60));
}

testRegisterDroneSignatures().catch(console.error);
