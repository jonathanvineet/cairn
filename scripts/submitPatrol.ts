/**
 * Test Patrol Submission Script
 * 
 * This script simulates a drone patrol submission:
 * 1. Uploads breach image to IPFS
 * 2. Creates patrol JSON with breach data
 * 3. Uploads patrol JSON to IPFS
 * 4. Waits 30 seconds
 * 5. Submits IPFS CID to Hedera blockchain
 * 
 * Usage:
 *   node scripts/submitPatrol.js
 */

import { ethers } from "ethers";
import { 
  ContractExecuteTransaction, 
  ContractFunctionParameters, 
  ContractId, 
  AccountId, 
  PrivateKey, 
  Mnemonic,
  Client 
} from "@hiero-ledger/sdk";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const DRONE_EVIDENCE_VAULT_ADDRESS = "0x4873df8de78955b758F0b81808c4c01aA52A382A";

// Mock IPFS upload - replace with actual implementation
async function uploadToIPFS(data: any): Promise<string> {
  const mockCID = `bafybei${Math.random().toString(36).substring(2, 27)}`;
  console.log("📤 Uploading to IPFS...");
  console.log(JSON.stringify(data, null, 2));
  console.log("✅ IPFS CID:", mockCID);
  return mockCID;
}

async function uploadImageToIPFS(imagePath: string): Promise<string> {
  console.log("📸 Reading image:", imagePath);
  
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    console.log(`✅ Image loaded: ${imageBuffer.length} bytes`);
    
    // Mock upload
    const mockImageCID = `bafybeih${Math.random().toString(36).substring(2, 26)}`;
    console.log("✅ Image IPFS CID:", mockImageCID);
    return mockImageCID;
  } catch (error) {
    console.error("❌ Failed to read image:", error);
    throw error;
  }
}

function createDataHash(patrolData: any): string {
  const dataString = JSON.stringify(patrolData);
  return ethers.keccak256(ethers.toUtf8Bytes(dataString));
}

async function submitToBlockchain(
  droneId: string,
  zoneId: string,
  ipfsCid: string,
  dataHash: string
) {
  console.log("\n🔗 Preparing blockchain submission...");
  
  const accountIdString = process.env.HEDERA_ACCOUNT_ID;
  
  if (!accountIdString) {
    throw new Error("Missing HEDERA_ACCOUNT_ID in .env");
  }

  // Get private key (try multiple env vars)
  let operatorKey: PrivateKey;
  const privateKeyHex = process.env.HEDERA_OPERATOR_PRIVATE_KEY || process.env.HEDERA_PRIVATE_KEY;
  const mnemonicString = process.env.HEDERA_MNEMONIC;
  
  if (privateKeyHex) {
    // Handle both Ethereum-style (0x prefix) and direct hex
    const cleanKey = privateKeyHex.startsWith('0x') ? privateKeyHex.slice(2) : privateKeyHex;
    // For 32-byte raw keys, create ECDSA key
    if (cleanKey.length === 64) {
      operatorKey = PrivateKey.fromStringECDSA(cleanKey);
      console.log("✅ Loaded private key from .env (raw hex, 32 bytes)");
    } else {
      // For DER-encoded keys
      operatorKey = PrivateKey.fromString(cleanKey);
      console.log("✅ Loaded private key from .env (DER format)");
    }
  } else if (mnemonicString) {
    const mnemonic = await Mnemonic.fromString(mnemonicString);
    operatorKey = await mnemonic.toStandardECDSAsecp256k1PrivateKey("", 0);
    console.log("✅ Derived private key from mnemonic");
  } else {
    throw new Error("Either HEDERA_OPERATOR_PRIVATE_KEY, HEDERA_PRIVATE_KEY or HEDERA_MNEMONIC must be set in .env");
  }

  const client = Client.forTestnet();
  client.setOperator(
    AccountId.fromString(accountIdString),
    operatorKey
  );

  const contractId = ContractId.fromEvmAddress(0, 0, DRONE_EVIDENCE_VAULT_ADDRESS);

  // Ensure dataHash is exactly 32 bytes
  let hashBytes: Uint8Array;
  try {
    const cleanHash = dataHash.startsWith('0x') ? dataHash.slice(2) : dataHash;
    const paddedHash = cleanHash.padEnd(64, '0').substring(0, 64);
    hashBytes = ethers.getBytes('0x' + paddedHash);
    
    if (hashBytes.length !== 32) {
      throw new Error(`Hash must be 32 bytes, got ${hashBytes.length}`);
    }
  } catch (err) {
    console.error("Hash conversion error:", err);
    throw new Error(`Invalid dataHash format: ${dataHash}`);
  }

  const functionParameters = new ContractFunctionParameters()
    .addString(droneId)
    .addString(zoneId)
    .addString(ipfsCid)
    .addBytes32(hashBytes);

  // Check if drone is registered and register if needed
  console.log("🔍 Checking and registering drone...");
  try {
    const registerParams = new ContractFunctionParameters().addString(droneId);
    const registerTx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(150000)
      .setFunction("registerDrone", registerParams)
      .freezeWith(client);
    
    const signedRegisterTx = await registerTx.sign(operatorKey);
    const registerResponse = await signedRegisterTx.execute(client);
    await registerResponse.getReceipt(client);
    console.log("✅ Drone registered");
  } catch (regError: any) {
    console.log("ℹ️ Registration:", regError.message?.substring(0, 50) || "completed");
  }

  const transaction = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(500000)
    .setFunction("submitPatrol", functionParameters);

  // Freeze and sign explicitly
  console.log("🔒 Freezing and signing transaction...");
  const frozenTx = await transaction.freezeWith(client);
  const signedTx = await frozenTx.sign(operatorKey);

  console.log("⏳ Executing contract transaction...");
  const txResponse = await signedTx.execute(client);
  
  console.log("⏳ Getting receipt...");
  const receipt = await txResponse.getReceipt(client);
  
  console.log("✅ Transaction successful!");
  console.log("   Transaction ID:", txResponse.transactionId.toString());
  console.log("   Status:", receipt.status.toString());

  client.close();
  
  return txResponse.transactionId.toString();
}

