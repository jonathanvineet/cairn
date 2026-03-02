import { NextRequest } from "next/server";

// Drone-to-zone assignment is not stored in the current on-chain contract.
// To enable this, add an assignDrone(bytes32 zoneId, address drone) function
// to BoundaryZoneRegistry and redeploy.
export async function POST(req: NextRequest) {
  return Response.json(
    {
      success: false,
      error: "Drone assignment is not supported by the current on-chain contract.",
    },
    { status: 501 }
  );
}
