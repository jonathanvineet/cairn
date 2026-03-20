import * as ethers from "ethers";

/**
 * AGENT-BASED PATROL SUBMISSION WITH EVIDENCE
 * 
 * This utility enables drone agents to submit patrol evidence directly to the blockchain
 * without requiring the backend operator's signature. The drone's embedded agent:
 * 
 * 1. Collects evidence (images, sensor data)
 * 2. Generates cryptographic hashes
 * 3. Submits to its HCS topic using its own account
 * 4. Pays for transactions from its own HBAR balance
 */

export interface PatrolEvidenceData {
  droneId: string;
  zoneId: string;
  ipfsCid: string;
  dataHash: string;
  imageHash: string;
  imageFile?: File | Blob;
  imageBase64?: string;
  imagePath?: string;
}

export interface AgentSubmissionConfig {
  agentTopicId: string;
  agentPrivateKey: string;
  agentAccountId?: string;
}

/**
 * Hash evidence data for blockchain verification
 */
export function hashEvidenceData(
  droneId: string,
  zoneId: string,
  ipfsCid: string,
  dataHash: string
): string {
  const combined = `${droneId}|${zoneId}|${ipfsCid}|${dataHash}`;
  return ethers.id(combined);
}

/**
 * Hash image file for evidence verification
 */
export async function hashImageFile(
  imageFile: File | Blob | Buffer
): Promise<string> {
  try {
    let buffer: Buffer;

    if (imageFile instanceof Buffer) {
      buffer = imageFile;
    } else if (imageFile instanceof Blob) {
      const arrayBuffer = await imageFile.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else if (imageFile instanceof File) {
      const arrayBuffer = await imageFile.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      throw new Error("Invalid image file type");
    }

    // Generate keccak256 hash (compatible with Ethereum/Hedera contracts)
    const hash = ethers.keccak256(buffer);
    return hash;
  } catch (error) {
    console.error("Failed to hash image:", error);
    throw new Error("Image hashing failed");
  }
}

/**
 * Hash image from base64 string
 */
export function hashImageBase64(base64String: string): string {
  try {
    // Remove data URI prefix if present
    const base64Data = base64String.replace(/^data:image\/[^;]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const hash = ethers.keccak256(buffer);
    return hash;
  } catch (error) {
    console.error("Failed to hash base64 image:", error);
    throw new Error("Base64 image hashing failed");
  }
}

/**
 * Submit patrol evidence using drone agent
 * 
 * The agent submits data to its HCS topic, which can then be:
 * - Monitored by the drone's management system
 * - Relayed to the main vault contract
 * - Used for autonomous decision making
 */
export async function submitPatrolAsAgent(
  evidence: PatrolEvidenceData,
  config: AgentSubmissionConfig,
  backendUrl: string = "/api/patrol/agent-submit"
): Promise<any> {
  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        droneId: evidence.droneId,
        zoneId: evidence.zoneId,
        ipfsCid: evidence.ipfsCid,
        dataHash: evidence.dataHash,
        imageHash: evidence.imageHash,
        agentTopicId: config.agentTopicId,
        agentPrivateKey: config.agentPrivateKey,
        agentAccountId: config.agentAccountId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Agent submission failed");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Agent submission error:", error);
    throw new Error(error.message || "Failed to submit patrol as agent");
  }
}

/**
 * Generate evidence submission payload
 * Combines drone data, hashes, and agent config
 */
export function generateEvidencePayload(
  droneId: string,
  zoneId: string,
  ipfsCid: string,
  dataHash: string,
  imageHash: string
): object {
  const evidenceHash = hashEvidenceData(droneId, zoneId, ipfsCid, dataHash);

  return {
    droneId,
    zoneId,
    ipfsCid,
    dataHash,
    imageHash,
    evidenceHash,
    timestamp: new Date().toISOString(),
    version: "1.0",
    encoding: "keccak256",
  };
}

/**
 * Verify evidence hash consistency
 */
export function verifyEvidenceHash(
  droneId: string,
  zoneId: string,
  ipfsCid: string,
  dataHash: string,
  expectedHash: string
): boolean {
  const computed = hashEvidenceData(droneId, zoneId, ipfsCid, dataHash);
  return computed === expectedHash;
}

/**
 * Prepare drone agent for autonomous submissions
 * Returns configuration needed by drone for offline operation
 */
export function prepareDroneAgentConfig(
  topicId: string,
  privateKey: string,
  accountId: string
): AgentSubmissionConfig {
  return {
    agentTopicId: topicId,
    agentPrivateKey: privateKey,
    agentAccountId: accountId,
  };
}
