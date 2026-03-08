import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceImagePath, droneId, zoneId } = body;

    console.log("📸 Storing breach evidence image...");
    console.log("   Source:", sourceImagePath);
    console.log("   Drone:", droneId);
    console.log("   Zone:", zoneId);

    // Read the image from the source path
    if (!fs.existsSync(sourceImagePath)) {
      throw new Error(`Image not found at ${sourceImagePath}`);
    }

    const imageBuffer = fs.readFileSync(sourceImagePath);
    console.log(`✅ Image loaded: ${imageBuffer.length} bytes`);

    // Calculate SHA256 hash of the image
    const imageHash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
    const prefixedHash = `0x${imageHash}`;
    console.log("🔒 Image Hash:", prefixedHash);

    // Create evidence storage directory if it doesn't exist
    const evidenceDir = path.join(process.cwd(), 'public', 'breach-evidence');
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
      console.log("📁 Created evidence directory");
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `breach-${droneId.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}.jpg`;
    const destinationPath = path.join(evidenceDir, filename);

    // Copy image to server
    fs.copyFileSync(sourceImagePath, destinationPath);
    console.log("✅ Image stored at:", destinationPath);

    // Public URL for accessing the image
    const publicUrl = `/breach-evidence/${filename}`;

    return NextResponse.json({
      success: true,
      imageHash: prefixedHash,
      imagePath: destinationPath,
      publicUrl: publicUrl,
      filename: filename,
      size: imageBuffer.length,
      timestamp: timestamp
    });

  } catch (error: any) {
    console.error("❌ Image storage error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to store image"
      },
      { status: 500 }
    );
  }
}
