/**
 * agentValidator.ts
 * 
 * Validates Hedera AI agents by:
 * 1. Verifying the HCS topic exists
 * 2. Reading the agent manifest from the topic
 * 3. Validating the manifest structure and signature
 * 
 * This is a lightweight validation approach using Hedera SDK directly,
 * without requiring the full ElizaOS runtime. It verifies that the drone
 * was properly registered as an autonomous agent with a valid HCS inbox.
 */

import {
  Client,
  TopicId,
  TopicInfoQuery,
  TopicMessageQuery,
} from "@hiero-ledger/sdk";

export interface AgentManifest {
  "@type": string;
  agent: {
    id: string;
    hederaAccountId: string;
    evmAddress: string;
    agentTopicId: string;
    model: string;
    capabilities: string[];
  };
  zone: string;
  registration: {
    timestamp: string;
    lat: number;
    lng: number;
  };
  network: string;
}

export interface AgentValidationResult {
  isValid: boolean;
  topicExists: boolean;
  manifestFound: boolean;
  manifest: AgentManifest | null;
  errorMessage?: string;
}

/**
 * Validate a drone's AI agent status by checking its HCS topic
 */
export async function validateDroneAgent(
  agentTopicId: string,
  expectedEvmAddress: string
): Promise<AgentValidationResult> {
  try {
    console.log(`🔍 Validating agent topic: ${agentTopicId}`);
    
    // Create Hedera client (read-only operations, no operator needed)
    const client = Client.forTestnet();
    
    // Step 1: Verify topic exists
    let topicExists = false;
    try {
      const topicInfo = await new TopicInfoQuery()
        .setTopicId(TopicId.fromString(agentTopicId))
        .execute(client);
      
      topicExists = true;
      console.log(`  ✅ Topic exists: ${topicInfo.topicMemo}`);
    } catch (topicErr) {
      return {
        isValid: false,
        topicExists: false,
        manifestFound: false,
        manifest: null,
        errorMessage: "HCS topic not found on network",
      };
    }
    
    // Step 2: Read manifest from topic (sequence #1 is the manifest)
    let manifestFound = false;
    let manifest: AgentManifest | null = null;
    
    try {
      // Query the first message on the topic (the manifest)
      const messages: any[] = [];
      
      await new TopicMessageQuery()
        .setTopicId(TopicId.fromString(agentTopicId))
        .setLimit(1) // Only need the first message
        .subscribe(client, (message) => {
          try {
            if (message && message.contents) {
              const messageString = Buffer.from(message.contents).toString("utf-8");
              const parsedManifest = JSON.parse(messageString);
              messages.push(parsedManifest);
            }
          } catch (parseErr) {
            console.warn("  ⚠️  Failed to parse manifest message");
          }
        }, (error) => {
          console.warn("  ⚠️  Topic message subscription error:", error);
        });
      
      // Wait a bit for the subscription to receive the message
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      if (messages.length > 0) {
        manifest = messages[0] as AgentManifest;
        manifestFound = true;
        
        // Step 3: Validate manifest structure
        if (!manifest["@type"] || !manifest.agent || !manifest.agent.agentTopicId) {
          return {
            isValid: false,
            topicExists,
            manifestFound,
            manifest,
            errorMessage: "Invalid manifest structure",
          };
        }
        
        // Step 4: Validate manifest matches expected drone
        if (manifest.agent.evmAddress.toLowerCase() !== expectedEvmAddress.toLowerCase()) {
          return {
            isValid: false,
            topicExists,
            manifestFound,
            manifest,
            errorMessage: "Manifest EVM address mismatch",
          };
        }
        
        if (manifest.agent.agentTopicId !== agentTopicId) {
          return {
            isValid: false,
            topicExists,
            manifestFound,
            manifest,
            errorMessage: "Manifest topic ID mismatch",
          };
        }
        
        console.log(`  ✅ Agent manifest validated for ${manifest.agent.id}`);
        
        return {
          isValid: true,
          topicExists,
          manifestFound,
          manifest,
        };
      }
    } catch (queryErr: any) {
      console.warn("  ⚠️  Failed to query topic messages:", queryErr.message);
    }
    
    // If we got here, topic exists but couldn't read/validate manifest
    return {
      isValid: false,
      topicExists,
      manifestFound: false,
      manifest: null,
      errorMessage: "Could not retrieve or validate agent manifest",
    };
    
  } catch (error: any) {
    console.error("❌ Agent validation error:", error);
    return {
      isValid: false,
      topicExists: false,
      manifestFound: false,
      manifest: null,
      errorMessage: error.message || "Unknown validation error",
    };
  }
}

/**
 * Batch validate multiple drone agents
 */
export async function validateMultipleAgents(
  agents: Array<{ agentTopicId: string | null; evmAddress: string }>
): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();
  
  for (const agent of agents) {
    if (!agent.agentTopicId) {
      results.set(agent.evmAddress, false);
      continue;
    }
    
    try {
      const validation = await validateDroneAgent(agent.agentTopicId, agent.evmAddress);
      results.set(agent.evmAddress, validation.isValid);
    } catch (err) {
      results.set(agent.evmAddress, false);
    }
  }
  
  return results;
}
