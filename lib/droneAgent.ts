/**
 * droneAgent.ts
 *
 * Registers each drone as an autonomous Hedera AI Agent using the Hedera
 * Consensus Service (HCS), without any NLP or AI API keys.
 *
 * What makes a Hedera AI Agent:
 *   1. Its own Hedera account  (created in register/route.ts)
 *   2. A dedicated HCS topic   (created here — the agent's on-chain inbox)
 *   3. A signed agent manifest (submitted to the topic — declares identity)
 *
 * The manifest format follows the Hedera Agent Communication Standard so that
 * agent-to-agent messages can be sent to the drone's topic in the future.
 */

import {
    Client,
    PrivateKey,
    AccountId,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
    TopicId,
} from "@hiero-ledger/sdk";

export interface DroneAgentManifest {
    /** Cairn drone ID e.g. "CAIRN-03" */
    cairnDroneId: string;
    /** Hedera account ID e.g. "0.0.123456" */
    hederaAccountId: string;
    /** EVM address derived from the drone's public key */
    evmAddress: string;
    /** Drone hardware model */
    model: string;
    /** Assigned patrol zone */
    assignedZoneId: string;
    /** ISO timestamp of registration */
    registeredAt: string;
    /** GPS location at registration */
    registrationLat: number;
    registrationLng: number;
}

export interface DroneAgentRegistrationResult {
    /** HCS topic ID — the drone's permanent on-chain agent channel */
    agentTopicId: string;
    /** HCS sequence number of the manifest message */
    agentManifestSequence: number;
}

/**
 * Registers a drone as a Hedera AI agent by:
 * 1. Creating a private HCS topic owned by the drone account
 * 2. Submitting a signed agent manifest to that topic
 *
 * The operator pays for topic creation; the manifest is submitted by the
 * operator on behalf of the drone (the drone is set as the admin/submit key).
 */
export async function registerDroneAsAgent(
    manifest: DroneAgentManifest,
    operatorClient: Client,
    dronePrivateKey: PrivateKey,
): Promise<DroneAgentRegistrationResult> {
    console.log(`🤖 Registering ${manifest.cairnDroneId} as Hedera AI Agent...`);

    const dronePublicKey = dronePrivateKey.publicKey;
    const droneAccountId = AccountId.fromString(manifest.hederaAccountId);

    // ── Step 1: Create a dedicated HCS topic for the drone agent ──────────
    // adminKey  = drone's key  → only the drone can delete/update the topic
    // submitKey = drone's key  → only the drone can publish messages
    const topicTx = await new TopicCreateTransaction()
        .setTopicMemo(`CAIRN-AGENT:${manifest.cairnDroneId}`)
        .setAdminKey(dronePublicKey)
        .setSubmitKey(dronePublicKey)
        .freezeWith(operatorClient)
        .sign(dronePrivateKey);

    const topicResponse = await topicTx.execute(operatorClient);
    const topicReceipt = await topicResponse.getReceipt(operatorClient);
    const topicId = topicReceipt.topicId!;
    console.log(`  📡 HCS topic created: ${topicId.toString()}`);

    // ── Step 2: Build and submit the signed agent manifest ─────────────────
    const agentManifest = {
        "@type": "HederaDroneAgent/v1",
        agent: {
            id: manifest.cairnDroneId,
            hederaAccountId: manifest.hederaAccountId,
            evmAddress: manifest.evmAddress,
            agentTopicId: topicId.toString(),
            model: manifest.model,
            capabilities: [
                "patrol",
                "boundary-enforcement",
                "image-capture",
                "zone-report",
            ],
        },
        zone: manifest.assignedZoneId,
        registration: {
            timestamp: manifest.registeredAt,
            lat: manifest.registrationLat,
            lng: manifest.registrationLng,
        },
        network: "hedera-testnet",
    };

    const manifestJson = JSON.stringify(agentManifest);

    const messageTx = await new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(manifestJson)
        .freezeWith(operatorClient)
        .sign(dronePrivateKey);   // signed by the drone — proves ownership

    const messageResponse = await messageTx.execute(operatorClient);
    const messageReceipt = await messageResponse.getReceipt(operatorClient);
    const sequenceNumber = Number(messageReceipt.topicSequenceNumber);

    console.log(
        `  ✅ Agent manifest published — topic: ${topicId.toString()}, seq: ${sequenceNumber}`,
    );

    return {
        agentTopicId: topicId.toString(),
        agentManifestSequence: sequenceNumber,
    };
}
