import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI } from "@/lib/contracts";

const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";

// Simulate Eliza OS analysis - in production this would call actual Eliza
interface DroneWithScore {
  cairnDroneId: string;
  evmAddress: string;
  batteryLevel: number;
  location: {
    lat: number;
    lng: number;
  };
  health: string;
  agentTopicId?: string;
  analysisScore?: number;
  analysisReason?: string;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function analyzeWithEliza(
  drones: DroneWithScore[],
  boundary: { coordinates: Array<{ lat: number; lng: number }> },
  analysisId: string
): Promise<Map<string, { score: number; reason: string }>> {
  const results = new Map<string, { score: number; reason: string }>();
  
  // Calculate boundary center
  const centerLat = drones.length > 0 
    ? boundary.coordinates.reduce((sum, c) => sum + c.lat, 0) / boundary.coordinates.length 
    : 0;
  const centerLng = drones.length > 0 
    ? boundary.coordinates.reduce((sum, c) => sum + c.lng, 0) / boundary.coordinates.length 
    : 0;

  // Eliza-inspired multi-criteria analysis
  for (const drone of drones) {
    const reasons: string[] = [];
    let score = 50; // Base score

    // Battery analysis (25 points max)
    if (drone.batteryLevel >= 80) {
      score += 25;
      reasons.push(`Excellent battery: ${drone.batteryLevel}%`);
    } else if (drone.batteryLevel >= 60) {
      score += 18;
      reasons.push(`Good battery: ${drone.batteryLevel}%`);
    } else if (drone.batteryLevel >= 40) {
      score += 10;
      reasons.push(`Moderate battery: ${drone.batteryLevel}%`);
    } else {
      reasons.push(`Low battery: ${drone.batteryLevel}%`);
    }

    // Location proximity (20 points max)
    const distance = calculateDistance(
      drone.location.lat, 
      drone.location.lng, 
      centerLat, 
      centerLng
    );
    
    if (distance < 2) {
      score += 20;
      reasons.push(`Proximity excellent: ${distance.toFixed(2)}km from zone`);
    } else if (distance < 5) {
      score += 15;
      reasons.push(`Proximity good: ${distance.toFixed(2)}km from zone`);
    } else if (distance < 10) {
      score += 8;
      reasons.push(`Proximity moderate: ${distance.toFixed(2)}km from zone`);
    } else {
      reasons.push(`Far from zone: ${distance.toFixed(2)}km away`);
    }

    // Health status (25 points max)
    if (drone.health === "excellent") {
      score += 25;
      reasons.push("System health: Excellent");
    } else if (drone.health === "good") {
      score += 18;
      reasons.push("System health: Good");
    } else if (drone.health === "fair") {
      score += 10;
      reasons.push("System health: Fair");
    } else {
      score = Math.max(0, score - 10);
      reasons.push("System health: Poor");
    }

    // Agent validation (20 points max)
    if (drone.agentTopicId) {
      score += 20;
      reasons.push("Hedera agent verified and ready");
    } else {
      reasons.push("No agent registered");
    }

    // Reliability bonus (10 points max)
    if (drone.cairnDroneId) {
      score += 5;
      reasons.push("Registered in Cairn system");
    }

    score = Math.min(100, Math.max(0, score));
    
    results.set(drone.evmAddress, {
      score: Math.round(score),
      reason: reasons.join(" | "),
    });
  }

  return results;
}

export async function POST(req: NextRequest) {
  try {
    const { boundary, analysisId } = await req.json();

    if (!boundary || !boundary.coordinates || boundary.coordinates.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid boundary coordinates" },
        { status: 400 }
      );
    }

    // Fetch all drones from blockchain
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const contract = new ethers.Contract(DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI, provider);

    const totalDrones = await contract.getTotalDrones();
    const count = Number(totalDrones);
    
    if (count === 0) {
      return NextResponse.json(
        { success: false, error: "No drones registered on blockchain" },
        { status: 404 }
      );
    }

    const blockchainDrones: any[] = [];
    const seenAddresses = new Set<string>();

    for (let i = 0; i < count; i++) {
      try {
        const droneAddress: string = await contract.allDrones(i);
        if (seenAddresses.has(droneAddress.toLowerCase())) continue;
        seenAddresses.add(droneAddress.toLowerCase());

        const droneData = await contract.getDrone(droneAddress);
        
        blockchainDrones.push({
          cairnId: droneData.cairnId,
          evmAddress: droneAddress,
          model: droneData.model || "Unknown Model",
          status: droneData.isActive ? "ACTIVE" : "INACTIVE",
          agentTopicId: null,
        });
      } catch (err: any) {
        console.error(`Error fetching drone at index ${i}:`, err.message);
      }
    }

    // Fetch real-time status for all drones
    const baseUrl = req.nextUrl.origin;
    const statusResponse = await fetch(`${baseUrl}/api/drones/status`);
    const statusData = await statusResponse.json();
    
    if (!statusData.success || !statusData.statuses) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch real-time drone status" },
        { status: 500 }
      );
    }
    
    // Create a map of statuses by evm address
    const statusMap = new Map();
    statusData.statuses.forEach((status: any) => {
      statusMap.set(status.evmAddress.toLowerCase(), status);
    });

    // Prepare drones for analysis with real-time data
    const dronesForAnalysis: DroneWithScore[] = blockchainDrones
      .filter(drone => drone.status === "ACTIVE")
      .map((drone: any) => {
        const realtimeStatus = statusMap.get(drone.evmAddress.toLowerCase());
        
        return {
          cairnDroneId: drone.cairnId,
          evmAddress: drone.evmAddress,
          batteryLevel: realtimeStatus?.batteryLevel || 50,
          location: {
            lat: realtimeStatus?.currentLat || 11.6,
            lng: realtimeStatus?.currentLng || 76.1,
          },
          health: realtimeStatus?.sensorHealth || "good",
          agentTopicId: drone.agentTopicId,
        };
      });

    if (dronesForAnalysis.length === 0) {
      return NextResponse.json(
        { success: false, error: "No active drones available for analysis" },
        { status: 404 }
      );
    }

    // Run Eliza-inspired analysis
    console.log(`🤖 Starting Eliza analysis (ID: ${analysisId}) with ${dronesForAnalysis.length} drones from blockchain...`);
    
    const analysisResults = await analyzeWithEliza(
      dronesForAnalysis,
      boundary,
      analysisId
    );

    // Sort by score
    const rankedDrones = Array.from(analysisResults.entries())
      .map(([address, analysis]) => {
        const drone = dronesForAnalysis.find(d => d.evmAddress === address);
        const realtimeStatus = statusMap.get(address.toLowerCase());
        return {
          drone,
          ...analysis,
          batteryLevel: realtimeStatus?.batteryLevel,
          distance: calculateDistance(
            drone?.location.lat || 0,
            drone?.location.lng || 0,
            boundary.coordinates.reduce((sum: number, c: any) => sum + c.lat, 0) / boundary.coordinates.length,
            boundary.coordinates.reduce((sum: number, c: any) => sum + c.lng, 0) / boundary.coordinates.length
          ),
        };
      })
      .sort((a, b) => b.score - a.score);

    const topDrone = rankedDrones[0];
    console.log(`✅ Analysis complete. Top recommendation: ${topDrone?.drone?.cairnDroneId} (Score: ${topDrone?.score}/100)`);

    return NextResponse.json({
      success: true,
      analysisId,
      timestamp: new Date().toISOString(),
      selectedDrone: {
        cairnDroneId: topDrone?.drone?.cairnDroneId,
        evmAddress: topDrone?.drone?.evmAddress,
        score: topDrone?.score,
        batteryLevel: topDrone?.batteryLevel,
        distance: topDrone?.distance,
      },
      score: topDrone?.score,
      summary: {
        totalDrones: dronesForAnalysis.length,
        analyzedDrones: rankedDrones.length,
        topCandidate: topDrone?.drone,
        topScore: topDrone?.score,
      },
      analysis: rankedDrones.map(item => ({
        drone: item.drone,
        score: item.score,
        reason: item.reason,
      })),
      boundaryCenter: {
        lat: boundary.coordinates.reduce((sum: number, c: any) => sum + c.lat, 0) / boundary.coordinates.length,
        lng: boundary.coordinates.reduce((sum: number, c: any) => sum + c.lng, 0) / boundary.coordinates.length,
      },
    });
  } catch (error: any) {
    console.error("❌ Analysis error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Analysis failed" },
      { status: 500 }
    );
  }
}
