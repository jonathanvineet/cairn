# 🚁 CAIRN Patrol Submission System

## Overview

This system handles patrol evidence submission from drones to the blockchain:

1. **Upload breach images** to IPFS
2. **Create patrol JSON** with coordinates, images, and breach data
3. **Upload patrol data** to IPFS
4. **Submit to blockchain** after 30-second delay for verification
5. **Store IPFS CID** on Hedera smart contract for permanent record

## Architecture

```
Drone Patrol
    ↓
Upload Image to IPFS → Get Image CID
    ↓
Create Patrol JSON (with Image CID)
    ↓
Upload JSON to IPFS → Get Patrol CID
    ↓
Wait 30 seconds (simulates verification)
    ↓
Submit to Blockchain (DroneEvidenceVault contract)
    ↓
Store: Patrol CID + Data Hash + Metadata
```

## Patrol Data Structure

```json
{
  "droneId": "DRONE_12",
  "zoneId": "ZONE_A",
  "timestamp": 1710000000,
  "coordinates": [
    {"lat": 12.91321, "lon": 80.22321},
    {"lat": 12.91345, "lon": 80.22356}
  ],
  "images": [
    "bafybeihash1",
    "bafybeihash2",
    "bafybeihash3"
  ],
  "breaches": [
    {
      "lat": 12.91345,
      "lon": 80.22356,
      "image": "bafybeihash2"
    }
  ]
}
```

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
```env
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
```

### 2. Install Dependencies

```bash
npm install
# or
npm install tsx  # for running TypeScript scripts
```

### 3. Prepare Test Image

Make sure your breach image exists at:
```
C:\Users\hp\Documents\broken-metallic-fence.jpg
```

## Usage

### Option 1: Web Interface

1. Start the development server:
```bash
npm run dev
```

2. Navigate to the test page:
```
http://localhost:3000/test-patrol
```

3. Click "Submit Patrol to IPFS"

4. Watch the countdown (30 seconds)

5. Check console for blockchain submission results

### Option 2: Command Line Script

Run the submission script directly:

```bash
npm run test:patrol
```

This will:
- ✅ Upload breach image to IPFS
- ✅ Create patrol JSON
- ✅ Upload patrol JSON to IPFS
- ⏳ Wait 30 seconds
- ✅ Submit to Hedera blockchain
- ✅ Display transaction ID

### Option 3: API Endpoint

Send a POST request to the API:

```bash
curl -X POST http://localhost:3000/api/patrol/submit \
  -H "Content-Type: application/json" \
  -d '{
    "droneId": "DRONE_12",
    "zoneId": "ZONE_A",
    "imagePath": "C:\\Users\\hp\\Documents\\broken-metallic-fence.jpg"
  }'
```

## Smart Contract

**Contract Address:** `0x4873df8de78955b758F0b81808c4c01aA52A382A`

**Network:** Hedera Testnet

**Function:** `submitPatrol(string droneId, string zoneId, string ipfsCid, bytes32 dataHash)`

### Contract Structure

```solidity
struct PatrolRecord {
    uint256 patrolId;
    string droneId;
    string zoneId;
    string ipfsCid;        // IPFS CID of patrol data
    bytes32 dataHash;      // Hash for verification
    uint256 timestamp;
    address submittedBy;
    bool verified;
}
```

## IPFS Integration

### Current Implementation

The current implementation uses **mock IPFS CIDs** for testing. In production, integrate one of these services:

### Option 1: Pinata (Recommended)

```bash
npm install @pinata/sdk
```

```typescript
import pinataSDK from '@pinata/sdk';

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_KEY
);

// Upload file
const result = await pinata.pinFileToIPFS(readableStreamForFile);
const cid = result.IpfsHash; // "bafybei..."
```

### Option 2: Web3.Storage

```bash
npm install web3.storage
```

```typescript
import { Web3Storage } from 'web3.storage';

const client = new Web3Storage({ 
  token: process.env.WEB3_STORAGE_TOKEN 
});

const cid = await client.put([file]);
```

### Option 3: Local IPFS Node

```bash
npm install ipfs-http-client
```

