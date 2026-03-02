import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const zones = await db.zones.findMany();
    
    return NextResponse.json({
      success: true,
      count: zones.length,
      zones: zones,
    });
  } catch (error: any) {
    console.error("Error fetching zones:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to fetch zones" 
      },
      { status: 500 }
    );
  }
}
