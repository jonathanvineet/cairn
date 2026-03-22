import { ethers } from "ethers";
import { DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI } from "@/lib/contracts";

const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";
const MIRROR_NODE_URL = "https://testnet.mirrornode.hedera.com";
const DRONE_EVIDENCE_VAULT_ADDRESS = "0x4873df8de78955b758F0b81808c4c01aA52A382A";

// Simple ABI for mission queries
const VAULT_ABI = [
  "function getAllMissions() external view returns (tuple(uint256 missionId, string droneId, string droneAddress, string zoneId, uint256 sequence, uint256 timestamp, string hash, string topicId, string status)[])",
  "function getTotalMissions() external view returns (uint256)",
  "function getMissionsForDrone(string droneId) external view returns (tuple(uint256 missionId, string droneId, string droneAddress, string zoneId, uint256 sequence, uint256 timestamp, string hash, string topicId, string status)[])",
];

interface Mission {
  missionId: string;
  droneId: string;
  droneAddress: string;
  zoneId: string;
  sequence: number;
  timestamp: string;
  hash: string;
  topicId: string;
  transactionId?: string;
  status: string;
}

interface MissionResponse {
  success: boolean;
  totalMissions: number;
  totalDrones: number;
  missions: Mission[];
  droneBreakdown: { [droneId: string]: number };
  source: string;
  error?: string;
}

export async function GET() {
  try {
    console.log("🔍 Fetching all missions from vault contract...");

    // Step 1: Try to query missions directly from vault contract
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const vaultContract = new ethers.Contract(
      DRONE_EVIDENCE_VAULT_ADDRESS,
      VAULT_ABI,
      provider
    );

    let allMissions: Mission[] = [];
    let totalDrones = 0;
    const droneBreakdown: { [key: string]: number } = {};

    try {
      console.log("📡 Querying getAllMissions() from vault contract...");
      const contractMissions = await vaultContract.getAllMissions();
      
      console.log(`✅ Retrieved ${contractMissions.length} missions from vault contract`);

      for (const mission of contractMissions) {
        const missionObj: Mission = {
          missionId: mission.missionId.toString(),
          droneId: mission.droneId,
          droneAddress: mission.droneAddress,
          zoneId: mission.zoneId,
          sequence: Number(mission.sequence),
          timestamp: new Date(Number(mission.timestamp) * 1000).toISOString(),
          hash: mission.hash,
          topicId: mission.topicId,
          transactionId: mission.transactionId || undefined,
          status: mission.status,
        };

        allMissions.push(missionObj);

        if (!droneBreakdown[mission.droneId]) {
          droneBreakdown[mission.droneId] = 0;
          totalDrones++;
        }
        droneBreakdown[mission.droneId]++;
      }

      // Sort missions by timestamp (newest first)
      allMissions.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      console.log(`\n🎯 Total missions found: ${allMissions.length}`);
      console.log(`📊 Breakdown:`, droneBreakdown);

      return Response.json({
        success: true,
        totalMissions: allMissions.length,
        totalDrones,
        missions: allMissions,
        droneBreakdown,
        source: "vault-contract",
      } as MissionResponse);
    } catch (contractErr: any) {
      console.warn(
        `⚠️ Vault contract query failed: ${contractErr.message}`
      );

      // Fallback: Query each drone's HCS topic
      console.log("📥 Falling back to HCS topic queries...");

      const droneProvider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
      const droneContract = new ethers.Contract(
        DRONE_REGISTRY_ADDRESS,
        DRONE_REGISTRY_ABI,
        droneProvider
      );

      const totalDroneCount = await droneContract.getTotalDrones();
      const count = Number(totalDroneCount);
      console.log(`📡 Found ${count} drones in registry`);

      const drones: any[] = [];
      const seenAddresses = new Set<string>();

      for (let i = 0; i < count; i++) {
        try {
          const droneAddress = await droneContract.allDrones(i);

          if (seenAddresses.has(droneAddress.toLowerCase())) continue;
          seenAddresses.add(droneAddress.toLowerCase());

          const droneData = await droneContract.getDrone(droneAddress);
          const normalizedCairnId = (droneData.cairnId || "").trim();
          const agentTopicId = droneData.agentTopicId || null;

          if (agentTopicId) {
            drones.push({
              cairnId: normalizedCairnId,
              address: droneAddress,
              topicId: agentTopicId,
            });
          }
        } catch (err: any) {
          console.error(`❌ Error fetching drone at index ${i}:`, err.message);
        }
      }

      console.log(`✅ Retrieved ${drones.length} drones with agent topics`);

      // Query each drone's HCS topic for missions
      let missionId = 1;
      for (const drone of drones) {
        console.log(
          `📥 Querying topic ${drone.topicId} for drone ${drone.cairnId}...`
        );

        try {
          const response = await fetch(
            `${MIRROR_NODE_URL}/api/v1/topics/${drone.topicId}/messages?limit=100&order=desc`
          );

          if (response.ok) {
            const data = await response.json() as any;
            const messages = data.messages || [];

            for (const msg of messages) {
              try {
                const decodedContent = Buffer.from(
                  msg.message,
                  "base64"
                ).toString("utf-8");
                const messageObj = JSON.parse(decodedContent);

                if (messageObj["@type"] === "PatrolEvidence/v1") {
                  allMissions.push({
                    missionId: missionId.toString(),
                    droneId: drone.cairnId,
                    droneAddress: drone.address,
                    zoneId: messageObj.zoneId || "unknown",
                    sequence: msg.sequence_number || 0,
                    timestamp: new Date(msg.consensus_timestamp * 1000).toISOString(),
                    hash: messageObj.hash || "",
                    topicId: drone.topicId,
                    transactionId: msg.transaction_id || undefined,
                    status: "submitted",
                  });
                  missionId++;
                }
              } catch (err) {
                console.warn(`⚠️ Failed to parse message in topic ${drone.topicId}`);
              }
            }

            droneBreakdown[drone.cairnId] = allMissions.filter(
              (m) => m.droneId === drone.cairnId
            ).length;
            console.log(
              `   ✅ Found ${droneBreakdown[drone.cairnId]} missions for ${drone.cairnId}`
            );
          }
        } catch (err: any) {
          console.error(
            `❌ Error querying topic ${drone.topicId}:`,
            err.message
          );
        }
      }

      // Sort missions by timestamp (newest first)
      allMissions.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      console.log(`\n🎯 Total missions found: ${allMissions.length}`);
      console.log(`📊 Breakdown:`, droneBreakdown);

      return Response.json({
        success: true,
        totalMissions: allMissions.length,
        totalDrones: drones.length,
        missions: allMissions,
        droneBreakdown,
        source: "hcs-topics-fallback",
      } as MissionResponse);
    }
  } catch (error: any) {
    console.error("❌ Error in GET /api/missions/all:", error);
    return Response.json(
      {
        success: false,
        error: error.message || "Internal server error",
        totalMissions: 0,
        totalDrones: 0,
        missions: [],
        droneBreakdown: {},
        source: "error",
      } as MissionResponse,
      { status: 500 }
    );
  }
}