async function main() {
  console.log("🚁 CAIRN Patrol Submission Test\n");
  console.log("=".repeat(50));

  const droneId = "DRONE_12";
  const zoneId = "ZONE_A";
  const imagePath = "C:\\Users\\hp\\Documents\\broken-metallic-fence.jpg";

  try {
    // Step 1: Upload breach image
    console.log("\n📍 Step 1: Upload breach image to IPFS");
    console.log("-".repeat(50));
    const breachImageCID = await uploadImageToIPFS(imagePath);

    // Step 2: Create patrol data
    console.log("\n📍 Step 2: Create patrol data structure");
    console.log("-".repeat(50));
    const patrolData = {
      droneId,
      zoneId,
      timestamp: Math.floor(Date.now() / 1000),
      coordinates: [
        { lat: 12.91321, lon: 80.22321 },
        { lat: 12.91345, lon: 80.22356 },
        { lat: 12.91367, lon: 80.22389 },
        { lat: 12.91332, lon: 80.22402 }
      ],
      images: [
        breachImageCID,
        `bafybei${Math.random().toString(36).substring(2, 27)}`,
        `bafybei${Math.random().toString(36).substring(2, 27)}`
      ],
      breaches: [
        {
          lat: 12.91345,
          lon: 80.22356,
          image: breachImageCID
        }
      ]
    };

    // Step 3: Upload patrol JSON to IPFS
    console.log("\n📍 Step 3: Upload patrol JSON to IPFS");
    console.log("-".repeat(50));
    const patrolDataCID = await uploadToIPFS(patrolData);

    // Step 4: Create data hash
    console.log("\n📍 Step 4: Create verification hash");
    console.log("-".repeat(50));
    const dataHash = createDataHash(patrolData);
    console.log("🔒 Data Hash:", dataHash);

    // Step 5: Wait 30 seconds
    console.log("\n📍 Step 5: Waiting 30 seconds...");
    console.log("-".repeat(50));
    for (let i = 30; i > 0; i--) {
      process.stdout.write(`\r⏳ ${i} seconds remaining...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log("\n");

    // Step 6: Submit to blockchain
    console.log("\n📍 Step 6: Submit to blockchain");
    console.log("-".repeat(50));
    const txId = await submitToBlockchain(droneId, zoneId, patrolDataCID, dataHash);

    console.log("\n" + "=".repeat(50));
    console.log("✅ PATROL SUBMISSION COMPLETE!");
    console.log("=".repeat(50));
    console.log("\n📊 Summary:");
    console.log("   Drone:", droneId);
    console.log("   Zone:", zoneId);
    console.log("   Patrol IPFS CID:", patrolDataCID);
    console.log("   Breach Image CID:", breachImageCID);
    console.log("   Transaction ID:", txId);
    console.log("\n🎉 All done!");

  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

main();
