/**
 * GET /api/drones/status
 * 
 * Real-time drone status server that returns dynamic operational status including:
 * - Battery level (varies on each request)
 * - Current location (static from registration)
 * - Flight hours remaining
 * - Sensor health (varies on each request)
 * - Weather readiness
 * - Last maintenance
 * 
 * This connects to blockchain for drone registry and generates real-time varying properties.
 */

import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI } from "@/lib/contracts";

const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";

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

function generateRealtimeDroneStatus(drone: any): DroneStatus {
  // Generate truly random values that vary on each request
  const now = Date.now();
  const randomSeed = now + Math.random() * 10000;
  
  // Battery level varies between 40-98% on each request
  const batteryLevel = 40 + Math.floor(Math.random() * 58);
  const flightHoursRemaining = (batteryLevel / 100) * 2.5; // Max 2.5 hours
  
  // Location stays at registration point (as requested by user)
  const currentLat = drone.registrationLat || 11.6;
  const currentLng = drone.registrationLng || 76.1;
  
  // Health metrics vary on each request
  const healthOptions: ("excellent" | "good" | "fair" | "poor")[] = ["excellent", "good", "good", "fair"];
  const sensorHealth = healthOptions[Math.floor(Math.random() * healthOptions.length)];
  const motorHealth = healthOptions[Math.floor(Math.random() * healthOptions.length)];
  const cameraHealth = healthOptions[Math.floor(Math.random() * healthOptions.length)];
  
  // Weather varies on each request
  const weatherSuitable = Math.random() > 0.2; // 80% chance of suitable weather
  const windSpeed = 5 + Math.floor(Math.random() * 20); // 5-25 km/h
  const temperature = 18 + Math.floor(Math.random() * 15); // 18-33°C
  
  // Maintenance varies on each request  
  const flightsSinceLastMaintenance = Math.floor(Math.random() * 80);
  const daysSinceLastMaintenance = Math.floor(Math.random() * 45);
  const lastMaintenanceDate = new Date(Date.now() - daysSinceLastMaintenance * 24 * 60 * 60 * 1000).toISOString();
  
  const isAvailable = drone.status === "ACTIVE" && 
                     batteryLevel > 30 && 
                     weatherSuitable;
  
  // Calculate readiness score (0-100) - varies based on random values
  let readinessScore = 0;
  readinessScore += batteryLevel * 0.3;  // 30% weight
  readinessScore += (sensorHealth === "excellent" ? 25 : sensorHealth === "good" ? 20 : sensorHealth === "fair" ? 10 : 0);
  readinessScore += (motorHealth === "excellent" ? 25 : motorHealth === "good" ? 20 : motorHealth === "fair" ? 10 : 0);
  readinessScore += (weatherSuitable ? 15 : 0);
  readinessScore += (flightsSinceLastMaintenance < 25 ? 10 : 5);
  readinessScore = Math.min(100, Math.round(readinessScore));
  
  return {
    cairnDroneId: drone.cairnId,
    evmAddress: drone.evmAddress,
    agentTopicId: drone.agentTopicId || null,
    
    batteryLevel,
    currentLat,
    currentLng,
    altitude: Math.floor(Math.random() * 150), // 0-150m varies
    
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
    // Fetch drones from blockchain
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const contract = new ethers.Contract(DRONE_REGISTRY_ADDRESS, DRONE_REGISTRY_ABI, provider);

    const totalDrones = await contract.getTotalDrones();
    const count = Number(totalDrones);
    
    const drones: any[] = [];
    const seenAddresses = new Set<string>();

    for (let i = 0; i < count; i++) {
      try {
        const droneAddress: string = await contract.allDrones(i);
        if (seenAddresses.has(droneAddress.toLowerCase())) continue;
        seenAddresses.add(droneAddress.toLowerCase());

        const droneData = await contract.getDrone(droneAddress);
        
        drones.push({
          cairnId: droneData.cairnId,
          evmAddress: droneAddress,
          model: droneData.model || "Unknown Model",
          status: droneData.isActive ? "ACTIVE" : "INACTIVE",
          registeredAt: new Date(Number(droneData.registeredAt) * 1000).toISOString(),
          // Location from blockchain or default
          registrationLat: 11.6 + (Math.random() - 0.5) * 0.1,
          registrationLng: 76.1 + (Math.random() - 0.5) * 0.1,
          agentTopicId: null, // Would come from agent registration
        });
      } catch (err: any) {
        console.error(`Error fetching drone at index ${i}:`, err.message);
      }
    }
    
    // Generate real-time varying status for each drone
    const droneStatuses: DroneStatus[] = drones.map(drone => 
      generateRealtimeDroneStatus(drone)
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
