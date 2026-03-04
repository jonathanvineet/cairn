import { NextRequest, NextResponse } from "next/server";
import { fetchDronesFromBlockchain, type DroneStatus } from "@/lib/droneBlockchainFetcher";

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

/**
 * Fetch real-time drone status from blockchain
 */
async function fetchDroneStatuses(): Promise<DroneStatus[]> {
  try {
    return await fetchDronesFromBlockchain();
  } catch (error) {
    console.error('Failed to fetch drones from blockchain:', error);
    return [];
  }
}

/**
 * Score a drone based on mission requirements
 */
function scoreDrone(
  drone: DroneStatus,
  boundary: { coordinates: Array<{ lat: number; lng: number }> },
  missionType: 'patrol' | 'delivery' | 'surveillance' = 'patrol',
  zoneId?: string
): { score: number; reason: string; breakdown: any } {
  const reasons: string[] = [];
  let breakdown: any = {};
  
  // Calculate boundary center
  const centerLat = boundary.coordinates.reduce((sum, c) => sum + c.lat, 0) / boundary.coordinates.length;
  const centerLng = boundary.coordinates.reduce((sum, c) => sum + c.lng, 0) / boundary.coordinates.length;
  
  // Small bonus for already-assigned drones (but doesn't override optimal selection)
  let zoneAssignmentBonus = 0;
  if (zoneId && drone.assignedZoneId && drone.assignedZoneId !== "UNASSIGNED") {
    // Only give bonus if drone is formally assigned in database
    const isExactMatch = drone.assignedZoneId === zoneId;
    if (isExactMatch) {
      zoneAssignmentBonus = 10; // Small bonus, not overwhelming
      reasons.push(`✓ Previously assigned to ${zoneId} (+10)`);
    }
  }
  breakdown.zoneAssignmentBonus = zoneAssignmentBonus;
  
  // Battery scoring (weight: 0.3)
  const battery = drone.batteryLevel;
  const batteryScore = battery >= 80 ? 100 : battery >= 60 ? 75 : battery >= 40 ? 50 : 25;
  breakdown.batteryScore = batteryScore;
  reasons.push(`Battery: ${battery}% (${batteryScore}/100)`);
  
  // Proximity scoring (weight: 0.25)
  const distance = calculateDistance(
    drone.currentLat,
    drone.currentLng,
    centerLat,
    centerLng
  );
  const proximityScore = distance < 2 ? 100 : distance < 5 ? 80 : distance < 10 ? 50 : 20;
  reasons.push(`Distance: ${distance.toFixed(2)}km (${proximityScore}/100)`);
  breakdown.distance = distance;
  breakdown.proximityScore = proximityScore;
  
  // Flight time scoring (weight: 0.2)
  const flightHours = drone.flightHoursRemaining;
  const flightScore = Math.min(100, (flightHours / 2.5) * 100); // 2.5 hours = 100 pts
  breakdown.flightTimeScore = flightScore;
  reasons.push(`Flight time: ${flightHours.toFixed(1)}h (${flightScore.toFixed(0)}/100)`);
  
  // Readiness scoring (weight: 0.15)
  const readinessScore = drone.readinessScore;
  breakdown.readinessScore = readinessScore;
  reasons.push(`Readiness: ${readinessScore}/100`);
  
  // Health scoring (weight: 0.1)
  const healthScore = (
    (drone.sensorHealth === 'excellent' ? 100 : drone.sensorHealth === 'good' ? 75 : drone.sensorHealth === 'fair' ? 50 : 25) * 0.4 +
    (drone.motorHealth === 'excellent' ? 100 : drone.motorHealth === 'good' ? 75 : drone.motorHealth === 'fair' ? 50 : 25) * 0.4 +
    (drone.cameraHealth === 'excellent' ? 100 : drone.cameraHealth === 'good' ? 75 : drone.cameraHealth === 'fair' ? 50 : 25) * 0.2
  );
  breakdown.healthScore = healthScore;
  reasons.push(`Health: ${healthScore.toFixed(0)}/100`);
  
  // Weather bonus
  const weatherBonus = drone.weatherSuitable ? 10 : -20;
  breakdown.weatherBonus = weatherBonus;
  reasons.push(`Weather: ${drone.weatherSuitable ? 'suitable' : 'unsuitable'} (${weatherBonus > 0 ? '+' : ''}${weatherBonus})`);
  
  // Availability check
  const availabilityPenalty = drone.isAvailable ? 0 : -50;
  breakdown.availabilityPenalty = availabilityPenalty;
  if (!drone.isAvailable) reasons.push(`Unavailable (${availabilityPenalty})`);
  
  // Adjust weights based on mission type
  let weights = { battery: 0.3, proximity: 0.25, flightTime: 0.2, readiness: 0.15, health: 0.1 };
  
  if (missionType === 'delivery') {
    weights = { battery: 0.25, proximity: 0.35, flightTime: 0.15, readiness: 0.15, health: 0.1 };
  } else if (missionType === 'surveillance') {
    weights = { battery: 0.2, proximity: 0.2, flightTime: 0.35, readiness: 0.15, health: 0.1 };
  }
  
  // Calculate weighted score
  const totalScore = Math.max(0, Math.min(999,
    (batteryScore * weights.battery) +
    (proximityScore * weights.proximity) +
    (flightScore * weights.flightTime) +
    (readinessScore * weights.readiness) +
    (healthScore * weights.health) +
    weatherBonus +
    availabilityPenalty +
    zoneAssignmentBonus
  ));
  
  breakdown.totalScore = Math.round(totalScore);
  breakdown.weights = weights;
  
  return {
    score: Math.round(totalScore),
    reason: reasons.join(' | '),
    breakdown,
  };
}

