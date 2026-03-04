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
import { fetchDronesFromBlockchain } from "@/lib/droneBlockchainFetcher";

export async function GET(req: NextRequest) {
  try {
    const statuses = await fetchDronesFromBlockchain();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: statuses.length,
      statuses,
    });
  } catch (error: any) {
    console.error("Error fetching drone status:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
