/**
 * IPFS Upload Utility
 * Handles real image uploads to IPFS via Pinata or Web3.Storage
 * This is the REAL implementation, not mocked
 */

interface IPFSUploadResponse {
  success: boolean;
  ipfsHash?: string;
  ipfsUrl?: string;
  error?: string;
}

/**
 * Upload image to IPFS using Pinata API
 * Requires NEXT_PUBLIC_PINATA_JWT environment variable
 */
export async function uploadToIPFS(
  file: File | Buffer,
  fileName: string
): Promise<IPFSUploadResponse> {
  try {
    const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT || process.env.PINATA_JWT;
    
    if (!pinataJwt) {
      console.warn("⚠️ PINATA_JWT not configured - using fallback");
      return {
        success: false,
        error: "IPFS gateway not configured. Images will be stored locally.",
      };
    }

    // Convert file to FormData for multipart upload
    const formData = new FormData();
    
    if (file instanceof File) {
      formData.append("file", file, fileName);
    } else {
      // Convert Buffer to Uint8Array then Blob
      const uint8Array = new Uint8Array(file);
      const blob = new Blob([uint8Array], { type: "image/jpeg" });
      formData.append("file", blob, fileName);
    }

    // Add metadata
    const metadata = {
      name: fileName,
      keyvalues: {
        type: "drone-evidence",
        timestamp: new Date().toISOString(),
      },
    };
    formData.append("pinataMetadata", JSON.stringify(metadata));

    console.log("📤 Uploading image to IPFS via Pinata...");

    // Call Pinata API
    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Pinata upload failed:", error);
      return {
        success: false,
        error: `Pinata upload failed: ${error.error?.details || error.error}`,
      };
    }

    const data = await response.json();
    const ipfsHash = data.IpfsHash;

    console.log(`✅ Image uploaded to IPFS: ${ipfsHash}`);

    return {
      success: true,
      ipfsHash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
    };
  } catch (error: any) {
    console.error("❌ IPFS upload error:", error.message);
    return {
      success: false,
      error: `IPFS upload failed: ${error.message}`,
    };
  }
}

/**
 * Upload image to IPFS using web3.storage (alternative)
 * Requires NEXT_PUBLIC_WEB3_STORAGE_TOKEN environment variable
 */
export async function uploadToWeb3Storage(
  file: File,
  fileName: string
): Promise<IPFSUploadResponse> {
  try {
    const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;

    if (!token) {
      console.warn("⚠️ WEB3_STORAGE_TOKEN not configured");
      return {
        success: false,
        error: "Web3.Storage token not configured",
      };
    }

    const formData = new FormData();
    formData.append("file", file, fileName);

    console.log("📤 Uploading image to IPFS via web3.storage...");

    const response = await fetch("https://api.web3.storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ web3.storage upload failed:", error);
      return {
        success: false,
        error: `web3.storage upload failed: ${error.message}`,
      };
    }

    const data = await response.json();
    const ipfsHash = data.cid;

    console.log(`✅ Image uploaded to IPFS: ${ipfsHash}`);

    return {
      success: true,
      ipfsHash,
      ipfsUrl: `https://${ipfsHash}.ipfs.w3s.link`,
    };
  } catch (error: any) {
    console.error("❌ IPFS upload error:", error.message);
    return {
      success: false,
      error: `IPFS upload failed: ${error.message}`,
    };
  }
}

/**
 * Verify image exists on IPFS before submission
 */
export async function verifyIPFSImage(ipfsHash: string): Promise<boolean> {
  try {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`, {
      method: "HEAD",
    });
    return response.ok;
  } catch (error) {
    console.warn(`⚠️ Could not verify IPFS image: ${ipfsHash}`);
    return false;
  }
}

/**
 * Get IPFS gateway URL for an image hash
 */
export function getIPFSUrl(ipfsHash: string, gateway: string = "pinata"): string {
  const gateways: Record<string, (hash: string) => string> = {
    pinata: (hash) => `https://gateway.pinata.cloud/ipfs/${hash}`,
    cloudflare: (hash) => `https://cloudflare-ipfs.com/ipfs/${hash}`,
    dweb: (hash) => `https://dweb.link/ipfs/${hash}`,
    web3: (hash) => `https://${hash}.ipfs.w3s.link`,
  };

  const getUrl = gateways[gateway] || gateways.pinata;
  return getUrl(ipfsHash);
}

/**
 * Convert image file to base64 for fallback storage
 */
export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