/**
 * Analyze and rank drones from blockchain
 */
async function analyzeDronesFromBlockchain(
  boundary: { coordinates: Array<{ lat: number; lng: number }> },
  analysisId: string,
  missionType: 'patrol' | 'delivery' | 'surveillance' = 'patrol',
  zoneId?: string
): Promise<Array<{ drone: DroneStatus; score: number; reason: string; breakdown: any }>> {
  console.log(`🚁 Fetching real-time drone status from blockchain...`);
  
  // Fetch all drones from blockchain
  const allDrones = await fetchDroneStatuses();
  
  if (allDrones.length === 0) {
    console.warn('⚠️  No drones found on blockchain');
    return [];
  }
  
  console.log(`📡 Found ${allDrones.length} drones on blockchain`);
  
  // Filter available drones
  const availableDrones = allDrones.filter(drone => drone.isAvailable);
  
  console.log(`✅ ${availableDrones.length} drones available for mission`);
  
  // Debug zone assignment
  if (zoneId) {
    console.log(`🎯 Analyzing for zone: "${zoneId}"`);
    console.log('📋 Drone Zone Assignments:');
    availableDrones.forEach(d => {
      console.log(`   - ${d.cairnDroneId}: assigned to "${d.assignedZoneId}" ${d.assignedZoneId === zoneId ? '✓ MATCH!' : ''}`);
    });
  }
  
  // Score and rank all available drones
  const rankedDrones = availableDrones
    .map(drone => ({
      drone,
      ...scoreDrone(drone, boundary, missionType, zoneId),
    }))
    .sort((a, b) => b.score - a.score);
  
  console.log('🎯 Drone Rankings:');
  rankedDrones.slice(0, 3).forEach((d, i) => {
    console.log(`  ${i + 1}. ${d.drone.cairnDroneId}: ${d.score} pts (Zone: ${d.drone.assignedZoneId})`);
  });
  
  return rankedDrones;
}

export async function POST(req: NextRequest) {
  try {
    const { boundary, analysisId, missionType = 'patrol', zoneId } = await req.json();

    if (!boundary || !boundary.coordinates || boundary.coordinates.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid boundary coordinates" },
        { status: 400 }
      );
    }

    console.log(`🚁 Starting blockchain drone analysis (Zone: ${zoneId || analysisId}, Type: ${missionType})...`);

    // Analyze drones from blockchain
    const rankedDrones = await analyzeDronesFromBlockchain(boundary, analysisId, missionType, zoneId || analysisId);

    if (rankedDrones.length === 0) {
      return NextResponse.json(
        { success: false, error: "No available drones found on blockchain" },
        { status: 404 }
      );
    }

    const topDrone = rankedDrones[0];
    const drone = topDrone.drone;
    
    console.log(`✅ Analysis complete. Top drone: ${drone.cairnDroneId} (Score: ${topDrone.score}/100)`);
    console.log(`   Battery: ${drone.batteryLevel}%, Location: ${drone.currentLat},${drone.currentLng}`);

    return NextResponse.json({
      success: true,
      analysisId,
      missionType,
      timestamp: new Date().toISOString(),
      selectedDrone: {
        cairnDroneId: drone.cairnDroneId,
        evmAddress: drone.evmAddress,
        agentTopicId: drone.agentTopicId,
        score: topDrone.score,
        batteryLevel: drone.batteryLevel,
        distance: topDrone.breakdown.distance,
        location: {
          lat: drone.currentLat,
          lng: drone.currentLng,
        },
        flightHoursRemaining: drone.flightHoursRemaining,
        readinessScore: drone.readinessScore,
        weatherSuitable: drone.weatherSuitable,
      },
      score: topDrone.score,
      summary: {
        totalDrones: rankedDrones.length,
        analyzedDrones: rankedDrones.length,
        topDrone: drone.cairnDroneId,
        topScore: topDrone.score,
        source: 'blockchain',
      },
      analysis: rankedDrones.map(item => ({
        cairnDroneId: item.drone.cairnDroneId,
        evmAddress: item.drone.evmAddress,
        score: item.score,
        reason: item.reason,
        breakdown: item.breakdown,
        status: {
          batteryLevel: item.drone.batteryLevel,
          location: { lat: item.drone.currentLat, lng: item.drone.currentLng },
          flightHoursRemaining: item.drone.flightHoursRemaining,
          readinessScore: item.drone.readinessScore,
          isAvailable: item.drone.isAvailable,
        },
      })),
      boundaryCenter: {
        lat: boundary.coordinates.reduce((sum: number, c: any) => sum + c.lat, 0) / boundary.coordinates.length,
        lng: boundary.coordinates.reduce((sum: number, c: any) => sum + c.lng, 0) / boundary.coordinates.length,
      },
    });
  } catch (error: any) {
    console.error("❌ Blockchain analysis error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Analysis failed" },
      { status: 500 }
    );
  }
}