```typescript
import { create } from 'ipfs-http-client';

const client = create({ url: 'http://localhost:5001' });
const { cid } = await client.add(file);
```

## API Routes

### POST `/api/patrol/submit`

Upload patrol data to IPFS and schedule blockchain submission.

**Request:**
```json
{
  "droneId": "DRONE_12",
  "zoneId": "ZONE_A",
  "imagePath": "C:\\Users\\hp\\Documents\\broken-metallic-fence.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Patrol data uploaded to IPFS. Blockchain submission scheduled in 30 seconds.",
  "ipfsCid": "bafybei...",
  "dataHash": "0x123...",
  "breachImageCID": "bafybeih...",
  "blockchainSubmissionIn": "30 seconds"
}
```

### POST `/api/patrol/blockchain`

Submit patrol IPFS CID to blockchain (called automatically after 30s).

**Request:**
```json
{
  "droneId": "DRONE_12",
  "zoneId": "ZONE_A",
  "ipfsCid": "bafybei...",
  "dataHash": "0x123..."
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "0.0.1234567@1710000000.123456789",
  "status": "SUCCESS",
  "droneId": "DRONE_12",
  "zoneId": "ZONE_A",
  "ipfsCid": "bafybei..."
}
```

## Verification Flow

### 1. Data Integrity

```typescript
// Create hash before upload
const dataHash = ethers.keccak256(
  ethers.toUtf8Bytes(JSON.stringify(patrolData))
);

// Anyone can verify by:
// 1. Fetching data from IPFS using CID
// 2. Hashing the data
// 3. Comparing with on-chain hash
```

### 2. Timeline

- **T+0s**: Image uploaded to IPFS
- **T+0s**: Patrol JSON created and uploaded to IPFS
- **T+30s**: IPFS CID submitted to blockchain
- **T+30s**: Transaction receipt received
- **永久**: Data stored on Hedera consensus

## Troubleshooting

### "Failed to read image"

- Check that the image path is correct
- Ensure file exists at the specified location
- Use absolute path with double backslashes on Windows

### "Missing HEDERA_ACCOUNT_ID"

- Copy `.env.example` to `.env`
- Fill in your Hedera testnet account credentials
- Get testnet account at: https://portal.hedera.com/

### "Transaction failed"

- Ensure your Hedera account has sufficient HBAR
- Check that the contract address is correct
- Verify your private key is valid

### Port 3000 already in use

```bash
# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Or use different port
npm run dev -- -p 3001
```

## Production Checklist

- [ ] Replace mock IPFS with real service (Pinata/Web3.Storage)
- [ ] Add authentication to API routes
- [ ] Implement retry logic for failed uploads
- [ ] Add webhook for blockchain confirmation
- [ ] Set up monitoring and alerts
- [ ] Rate limiting on patrol submissions
- [ ] Image compression before IPFS upload
- [ ] Metadata validation
- [ ] Backup strategy for IPFS data

## File Locations

```
cairn/
├── app/
│   ├── api/
│   │   └── patrol/
│   │       ├── submit/route.ts      # IPFS upload endpoint
│   │       └── blockchain/route.ts   # Blockchain submission
│   └── test-patrol/
│       └── page.tsx                  # Test UI
├── scripts/
│   └── submitPatrol.ts              # CLI script
├── test/
│   └── contracts/
│       └── DroneEvidenceRegistry.sol # Smart contract
├── lib/
│   ├── contracts.ts                 # Contract ABIs
│   └── useDroneVault.ts            # Hooks for contract interaction
└── .env.example                     # Environment template
```

## Next Steps

1. **Test the full flow** using the test page
2. **Integrate real IPFS** service (Pinata recommended)
3. **Deploy to production** with proper monitoring
4. **Add AI analysis** before blockchain submission
5. **Implement evidence chain** for tamper-proofing

## Support

For issues or questions:
- Check console logs for detailed error messages
- Verify all environment variables are set
- Ensure Hedera testnet account has funds
- Review transaction on Hedera explorer

---

**Made with ❤️ for CAIRN - India's On-Chain Drone Registry**
