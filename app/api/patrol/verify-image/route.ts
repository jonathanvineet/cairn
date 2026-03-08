import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imagePath, expectedHash } = body;

    console.log("🔍 Verifying image integrity...");
    console.log("   Image Path:", imagePath);
    console.log("   Expected Hash:", expectedHash);

    // Convert relative path to absolute if needed
    let absolutePath = imagePath;
    if (imagePath.startsWith('/breach-evidence/')) {
      const filename = imagePath.split('/').pop();
      absolutePath = path.join(process.cwd(), 'public', 'breach-evidence', filename || '');
    }

    // Read the image
    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({
        success: false,
        verified: false,
        error: "Image not found on server"
      });
    }

    const imageBuffer = fs.readFileSync(absolutePath);
    
    // Calculate current hash
    const currentHash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
    const prefixedCurrentHash = `0x${currentHash}`;

    // Clean expected hash (remove 0x prefix if present)
    const cleanExpectedHash = expectedHash.startsWith('0x') ? expectedHash : `0x${expectedHash}`;

    // Compare hashes
    const isMatch = prefixedCurrentHash.toLowerCase() === cleanExpectedHash.toLowerCase();

    console.log("   Current Hash:", prefixedCurrentHash);
    console.log("   Match:", isMatch ? "✅ VERIFIED" : "❌ TAMPERED");

    return NextResponse.json({
      success: true,
      verified: isMatch,
      currentHash: prefixedCurrentHash,
      expectedHash: cleanExpectedHash,
      message: isMatch 
        ? "✅ Image integrity verified! The image matches the blockchain hash." 
        : "❌ Image has been tampered with! Hash does not match blockchain."
    });

  } catch (error: any) {
    console.error("❌ Verification error:", error);
    return NextResponse.json(
      { 
        success: false, 
        verified: false,
        error: error.message || "Failed to verify image"
      },
      { status: 500 }
    );
  }
}
