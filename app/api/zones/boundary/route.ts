import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { zoneId, coordinates } = body;

    // Validation
    if (!zoneId || typeof zoneId !== "string") {
      return Response.json(
        { success: false, error: "Invalid or missing zoneId" },
        { status: 400 }
      );
    }

    if (!Array.isArray(coordinates) || coordinates.length < 3) {
      return Response.json(
        { success: false, error: "Invalid coordinates. Need at least 3 points." },
        { status: 400 }
      );
    }

    // Validate coordinate format: each should have lat and lng
    for (const coord of coordinates) {
      if (typeof coord.lat !== "number" || typeof coord.lng !== "number") {
        return Response.json(
          { success: false, error: "Invalid coordinate format. Each coordinate must have lat and lng." },
          { status: 400 }
        );
      }
    }

    // Check if zone already exists
    const existingZone = await db.zones.findByZoneId(zoneId);

    // Find all drones that were registered for this zone
    const allDrones = await db.drones.findMany();
    const dronesForThisZone = allDrones
      .filter((drone: any) => drone.assignedZoneId === zoneId)
      .map((drone: any) => drone.cairnDroneId);

    console.log(`🤖 Auto-assigning ${dronesForThisZone.length} drones to zone ${zoneId}:`, dronesForThisZone);

    if (existingZone) {
      // Update existing zone with new boundary and auto-assigned drones
      const updated = await db.zones.update(zoneId, {
        coordinates: coordinates,
        assignedDrones: dronesForThisZone,
      });

      if (!updated) {
        return Response.json(
          { success: false, error: "Failed to update zone boundary" },
          { status: 500 }
        );
      }

      return Response.json({
        success: true,
        message: "Zone boundary updated",
        zone: updated,
        autoAssignedDrones: dronesForThisZone,
        autoAssignedCount: dronesForThisZone.length,
      });
    } else {
      // Create new zone with auto-assigned drones
      const newZone = await db.zones.create({
        zoneId,
        name: `Zone ${zoneId}`,
        coordinates: coordinates,
        assignedDrones: dronesForThisZone,
        createdAt: new Date(),
      });

      return Response.json({
        success: true,
        message: "Zone boundary created",
        zone: newZone,
        autoAssignedDrones: dronesForThisZone,
        autoAssignedCount: dronesForThisZone.length,
      }, { status: 201 });
    }
  } catch (error: any) {
    console.error("Error in POST /api/zones/boundary:", error);
    return Response.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
