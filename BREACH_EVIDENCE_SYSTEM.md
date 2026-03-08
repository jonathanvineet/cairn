# Breach Evidence Storage System

## Overview
This system stores drone patrol breach evidence images on the server while storing cryptographic hashes on the Hedera blockchain for tamper-proof verification.

## How It Works

### 1. **Patrol Submission Flow** (After 30s Gazebo Countdown)

```
User clicks DEPLOY
   ↓
30 second countdown (Gazebo simulation)
   ↓
Frontend calls /api/patrol/store-image
   ↓
Image copied from local path to server:
   Source: C:\Users\hp\Documents\broken-metallic-fence.jpg
   Destination: public/breach-evidence/breach-[droneId]-[timestamp].jpg
   ↓
Calculate SHA256 hash of image:
   Hash: 0x8a7f3e2d4b1c... (32 bytes)
   ↓
Store hash on Hedera blockchain:
   Contract: submitPatrol(droneId, zoneId, ipfsCid, imageHash)
   ↓
Display image + hash in UI
```

### 2. **Image Verification**

Anyone can verify image integrity:

```javascript
// Get image from server
const imageBuffer = fs.readFileSync('public/breach-evidence/breach-123.jpg');

// Calculate current hash
const currentHash = crypto.createHash('sha256').update(imageBuffer).digest('hex');

// Fetch hash from blockchain
const blockchainHash = await contract.getPatrol(patrolId);

// Compare
if (currentHash === blockchainHash) {
  console.log("✅ Image is authentic!");
} else {
  console.log("❌ Image was tampered with!");
}
```

### 3. **API Endpoints**

#### `/api/patrol/store-image` (POST)
Stores image on server and returns hash
```json
Request:
{
  "sourceImagePath": "C:\\Users\\hp\\Documents\\broken-metallic-fence.jpg",
  "droneId": "DRONE_12",
  "zoneId": "ZONE_A"
}

Response:
{
  "success": true,
  "imageHash": "0x8a7f3e2d...",
  "publicUrl": "/breach-evidence/breach-DRONE_12-1234567890.jpg",
  "size": 152384
}
```

#### `/api/patrol/blockchain` (POST)
Submits patrol with image hash to blockchain
```json
Request:
{
  "droneId": "DRONE_12",
  "zoneId": "ZONE_A",
  "ipfsCid": "bafybei...",
  "dataHash": "0x8a7f3e2d..."  // Real image hash
}

Response:
{
  "success": true,
  "transactionId": "0.0.8008987@1772971551.298877674",
  "status": "SUCCESS"
}
```

#### `/api/patrol/verify-image` (POST)
Verifies image hasn't been tampered with
```json
Request:
{
  "imagePath": "/breach-evidence/breach-DRONE_12-1234567890.jpg",
  "expectedHash": "0x8a7f3e2d..."
}

Response:
{
  "success": true,
  "verified": true,
  "message": "✅ Image integrity verified!"
}
```

## Why This Architecture?

### ❌ **Can't Store Images Directly on Blockchain**
- Blockchain storage is EXTREMELY expensive ($$$)
- 1 MB file = thousands of dollars in gas fees
- Hedera is optimized for transactions, not file storage

### ✅ **Hybrid Approach (Industry Standard)**
- **Blockchain**: Stores hash (32 bytes) = cheap
- **Server**: Stores actual image = free
- **Result**: Tamper-proof + Cost-effective

## Security Properties

1. **Immutable Proof**: Once hash is on blockchain, it can't be changed
2. **Cryptographic Verification**: SHA256 ensures any change = different hash
3. **Decentralized Trust**: Anyone can verify, no central authority needed
4. **Evidence Chain**: Timestamp + drone + zone + hash = complete audit trail

## Example Use Case

**Scenario**: Border patrol drone detects fence breach

1. Drone captures image at 2:30 PM
2. Image stored on CAIRN server
3. Hash submitted to Hedera blockchain (Transaction: 0.0.8008987@...)
4. 6 months later, court case needs evidence
5. Lawyer downloads image from server
6. Lawyer re-hashes image → gets same hash
7. Lawyer checks blockchain → hash matches
8. **Proof**: Image unchanged since capture = admissible evidence

## Technical Details

- **Hash Algorithm**: SHA-256 (industry standard)
- **Hash Size**: 32 bytes (64 hex characters)
- **Blockchain**: Hedera Testnet
- **Storage**: Node.js filesystem (public/breach-evidence/)
- **Image Format**: JPEG (can support PNG, WebP)

## Development Notes

- Mock image path: `C:\Users\hp\Documents\broken-metallic-fence.jpg`
- Server storage: `public/breach-evidence/`
- Images are NOT committed to git (see .gitignore)
- Folder structure is preserved via .gitkeep

## Future Enhancements

- [ ] IPFS integration for decentralized storage
- [ ] Image thumbnail generation
- [ ] Batch verification API
- [ ] Evidence retrieval by date range
- [ ] Automatic image compression
- [ ] Multi-drone patrol evidence correlation
