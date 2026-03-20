#!/usr/bin/env npx ts-node

/**
 * Script to re-register an existing drone with proper encrypted credentials
 * 
 * Usage:
 *   npx ts-node scripts/reregisterDroneWithCredentials.ts "DRONE_ID" "ZONE_ID" "MODEL" "ACCOUNT_ID"
 * 
 * Example:
 *   npx ts-node scripts/reregisterDroneWithCredentials.ts "dgafasdfadsf" "patrol-zone-1" "Auterion-42" "0.0.8003944"
 */

import {
  Client,
  AccountId,
  PrivateKey,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
} from "@hiero-ledger/sdk";
import { encrypt } from "@/lib/encryption";
import { DRONE_REGISTRY_ADDRESS } from "@/lib/contracts";

async function reregisterDroneWithCredentials() {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.error("Usage: npx ts-node scripts/reregisterDroneWithCredentials.ts <droneId> <zoneId> <model> <accountId>");
    console.error("Example: npx ts-node scripts/reregisterDroneWithCredentials.ts dgafasdfadsf patrol-zone-1 Auterion-42 0.0.8003944");
    process.exit(1);
  }

  const [droneId, zoneId, model, hederaAccountId] = args;

  console.log("🔄 Re-registering drone with credentials...");
  console.log(`   Drone ID: ${droneId}`);
  console.log(`   Zone ID: ${zoneId}`);
  console.log(`   Model: ${model}`);
  console.log(`   Hedera Account: ${hederaAccountId}`);

  // Setup
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;
  const encryptionSecret = process.env.ENCRYPTION_SECRET;

  if (!operatorId || !operatorKey || !encryptionSecret) {
    console.error("❌ Missing environment variables: HEDERA_OPERATOR_ID, HEDERA_OPERATOR_KEY, ENCRYPTION_SECRET");
    process.exit(1);
  }

  try {
    // Parse operator key
    let operatorPrivKey: PrivateKey;
    const keyString = operatorKey.startsWith("0x") ? operatorKey.slice(2) : operatorKey;
    
    try {
      operatorPrivKey = PrivateKey.fromStringECDSA(keyString);
    } catch {
      operatorPrivKey = PrivateKey.fromStringED25519(keyString);
    }

    // Create client
    const client = Client.forTestnet()
      .setOperator(AccountId.fromString(operatorId), operatorPrivKey);

    console.log(`✅ Hedera client initialized (Operator: ${operatorId})`);

    // Generate NEW private key for this drone (fresh credentials)
    const newDronePrivateKey = PrivateKey.generateECDSA();
    const newDroneEvmAddress = `0x${newDronePrivateKey.publicKey.toEvmAddress()}`;

    console.log(`✅ Generated new drone private key`);
    console.log(`   EVM Address: ${newDroneEvmAddress}`);

    // Encrypt the new private key
    const encryptedPrivateKey = encrypt(
      newDronePrivateKey.toStringRaw(),
      encryptionSecret
    );

    console.log(`✅ Encrypted private key (${encryptedPrivateKey.length} chars)`);

    // Update DroneRegistry with new encrypted credentials
    console.log("\n📝 Updating DroneRegistry contract...");
    
    const updateTx = new ContractExecuteTransaction()
      .setContractId(ContractId.fromEvmAddress(0, 0, DRONE_REGISTRY_ADDRESS))
      .setGas(300000)
      .setFunction(
        "registerDrone",  // This will overwrite existing registration if drone ID matches
        new ContractFunctionParameters()
          .addString(droneId)
          .addAddress(newDroneEvmAddress)
          .addString(zoneId)
          .addString(model)
          .addString(hederaAccountId)
          .addString(encryptedPrivateKey)
      );

    const result = await updateTx.execute(client);
    const receipt = await result.getReceipt(client);

    console.log(`✅ DroneRegistry updated successfully!`);
    console.log(`   Transaction ID: ${result.transactionId.toString()}`);
    console.log(`   Status: ${receipt.status.toString()}`);
    console.log(`   Explorer: https://testnet.mirrornode.hedera.com/#/transaction/${result.transactionId.toString()}`);

    console.log("\n✅ Drone re-registered with new encrypted credentials!");
    console.log(`   You can now submit evidence using this drone ID`);

    client.close();
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

reregisterDroneWithCredentials();
