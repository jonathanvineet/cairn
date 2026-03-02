import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const drones = await db.drones.findMany();
    
    return Response.json({
      success: true,
      drones,
      count: drones.length,
    });
  } catch (error: any) {
    console.error("Error in GET /api/drones:", error);
    return Response.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
