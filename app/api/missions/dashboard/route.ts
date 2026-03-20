import { ethers } from "ethers";
import { DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI } from "@/lib/contracts";

const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";
const MIRROR_NODE_URL = "https://testnet.mirrornode.hedera.com";

interface MissionStats {
  droneId: string;
  totalMissions: number;
  lastMissionTime: string;
  lastMissionZone: string;
  missionCountByZone: { [zone: string]: number };
}

interface DashboardResponse {
  success: boolean;
  timestamp: string;
  totalDrones: number;
  totalMissions: number;
  droneStats: MissionStats[];
  zoneBreakdown: { [zone: string]: number };
  error?: string;
}

export async function GET() {
  try {
    console.log("📊 Generating mission dashboard...");

    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const droneContract = new ethers.Contract(
      DRONE_REGISTRY_ADDRESS,
      DRONE_REGISTRY_ABI,
      provider
    );

    const totalDroneCount = await droneContract.getTotalDrones();
    const count = Number(totalDroneCount);

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

    const droneStats: MissionStats[] = [];
    const zoneBreakdown: { [zone: string]: number } = {};
    let totalMissions = 0;

    for (const drone of drones) {
      const missionCountByZone: { [zone: string]: number } = {};
      let lastMissionTime = "";
      let lastMissionZone = "";
      let missionCount = 0;

      try {
        const response = await fetch(
          `${MIRROR_NODE_URL}/api/v1/topics/${drone.topicId}/messages?limit=100&order=desc`
        );

        if (response.ok) {
          const data = await response.json() as any;
          const messages = data.messages || [];

          for (const msg of messages) {
            try {
              const decodedContent = Buffer.from(msg.message, "base64").toString(
                "utf-8"
              );
              const messageObj = JSON.parse(decodedContent);

              if (messageObj["@type"] === "PatrolEvidence/v1") {
                missionCount++;
                const zoneId = messageObj.zoneId || "unknown";
                const timestamp = new Date(msg.consensus_timestamp * 1000).toISOString();

                if (!lastMissionTime) {
                  lastMissionTime = timestamp;
                  lastMissionZone = zoneId;
                }

                missionCountByZone[zoneId] = (missionCountByZone[zoneId] || 0) + 1;
                zoneBreakdown[zoneId] = (zoneBreakdown[zoneId] || 0) + 1;
                totalMissions++;
              }
            } catch (err) {
              // Skip unparseable messages
            }
          }
        }
      } catch (err: any) {
        console.error(`❌ Error querying topic ${drone.topicId}:`, err.message);
      }

      droneStats.push({
        droneId: drone.cairnId,
        totalMissions: missionCount,
        lastMissionTime,
        lastMissionZone,
        missionCountByZone,
      });
    }

    // Sort drones by mission count (descending)
    droneStats.sort((a, b) => b.totalMissions - a.totalMissions);

    console.log(`✅ Dashboard generated: ${drones.length} drones, ${totalMissions} total missions`);

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalDrones: drones.length,
      totalMissions,
      droneStats,
      zoneBreakdown,
    } as DashboardResponse);
  } catch (error: any) {
    console.error("❌ Error generating dashboard:", error);
    return Response.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        totalDrones: 0,
        totalMissions: 0,
        droneStats: [],
        zoneBreakdown: {},
        error: error.message || "Internal server error",
      } as DashboardResponse,
      { status: 500 }
    );
  }
}
