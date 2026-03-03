import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { isPointInPolygon, findDronesInZone } from "@/lib/geoUtils";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { zoneId } = body;

        if (!zoneId) {
            return Response.json({
                success: false,
                error: "zoneId required"
            }, { status: 400 });
        }

        const zone = await db.zones.findByZoneId(zoneId);
        if (!zone) {
            return Response.json({
                success: false,
                error: "Zone not found in database"
            }, { status: 404 });
        }

        const drones = await db.drones.findMany();
        
        console.log("\n=== MANUAL ZONE MATCHING TEST ===");
        console.log(`Zone: ${zoneId}`);
        console.log(`Boundary Points (${zone.coordinates.length}):`, zone.coordinates);
        console.log(`\nTesting ${drones.length} drones:`);

        const testResults = drones.map(drone => {
            if (!drone.registrationLat || !drone.registrationLng) {
                console.log(`\n❌ ${drone.cairnDroneId}: NO LOCATION DATA`);
                return {
                    droneId: drone.cairnDroneId,
                    location: null,
                    isInside: false,
                    reason: "No location data"
                };
            }

            const dronePoint = {
                lat: drone.registrationLat,
                lng: drone.registrationLng
            };

            console.log(`\n🔍 Testing ${drone.cairnDroneId}:`);
            console.log(`  Location: [${dronePoint.lat}, ${dronePoint.lng}]`);
            console.log(`  Types: lat=${typeof dronePoint.lat}, lng=${typeof dronePoint.lng}`);
            
            const isInside = isPointInPolygon(dronePoint, zone.coordinates);
            
            console.log(`  Result: ${isInside ? '✅ INSIDE' : '❌ OUTSIDE'}`);

            return {
                droneId: drone.cairnDroneId,
                location: dronePoint,
                isInside,
                currentAssignment: drone.assignedZoneId
            };
        });

        const dronesInZone = testResults.filter(r => r.isInside).map(r => r.droneId);

        return Response.json({
            success: true,
            zone: {
                zoneId,
                coordinates: zone.coordinates,
                assignedDrones: zone.assignedDrones
            },
            testResults,
            dronesInZone,
            summary: `${dronesInZone.length} out of ${drones.length} drones are inside the zone`
        });
    } catch (error: any) {
        console.error("Test error:", error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
