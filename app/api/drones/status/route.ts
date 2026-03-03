/**
 * GET /api/drones/status
 * 
 * Mock server that returns real-time drone operational status including:
 * - Battery level
 * - Current location
 * - Flight hours remaining
 * - Sensor health
 * - Weather readiness
 * - Last maintenance
 * 
 * In production, this would connect to actual drone telemetry systems.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface DroneStatus {
  cairnDroneId: string;
  evmAddress: string;
  agentTopicId: string | null;
  
  // Real-time operational data
  batteryLevel: number;          // 0-100%
  currentLat: number;
  currentLng: number;
  altitude: number;              // meters
  
  // Flight capability
  flightHoursRemaining: number;  // hours
  maxRange: number;              // km
  
  // Health metrics
  sensorHealth: "excellent" | "good" | "fair" | "poor";
  motorHealth: "excellent" | "good" | "fair" | "poor";
  cameraHealth: "excellent" | "good" | "fair" | "poor";
  
  // Weather & environment
  weatherSuitable: boolean;
  windSpeed: number;             // km/h
  temperature: number;           // celsius
  
  // Maintenance
  lastMaintenanceDate: string;
  flightsSinceLastMaintenance: number;
  
  // Operational status
  isAvailable: boolean;
  currentMission: string | null;
  readinessScore: number;        // 0-100, calculated score
}

function generateMockDroneStatus(drone: any): DroneStatus {
  // Use drone ID for consistent random generation
  const seed = drone.evmAddress.charCodeAt(drone.evmAddress.length - 1);
  
  const batteryLevel = 60 + (seed % 35); // 60-95%
  const flightHoursRemaining = (batteryLevel / 100) * 2.5; // Max 2.5 hours
  
  // Simulate position near registration point with some drift
  const latDrift = ((seed % 10) - 5) * 0.001;
  const lngDrift = ((seed % 7) - 3) * 0.001;
  const currentLat = drone.registrationLat + latDrift;
  const currentLng = drone.registrationLng + lngDrift;
  
  const healthOptions: ("excellent" | "good" | "fair" | "poor")[] = ["excellent", "good", "good", "fair"];
  const sensorHealth = healthOptions[seed % 4];
  const motorHealth = healthOptions[(seed + 1) % 4];
  const cameraHealth = healthOptions[(seed + 2) % 4];
  
  const weatherSuitable = seed % 5 !== 0; // 80% weather suitable
  const windSpeed = 5 + (seed % 15); // 5-20 km/h
  const temperature = 18 + (seed % 12); // 18-30°C
  
  const flightsSinceLastMaintenance = seed % 50;
  const daysSinceLastMaintenance = seed % 30;
  const lastMaintenanceDate = new Date(Date.now() - daysSinceLastMaintenance * 24 * 60 * 60 * 1000).toISOString();
  
  const isAvailable = drone.status === "ACTIVE" && 
                     batteryLevel > 30 && 
                     weatherSuitable &&
                     !drone.currentMission;
  
  // Calculate readiness score (0-100)
  let readinessScore = 0;
  readinessScore += batteryLevel * 0.3;  // 30% weight
  readinessScore += (sensorHealth === "excellent" ? 25 : sensorHealth === "good" ? 20 : sensorHealth === "fair" ? 10 : 0);
  readinessScore += (motorHealth === "excellent" ? 25 : motorHealth === "good" ? 20 : motorHealth === "fair" ? 10 : 0);
  readinessScore += (weatherSuitable ? 15 : 0);
  readinessScore += (flightsSinceLastMaintenance < 25 ? 10 : 5);
  readinessScore = Math.min(100, Math.round(readinessScore));
  
  return {
    cairnDroneId: drone.cairnDroneId,
    evmAddress: drone.evmAddress,
    agentTopicId: drone.agentTopicId || null,
    
    batteryLevel,
    currentLat,
    currentLng,
    altitude: seed % 100, // 0-100m
    
    flightHoursRemaining,
    maxRange: 12, // km
    
    sensorHealth,
    motorHealth,
    cameraHealth,
    
    weatherSuitable,
    windSpeed,
    temperature,
    
    lastMaintenanceDate,
    flightsSinceLastMaintenance,
    
    isAvailable,
    currentMission: null,
    readinessScore,
  };
}

export async function GET(req: NextRequest) {
  try {
    const drones = await db.drones.findMany();
    
    const droneStatuses: DroneStatus[] = drones.map(drone => 
      generateMockDroneStatus(drone)
    );
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: droneStatuses.length,
      statuses: droneStatuses,
    });
  } catch (error: any) {
    console.error("Error fetching drone status:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
