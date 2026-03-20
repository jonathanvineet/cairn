/**
 * Get or create agent topic for a drone using Hedera Agent Kit
 * This integrates with ElizaOS to dynamically manage agent topics
 */

import { Client, AccountId, PrivateKey, TopicCreateTransaction, TopicId } from "@hiero-ledger/sdk";

interface AgentTopicConfig {
  droneId: string;
  cairnDroneId: string;
  hederaAccountId: string;
  hederaPrivateKey: PrivateKey;
  memo?: string;
}

interface AgentTopicResult {
  topicId: string;
  isNewlyCreated: boolean;
  memo: string;
  adminKey: string;
  submitKey: string;
}

/**
 * Create a new HCS topic for a drone agent
 * The drone account becomes the submit key for autonomous message submission
 */
export async function createDroneAgentTopic(
  config: AgentTopicConfig,
  client: Client
): Promise<AgentTopicResult> {
  try {
    const droneAccountId = AccountId.fromString(config.hederaAccountId);
    const dronePublicKey = config.hederaPrivateKey.publicKey;

    console.log(`🔧 [AgentKit] Creating HCS topic for drone: ${config.cairnDroneId}`);
    console.log(`   Account: ${config.hederaAccountId}`);
    console.log(`   Public Key: ${dronePublicKey.toString()}`);

    // Create topic with drone account as submit key (autonomous agent signing)
    const memo = config.memo || `Drone Agent Topic - ${config.cairnDroneId}`;
    
    const topicTx = await new TopicCreateTransaction()
      .setAdminKey(dronePublicKey)
      .setSubmitKey(dronePublicKey) // Drone can autonomously submit messages
      .setTopicMemo(memo)
      .freezeWith(client);

    // Sign with drone key to prove control
    const signedTx = await topicTx.sign(config.hederaPrivateKey);

    console.log(`📨 [AgentKit] Submitting topic creation transaction...`);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    if (!receipt.topicId) {
      throw new Error("Topic creation failed: no topic ID in receipt");
    }

    const topicId = receipt.topicId.toString();

    console.log(`✅ [AgentKit] Agent topic created successfully`);
    console.log(`   Topic ID: ${topicId}`);
    console.log(`   TX: ${txResponse.transactionId?.toString()}`);

    return {
      topicId,
      isNewlyCreated: true,
      memo,
      adminKey: dronePublicKey.toString(),
      submitKey: dronePublicKey.toString(),
    };
  } catch (err: any) {
    console.error("❌ [AgentKit] Failed to create agent topic:", err?.message || err);
    throw err;
  }
}

/**
 * Query existing agent topic from mirror node
 * Useful for checking if a topic was already created
 */
export async function queryAgentTopic(
  topicId: string
): Promise<{ exists: boolean; memo?: string; adminKey?: string } | null> {
  try {
    // This would query the mirror node for topic info
    // For now, this is a placeholder - in production, query mirror node REST API
    console.log(`🔍 [AgentKit] Querying topic: ${topicId}`);
    
    // Example mirror node query:
    // GET https://testnet.mirrornode.hedera.com/api/v1/topics/{topicId}
    
    return null; // Implement based on your needs
  } catch (err: any) {
    console.error("❌ [AgentKit] Failed to query topic:", err?.message || err);
    return null;
  }
}

/**
 * Ensure drone has an agent topic
 * Creates one if it doesn't exist
 */
export async function ensureDroneAgentTopic(
  config: AgentTopicConfig,
  client: Client,
  existingTopicId?: string
): Promise<AgentTopicResult> {
  // If topic ID already provided, assume it exists
  if (existingTopicId) {
    console.log(`ℹ️  [AgentKit] Using existing topic: ${existingTopicId}`);
    return {
      topicId: existingTopicId,
      isNewlyCreated: false,
      memo: "Existing agent topic",
      adminKey: config.hederaPrivateKey.publicKey.toString(),
      submitKey: config.hederaPrivateKey.publicKey.toString(),
    };
  }

  // Create new topic
  return await createDroneAgentTopic(config, client);
}

/**
 * Hedera Agent Kit integration point
 * This can be called during analysis to get or create agent topics
 */
export async function getOrCreateAgentTopicForAnalysis(
  cairnDroneId: string,
  hederaAccountId: string,
  hederaPrivateKeyEncrypted: string,
  existingTopicId?: string
): Promise<{ topicId: string; isNewlyCreated: boolean }> {
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;
  const encryptionSecret = process.env.ENCRYPTION_SECRET;

  if (!operatorId || !operatorKey || !encryptionSecret) {
    throw new Error("Missing Hedera environment variables");
  }

  // Initialize client with server operator
  const operatorPrivKey = PrivateKey.fromStringECDSA(
    operatorKey.startsWith("0x") ? operatorKey.slice(2) : operatorKey
  );
  const client = Client.forTestnet().setOperator(AccountId.fromString(operatorId), operatorPrivKey);

  try {
    // Decrypt drone's private key
    const { decrypt } = await import("@/lib/encryption");
    const decryptedKeyStr = decrypt(hederaPrivateKeyEncrypted, encryptionSecret);
    
    let dronePrivateKey: PrivateKey;
    try {
      dronePrivateKey = PrivateKey.fromStringECDSA(decryptedKeyStr);
    } catch {
      dronePrivateKey = PrivateKey.fromStringED25519(decryptedKeyStr);
    }

    // Create or use existing topic
    const result = await ensureDroneAgentTopic(
      {
        droneId: cairnDroneId,
        cairnDroneId,
        hederaAccountId,
        hederaPrivateKey: dronePrivateKey,
        memo: `Drone Agent - ${cairnDroneId}`,
      },
      client,
      existingTopicId
    );

    return {
      topicId: result.topicId,
      isNewlyCreated: result.isNewlyCreated,
    };
  } finally {
    await client.close();
  }
}
