import { NextRequest, NextResponse } from "next/server";

/**
 * DEPRECATED: This endpoint required local database access
 * Agent topics are now stored on the blockchain contract
 */
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: "Deprecated: Database eliminated",
      message: "Agent topics are now stored on-chain via contract updateAgentTopic()"
    },
    { status: 501 }
  );
}

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: "Deprecated: Use GET /api/drones/{id} - agent topic included in contract data",
    },
    { status: 501 }
  );
}
