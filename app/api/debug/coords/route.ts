import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const drones = await db.drones.findMany();
        
        const dronesInfo = drones.map(d => ({
            cairnDroneId: d.cairnDroneId,
            lat: d.registrationLat,
            lng: d.registrationLng,
            latType: typeof d.registrationLat,
            lngType: typeof d.registrationLng,
            assignedZoneId: d.assignedZoneId
        }));

        const zones = await db.zones.findMany();
        
        const zonesInfo = zones.map(z => ({
            zoneId: z.zoneId,
            name: z.name,
            coordinates: z.coordinates,
            assignedDrones: z.assignedDrones
        }));

        return Response.json({
            success: true,
            drones: dronesInfo,
            zones: zonesInfo,
            droneCount: drones.length,
            zoneCount: zones.length
        });
    } catch (error: any) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
