// Point-in-polygon utility using ray casting algorithm
export function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: { lat: number; lng: number }[]
): boolean {
  if (polygon.length < 3) {
    console.log(`    ⚠️  Polygon has < 3 points (${polygon.length})`);
    return false;
  }

  let inside = false;
  const x = point.lng;
  const y = point.lat;

  console.log(`    🧮 Ray-casting from point [${y}, ${x}]`);
  let intersections = 0;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
      intersections++;
    }
  }

  console.log(`    📊 Intersections: ${intersections}, Inside: ${inside}`);
  return inside;
}

// Calculate distance between two points (in kilometers)
export function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) *
      Math.cos(toRadians(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Calculate center point of a polygon
export function calculatePolygonCenter(
  polygon: { lat: number; lng: number }[]
): { lat: number; lng: number } {
  if (polygon.length === 0) {
    return { lat: 0, lng: 0 };
  }

  let totalLat = 0;
  let totalLng = 0;

  for (const point of polygon) {
    totalLat += point.lat;
    totalLng += point.lng;
  }

  return {
    lat: totalLat / polygon.length,
    lng: totalLng / polygon.length,
  };
}

// Find drones within a boundary zone
export function findDronesInZone(
  drones: Array<{ cairnDroneId: string; registrationLat: number; registrationLng: number; assignedZoneId?: string }>,
  zoneCoordinates: { lat: number; lng: number }[]
): string[] {
  const dronesInZone: string[] = [];

  console.log(`\n🎯 Starting zone matching with ${drones.length} drones and ${zoneCoordinates.length} boundary points`);
  console.log(`📍 Zone boundary:`, zoneCoordinates.map(c => `[${c.lat}, ${c.lng}]`).join(', '));

  for (const drone of drones) {
    if (!drone.registrationLat || !drone.registrationLng) {
      console.log(`  ⏭️  ${drone.cairnDroneId}: Skipping (no location data)`);
      continue;
    }

    const droneLocation = {
      lat: drone.registrationLat,
      lng: drone.registrationLng,
    };

    console.log(`  🔍 Testing ${drone.cairnDroneId} at [${droneLocation.lat}, ${droneLocation.lng}]`);
    
    const isInside = isPointInPolygon(droneLocation, zoneCoordinates);
    console.log(`    → Result: ${isInside ? '✅ INSIDE' : '❌ OUTSIDE'}`);

    if (isInside) {
      dronesInZone.push(drone.cairnDroneId);
    }
  }

  return dronesInZone;
}
