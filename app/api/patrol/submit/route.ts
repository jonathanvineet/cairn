import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";

// You'll need to install these packages:
// npm install ipfs-http-client
// or use Pinata/Web3.Storage SDK

interface PatrolData {
  droneId: string;
  zoneId: string;
  timestamp: number;
  coordinates: Array<{ lat: number; lon: number }>;
  images: string[];
  breaches: Array<{
    lat: number;
    lon: number;
    image: string;
  }>;
}

// Mock IPFS upload function - replace with actual IPFS implementation
async function uploadToIPFS(data: any): Promise<string> {
  // For now, return a mock CID
  // In production, use ipfs-http-client, Pinata, or Web3.Storage
  const mockCID = `bafybei${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  
  console.log("📤 Uploading to IPFS:", JSON.stringify(data, null, 2));
  console.log("✅ Mock IPFS CID:", mockCID);
  
  return mockCID;
}

async function uploadImageToIPFS(imagePath: string): Promise<string> {
  // Read the image file
  const imageBuffer = fs.readFileSync(imagePath);
  
  // Upload to IPFS (mock for now)
  const mockImageCID = `bafybeih${Math.random().toString(36).substring(2, 15)}`;
  
  console.log("📸 Uploading image to IPFS:", imagePath);
  console.log("✅ Mock Image CID:", mockImageCID);
  
  return mockImageCID;
}

function createDataHash(patrolData: PatrolData): string {
  const dataString = JSON.stringify(patrolData);
  return ethers.keccak256(ethers.toUtf8Bytes(dataString));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { droneId, zoneId, imagePath } = body;

    console.log("🚁 Starting patrol submission for:", droneId, zoneId);

    // Step 1: Upload breach image to IPFS
    const breachImageCID = await uploadImageToIPFS(imagePath);

    // Step 2: Create patrol data structure
    const patrolData: PatrolData = {
      droneId: droneId || "DRONE_12",
      zoneId: zoneId || "ZONE_A",
      timestamp: Math.floor(Date.now() / 1000),
      coordinates: [
        { lat: 12.91321, lon: 80.22321 },
        { lat: 12.91345, lon: 80.22356 },
        { lat: 12.91367, lon: 80.22389 },
        { lat: 12.91332, lon: 80.22402 }
      ],
      images: [
        breachImageCID,
        `bafybei${Math.random().toString(36).substring(2, 15)}`,
        `bafybei${Math.random().toString(36).substring(2, 15)}`
      ],
      breaches: [
        {
          lat: 12.91345,
          lon: 80.22356,
          image: breachImageCID
        }
      ]
    };

    // Step 3: Upload patrol JSON to IPFS
    const patrolDataCID = await uploadToIPFS(patrolData);

    // Step 4: Create data hash for blockchain verification
    const dataHash = createDataHash(patrolData);

    console.log("📦 Patrol Data CID:", patrolDataCID);
    console.log("🔒 Data Hash:", dataHash);

    // Step 5: Wait 30 seconds, then submit to blockchain
    console.log("⏳ Waiting 30 seconds before blockchain submission...");
    
    setTimeout(async () => {
      try {
        console.log("📡 Submitting to blockchain...");
        
        // Call the blockchain submission endpoint
        const blockchainResponse = await fetch("http://localhost:3000/api/patrol/blockchain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            droneId: patrolData.droneId,
            zoneId: patrolData.zoneId,
            ipfsCid: patrolDataCID,
            dataHash: dataHash
          })
        });

        const result = await blockchainResponse.json();
        console.log("✅ Blockchain submission result:", result);
      } catch (error) {
        console.error("❌ Blockchain submission error:", error);
      }
    }, 30000);

    // Return immediate response with IPFS data
    return NextResponse.json({
      success: true,
      message: "Patrol data uploaded to IPFS. Blockchain submission scheduled in 30 seconds.",
      patrolData,
      ipfsCid: patrolDataCID,
      dataHash: dataHash,
      breachImageCID,
      blockchainSubmissionIn: "30 seconds"
    });

  } catch (error) {
    console.error("❌ Patrol submission error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to submit patrol" 
      },
      { status: 500 }
    );
  }
}
