/**
 * droneSelector.ts
 * 
 * Advanced drone selection algorithm that evaluates multiple criteria:
 * - Battery level and flight time remaining
 * - Proximity to boundary zone
 * - Health metrics (sensors, motors, camera)
 * - Weather suitability
 * - Maintenance status
 * - Agent validation status (HCS topic verified)
 */

interface DroneStatus {
  cairnDroneId: string;
  evmAddress: string;
  agentTopicId: string | null;
  
  batteryLevel: number;
  currentLat: number;
  currentLng: number;
  altitude: number;
  
  flightHoursRemaining: number;
  maxRange: number;
  
  sensorHealth: "excellent" | "good" | "fair" | "poor";
  motorHealth: "excellent" | "good" | "fair" | "poor";
  cameraHealth: "excellent" | "good" | "fair" | "poor";
  
  weatherSuitable: boolean;
  windSpeed: number;
  temperature: number;
  
  lastMaintenanceDate: string;
  flightsSinceLastMaintenance: number;
  
  isAvailable: boolean;
  currentMission: string | null;
  readinessScore: number;
}

interface BoundaryInfo {
  zoneId: string;
  coordinates: { lat: number; lng: number }[];
}

interface DroneScore {
  drone: DroneStatus;
  totalScore: number;
  breakdown: {
    batteryScore: number;
    proximityScore: number;
    healthScore: number;
    weatherScore: number;
    maintenanceScore: number;
    agentScore: number;
  };
  disqualified: boolean;
  disqualificationReason?: string;
}

/**
 * Calculate the centroid (center point) of a polygon
 */
