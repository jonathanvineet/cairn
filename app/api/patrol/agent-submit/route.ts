import { NextRequest, NextResponse } from "next/server";
import {
  TopicMessageSubmitTransaction,
  TopicId,
  AccountId,
  PrivateKey,
  Client,
} from "@hiero-ledger/sdk";
import { ethers } from "ethers";

const HEDERA_TESTNET_EXPLORER = "https://testnet.mirrornode.hedera.com";

/**
 * AGENT-BASED PATROL SUBMISSION
 * 
 * This endpoint allows a drone's embedded agent to submit patrol data directly
 * to its HCS (Hedera Consensus Service) topic. The drone agent pays for the
 * transaction using its own account funds.
 * 
 * The drone agent is configured when the drone is deployed and has its own:
 * - HCS Topic ID for receiving commands and publishing status
 * - Private key for signing transactions
 * - Account ID on Hedera testnet
 * 
 * This ensures:
 * 1. Decentralized submission (agent pushes, not pulled from backend)
 * 2. Drone autonomy (agent can act independently)
 * 3. Cost transparency (drone pays for its own submissions)
 * 4. Audit trail (all submissions signed by drone agent)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      droneId, 
      agentTopicId,
      agentPrivateKey, // Drone agent's private key
      zoneId, 
      ipfsCid, 
      dataHash,
      imageHash // Hash of the evidence image
    } = body;

    if (!agentTopicId) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Agent topic ID required. Drone must be deployed with agent enabled."
        },
        { status: 400 }
      );
    }

    if (!agentPrivateKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Agent private key required. This should be securely stored on the drone device."
        },
        { status: 400 }
      );
    }

    console.log("🚁 [DRONE AGENT] Starting autonomous patrol submission...");
    console.log("   Drone ID:", droneId);
    console.log("   Agent Topic ID:", agentTopicId);
    console.log("   Zone ID:", zoneId);
    console.log("   Data Hash:", dataHash);
    console.log("   Image Hash:", imageHash);

    // Create Hedera client
    const client = Client.forTestnet();

    // Parse agent's topic ID
    const topicId = TopicId.fromString(agentTopicId);

    // Parse agent's private key
    let agentKey: PrivateKey;
    try {
      const cleanKey = agentPrivateKey.startsWith('0x') 
        ? agentPrivateKey.slice(2) 
        : agentPrivateKey;
      
      if (cleanKey.length === 64) {
        agentKey = PrivateKey.fromStringECDSA(cleanKey);
      } else {
        agentKey = PrivateKey.fromString(cleanKey);
      }
    } catch (err) {
      console.error("Failed to parse agent private key:", err);
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid agent private key format"
        },
        { status: 400 }
      );
    }

    // Get agent's account ID
    const agentAccountId = agentKey.publicKey.toAccountId(0, 0);
    console.log("   Agent Account:", agentAccountId.toString());

    // Set operator as the drone agent
    client.setOperator(agentAccountId, agentKey);

    // Prepare patrol submission message
    // This will be submitted to the drone's HCS topic
    const patrolSubmission = {
      type: "PATROL_SUBMISSION",
      timestamp: new Date().toISOString(),
      droneId,
      zoneId,
      ipfsCid,
      dataHash,
      imageHash,
      submittedBy: agentAccountId.toString(),
      signature: "signed-by-drone-agent"
    };

    const messageBytes = Buffer.from(JSON.stringify(patrolSubmission), "utf-8");

    console.log("📤 [DRONE AGENT] Submitting patrol data to HCS topic...");
    console.log("   Message size:", messageBytes.length, "bytes");

    // Submit message to the drone's HCS topic
    // This is a low-cost operation compared to smart contract execution
    const submitTx = new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(messageBytes);

    // Freeze and sign with agent's key
    const frozenTx = await submitTx.freezeWith(client);
    const signedTx = await frozenTx.sign(agentKey);

    // Execute the transaction
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    console.log("✅ [DRONE AGENT] Patrol submission successful!");
    console.log("   Transaction ID:", txResponse.transactionId.toString());
    console.log("   Status:", receipt.status.toString());

    const transactionId = txResponse.transactionId.toString();

    client.close();

    return NextResponse.json({
      success: true,
      transactionId,
      explorerLink: `${HEDERA_TESTNET_EXPLORER}/#/transaction/${transactionId}`,
      explorerUrl: `${HEDERA_TESTNET_EXPLORER}/api/v1/transactions/${transactionId}`,
      message: `Drone agent ${agentAccountId.toString()} submitted patrol evidence for zone ${zoneId}`,
      submissionDetails: {
        droneId,
        zoneId,
        topicId: agentTopicId,
        messageHash: ethers.id(JSON.stringify(patrolSubmission)),
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error("❌ [DRONE AGENT] Submission failed:", error);
    
    let errorMessage = error?.message || "Agent submission failed";
    
    if (errorMessage.includes("INSUFFICIENT_ACCOUNT_BALANCE")) {
      errorMessage = `Drone agent account has insufficient HBAR balance. Please fund the agent account to enable autonomous submissions.`;
    } else if (errorMessage.includes("INVALID_SIGNATURE")) {
      errorMessage = "Agent signature invalid. Check drone agent key configuration.";
    } else if (errorMessage.includes("TOPIC_EXPIRED")) {
      errorMessage = "Drone agent topic has expired. Re-register the drone agent.";
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error.message
      },
      { status: 500 }
    );
  }
}
