import { ethers } from "ethers";
import { DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI } from "@/lib/contracts";

const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";
const MIRROR_NODE_URL = "https://testnet.mirrornode.hedera.com";

interface ZoneMission {
  droneId: string;
  timestamp: string;
  hash: string;
  status: string;
}

interface ZoneStats {
  zoneId: string;
  totalMissions: number;
  dronesActive: string[];
  lastMissionTime: string;
  missions: ZoneMission[];
}

interface ZoneBreakdownResponse {
  success: boolean;
  totalZones: number;
  totalMissions: number;
  zones: ZoneStats[];
  error?: string;
}

export async function GET() {
  try {
    console.log("🗺️ Generating zone mission breakdown...");

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

    const zoneStatsMap: { [zone: string]: ZoneStats } = {};
    let totalMissions = 0;

    for (const drone of drones) {
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
                const zoneId = messageObj.zoneId || "unknown";
                const timestamp = new Date(msg.consensus_timestamp * 1000).toISOString();

                if (!zoneStatsMap[zoneId]) {
                  zoneStatsMap[zoneId] = {
                    zoneId,
                    totalMissions: 0,
                    dronesActive: [],
                    lastMissionTime: timestamp,
                    missions: [],
                  };
                }

                const zoneStats = zoneStatsMap[zoneId];
                zoneStats.totalMissions++;
                totalMissions++;

                if (!zoneStats.dronesActive.includes(drone.cairnId)) {
                  zoneStats.dronesActive.push(drone.cairnId);
                }

                // Update last mission time
                if (new Date(timestamp) > new Date(zoneStats.lastMissionTime)) {
                  zoneStats.lastMissionTime = timestamp;
                }

                // Add mission to zone's mission list
                zoneStats.missions.push({
                  droneId: drone.cairnId,
                  timestamp,
                  hash: messageObj.hash || "",
                  status: "submitted",
                });
              }
            } catch (err) {
              // Skip unparseable messages
            }
          }
        }
      } catch (err: any) {
        console.error(`❌ Error querying topic ${drone.topicId}:`, err.message);
      }
    }

    // Convert map to array and sort by mission count
    const zones = Object.values(zoneStatsMap).sort(
      (a, b) => b.totalMissions - a.totalMissions
    );

    // Sort missions within each zone by timestamp
    for (const zone of zones) {
      zone.missions.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }

    console.log(`✅ Zone breakdown generated: ${zones.length} zones, ${totalMissions} total missions`);

    return Response.json({
      success: true,
      totalZones: zones.length,
      totalMissions,
      zones,
    } as ZoneBreakdownResponse);
  } catch (error: any) {
    console.error("❌ Error generating zone breakdown:", error);
    return Response.json(
      {
        success: false,
        totalZones: 0,
        totalMissions: 0,
        zones: [],
        error: error.message || "Internal server error",
      } as ZoneBreakdownResponse,
      { status: 500 }
    );
  }
}