function calculateCentroid(coordinates: { lat: number; lng: number }[]): { lat: number; lng: number } {
  if (coordinates.length === 0) return { lat: 0, lng: 0 };
  
  const sum = coordinates.reduce(
    (acc, coord) => ({
      lat: acc.lat + coord.lat,
      lng: acc.lng + coord.lng,
    }),
    { lat: 0, lng: 0 }
  );
  
  return {
    lat: sum.lat / coordinates.length,
    lng: sum.lng / coordinates.length,
  };
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula (in km)
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Score a drone's battery level (0-100)
 */
function scoreBattery(drone: DroneStatus): number {
  if (drone.batteryLevel < 30) return 0;
  if (drone.batteryLevel < 50) return 40;
  if (drone.batteryLevel < 70) return 70;
  return 100;
}

/**
 * Score proximity to the target zone (0-100)
 */
function scoreProximity(drone: DroneStatus, zoneCentroid: { lat: number; lng: number }): number {
  const distance = calculateDistance(
    drone.currentLat,
    drone.currentLng,
    zoneCentroid.lat,
    zoneCentroid.lng
  );
  
  // Within 2km = 100 pts, 5km = 80pts, 10km = 50pts, >20km = 0pts
  if (distance < 2) return 100;
  if (distance < 5) return 80;
  if (distance < 10) return 50;
  if (distance < 20) return 20;
  return 0;
}

/**
 * Score health metrics (0-100)
 */
function scoreHealth(drone: DroneStatus): number {
  const healthMap = { excellent: 100, good: 75, fair: 40, poor: 0 };
  
  const sensorScore = healthMap[drone.sensorHealth];
  const motorScore = healthMap[drone.motorHealth];
  const cameraScore = healthMap[drone.cameraHealth];
  
  // Weighted average: motor (40%), sensor (35%), camera (25%)
  return motorScore * 0.4 + sensorScore * 0.35 + cameraScore * 0.25;
}

/**
 * Score weather suitability (0-100)
 */
function scoreWeather(drone: DroneStatus): number {
  if (!drone.weatherSuitable) return 0;
  
  let score = 100;
  
  // Penalize high winds
  if (drone.windSpeed > 25) score -= 40;
  else if (drone.windSpeed > 15) score -= 20;
  
  // Penalize extreme temperatures
  if (drone.temperature < 5 || drone.temperature > 40) score -= 30;
  else if (drone.temperature < 10 || drone.temperature > 35) score -= 15;
  
  return Math.max(0, score);
}

/**
 * Score maintenance status (0-100)
 */
function scoreMaintenance(drone: DroneStatus): number {
  // Recent maintenance = higher score
  const daysSinceMaintenance = Math.floor(
    (Date.now() - new Date(drone.lastMaintenanceDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  let score = 100;
  
  if (daysSinceMaintenance > 60) score = 20;
  else if (daysSinceMaintenance > 30) score = 60;
  else if (daysSinceMaintenance > 14) score = 85;
  
  // Penalize high flight count since maintenance
  if (drone.flightsSinceLastMaintenance > 100) score -= 40;
  else if (drone.flightsSinceLastMaintenance > 50) score -= 20;
  
  return Math.max(0, score);
}

/**
 * Score agent validation (0-100)
 * Verified HCS agent = 100pts, no agent = 50pts (legacy mode)
 */
function scoreAgent(drone: DroneStatus, agentValidated: boolean): number {
  if (!drone.agentTopicId) return 50; // Legacy drone, still usable but not preferred
  if (agentValidated) return 100;
  return 30; // Has topic but not validated
}

/**
 * Select the best drone for a mission based on multiple weighted criteria
 */
export function selectBestDrone(
  drones: DroneStatus[],
  boundary: BoundaryInfo,
  agentValidationMap: Map<string, boolean> // Map of evmAddress -> isValidated
): DroneScore | null {
  if (drones.length === 0) return null;
  
  const zoneCentroid = calculateCentroid(boundary.coordinates);
  
  const scores: DroneScore[] = drones.map((drone) => {
    // Check disqualification criteria
    if (!drone.isAvailable) {
      return {
        drone,
        totalScore: 0,
        breakdown: { batteryScore: 0, proximityScore: 0, healthScore: 0, weatherScore: 0, maintenanceScore: 0, agentScore: 0 },
        disqualified: true,
        disqualificationReason: "Drone not available",
      };
    }
    
    if (drone.batteryLevel < 30) {
      return {
        drone,
        totalScore: 0,
        breakdown: { batteryScore: 0, proximityScore: 0, healthScore: 0, weatherScore: 0, maintenanceScore: 0, agentScore: 0 },
        disqualified: true,
        disqualificationReason: "Battery too low (<30%)",
      };
    }
    
    if (!drone.weatherSuitable) {
      return {
        drone,
        totalScore: 0,
        breakdown: { batteryScore: 0, proximityScore: 0, healthScore: 0, weatherScore: 0, maintenanceScore: 0, agentScore: 0 },
        disqualified: true,
        disqualificationReason: "Weather unsuitable",
      };
    }
    
    // Calculate individual scores
    const batteryScore = scoreBattery(drone);
    const proximityScore = scoreProximity(drone, zoneCentroid);
    const healthScore = scoreHealth(drone);
    const weatherScore = scoreWeather(drone);
    const maintenanceScore = scoreMaintenance(drone);
    const agentScore = scoreAgent(drone, agentValidationMap.get(drone.evmAddress) || false);
    
    // Weighted total score
    const totalScore =
      batteryScore * 0.25 +      // 25% weight
      proximityScore * 0.20 +    // 20% weight
      healthScore * 0.25 +       // 25% weight
      weatherScore * 0.10 +      // 10% weight
      maintenanceScore * 0.10 +  // 10% weight
      agentScore * 0.10;         // 10% weight
    
    return {
      drone,
      totalScore: Math.round(totalScore),
      breakdown: {
        batteryScore: Math.round(batteryScore),
        proximityScore: Math.round(proximityScore),
        healthScore: Math.round(healthScore),
        weatherScore: Math.round(weatherScore),
        maintenanceScore: Math.round(maintenanceScore),
        agentScore: Math.round(agentScore),
      },
      disqualified: false,
    };
  });
  
  // Filter out disqualified drones
  const qualifiedScores = scores.filter((s) => !s.disqualified);
  
  if (qualifiedScores.length === 0) {
    console.warn("⚠️  No qualified drones found");
    return null;
  }
  
  // Sort by totalScore descending
  qualifiedScores.sort((a, b) => b.totalScore - a.totalScore);
  
  return qualifiedScores[0];
}
