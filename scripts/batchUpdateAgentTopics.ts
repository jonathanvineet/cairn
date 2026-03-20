import { Client, ContractExecuteTransaction, ContractFunctionParameters, ContractId, AccountId, PrivateKey } from "@hiero-ledger/sdk";
import * as fs from "fs";
import * as path from "path";

const DRONE_REGISTRY_ADDRESS = "0xC53EeE798A81DE4E6D74A65bCFE8563490AEE769";

async function updateAgentTopicsForDrones(
  updates: Array<{ droneId: string; topicId: string }>
) {
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;

  if (!operatorId || !operatorKey) {
    console.error("❌ Missing operator credentials");
    return;
  }

  let operatorPrivKey: PrivateKey;
  try {
    let keyString = operatorKey.startsWith("0x") ? operatorKey.slice(2) : operatorKey;
    operatorPrivKey = PrivateKey.fromStringECDSA(keyString);
  } catch {
    operatorPrivKey = PrivateKey.fromStringED25519(operatorKey);
  }

  const client = Client.forTestnet()
    .setOperator(AccountId.fromString(operatorId), operatorPrivKey);

  console.log(`\n📋 Updating ${updates.length} drone(s) with agent topics...\n`);

  for (const update of updates) {
    try {
      console.log(`🔄 ${update.droneId} → ${update.topicId}`);
      
      const tx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromEvmAddress(0, 0, DRONE_REGISTRY_ADDRESS))
        .setGas(100000)
        .setFunction(
          "updateAgentTopic",
          new ContractFunctionParameters()
            .addString(update.droneId)
            .addString(update.topicId)
        );

      const response = await tx.execute(client);
      const receipt = await response.getReceipt(client);
      const transactionId = response.transactionId.toString();

      console.log(`   ✅ TX: ${transactionId}\n`);
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}\n`);
    }
  }

  client.close();
  console.log("✅ All updates complete!");
}

// USAGE: Update both drones
// Provide the topic IDs here or via environment variables
const updates = [
  {
    droneId: "fdhsrhrth",
    topicId: "0.0.8310504",
  },
  {
    droneId: "sfgsfg",
    topicId: "0.0.8310496",
  },
];

// Check for command line arguments
if (process.argv[2] === "both" && process.argv[3] && process.argv[4]) {
  updates.push({
    droneId: process.argv[3],
    topicId: process.argv[4],
  });
}

updateAgentTopicsForDrones(updates);
