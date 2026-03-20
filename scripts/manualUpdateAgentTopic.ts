import { Client, ContractExecuteTransaction, ContractFunctionParameters, ContractId, AccountId, PrivateKey } from "@hiero-ledger/sdk";

const DRONE_REGISTRY_ADDRESS = "0xC53EeE798A81DE4E6D74A65bCFE8563490AEE769";

async function updateAgentTopicManual(
  droneId: string,
  agentTopicId: string
) {
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;

  if (!operatorId || !operatorKey) {
    console.error("Missing operator credentials");
    return;
  }

  console.log(`\n🔄 Updating agent topic for ${droneId}...`);
  console.log(`   Topic: ${agentTopicId}`);

  let operatorPrivKey: PrivateKey;
  try {
    let keyString = operatorKey.startsWith("0x") ? operatorKey.slice(2) : operatorKey;
    operatorPrivKey = PrivateKey.fromStringECDSA(keyString);
  } catch {
    operatorPrivKey = PrivateKey.fromStringED25519(operatorKey);
  }

  const client = Client.forTestnet()
    .setOperator(AccountId.fromString(operatorId), operatorPrivKey);

  try {
    const tx = new ContractExecuteTransaction()
      .setContractId(ContractId.fromEvmAddress(0, 0, DRONE_REGISTRY_ADDRESS))
      .setGas(100000)
      .setFunction(
        "updateAgentTopic",
        new ContractFunctionParameters()
          .addString(droneId)
          .addString(agentTopicId)
      );

    const response = await tx.execute(client);
    const receipt = await response.getReceipt(client);
    const transactionId = response.transactionId.toString();

    console.log(`✅ Agent topic updated!`);
    console.log(`   TX: ${transactionId}`);
    console.log(`   Explorer: https://testnet.mirrornode.hedera.com/#/transaction/${transactionId}`);

    client.close();
    return { success: true, transactionId };
  } catch (error: any) {
    console.error(`❌ Error:`, error.message);
    client.close();
    throw error;
  }
}

// Test with the existing drones and their topic IDs from your logs
async function main() {
  try {
    // From your earlier logs:
    // sfgsfg was registered but we don't have its topic ID from logs
    // fdhsrhrth has topic 0.0.8310504

    // Let's update fdhsrhrth with its known topic
    await updateAgentTopicManual("fdhsrhrth", "0.0.8310504");
  } catch (e) {
    console.error("Failed:", e);
  }
}

main();
