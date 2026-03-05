# CAIRN - Autonomous Drone Patrol System on Hedera

CAIRN is a sophisticated autonomous drone patrol and mission management system built on the Hedera network. It enables intelligent coordination of drone fleets for surveillance, boundary monitoring, and autonomous patrol missions using AI-powered drone selection and Hedera Smart Contracts for permanent, verifiable operation records.

## Table of Contents

1. [Overview](#overview)
2. [Core Features](#core-features)
3. [System Architecture](#system-architecture)
4. [Smart Contracts](#smart-contracts)
5. [Drone Registration](#drone-registration)
6. [Zone Management](#zone-management)
7. [AI Analysis & Selection](#ai-analysis--selection)
8. [Agent Verification](#agent-verification)
9. [Getting Started](#getting-started)
10. [API Reference](#api-reference)
11. [Deployment](#deployment)

---

## Overview

CAIRN orchestrates autonomous drone missions by:
- **Registering drones** as AI agents on the Hedera network
- **Creating and managing boundary zones** on the blockchain
- **Analyzing available drones** using multi-criteria algorithms
- **Verifying drone agents** via Hedera Consensus Service (HCS)
- **Selecting optimal drones** for specific missions using Eliza OS
- **Deploying missions** with verifiable records on the blockchain

The system is designed for large-scale autonomous operations, particularly for environmental monitoring, border patrol, and surveillance in forest ecosystems.

---

## Core Features

### 🚁 Intelligent Drone Management
- **Drone Fleet Registry**: Register multiple drones with unique identifiers and EVM addresses
- **Real-time Status Tracking**: Monitor battery, health, location, and operational status
- **Autonomous Agent Assignment**: Each drone automatically becomes an AI agent registered on Hedera
- **Persistent Records**: All drone registrations stored on the blockchain

### 🗺️ Zone Management System
- **Interactive Map Interface**: Drop pins on Leaflet maps to create boundary polygons
- **Zone Persistence**: Save zones to the blockchain with unique identifiers
- **Zone Selection**: Choose from previously saved zones for mission deployment
- **Boundary Verification**: Validate zone coordinates and parameters

### 🧠 Eliza OS Integration
- **Multi-phase AI Analysis**: 5-stage analysis process (Assessment → Evaluation → Reasoning → Decision → Conclusion)
- **Real-time Thought Streaming**: Visual representation of AI reasoning process
- **Multi-criteria Scoring**: Battery (35%), Proximity (30%), Health (25%), Agent Validation (10%)
- **Confidence Metrics**: 50-100% confidence scoring based on composite analysis

### ✅ Agent Verification
- **HCS Topic-based Registration**: Each drone creates an HCS topic for identity and communication
- **Manifest Validation**: Verify agent permissions and capabilities
- **Permanent Identity**: Agent topics serve as permanent, cryptographically verified identities
- **Cross-drone Communication**: Agents can communicate and coordinate via HCS

### 📊 Beautiful Analytics UI
- **Futuristic Dashboard**: Modern dark theme with animated backgrounds
- **Stage-by-stage Analysis Display**: Watch the system think through drone selection
- **Real-time Progress Indicators**: Animated progress bars and status updates
- **Final Decision Cards**: Comprehensive breakdown of selected drone metrics

---

## System Architecture

### Technology Stack

- **Framework**: Next.js 16.1.6 with Turbopack
- **Blockchain**: Hedera (Testnet)
- **Smart Contracts**: Solidity (EVM-compatible on Hedera)
- **AI**: Eliza OS for multi-phase analysis
- **Wallet**: Hedera Wallet Connect v2.0.6
- **Web3**: Ethers.js v6.16.0
- **Maps**: React Leaflet v5.0.0
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion

### Architecture Layers

```
┌─────────────────────────────────────────┐
│       User Interface (Next.js)           │
│  - Dashboard / Deploy / Analysis Pages   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      API Layer (Route Handlers)          │
│  - /api/drones - /api/zones              │
│  - /api/analysis - /api/sync-blockchain  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│     Core Logic (lib/)                    │
│  - elizaAnalysis.ts - droneSelector.ts   │
│  - agentValidator.ts - contracts.ts      │
│  - hedera-connector.ts                   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│    Blockchain Layer (Hedera)             │
│  - Smart Contracts (EVM)                 │
│  - HCS Topics (Communication)            │
│  - Account Management                    │
└─────────────────────────────────────────┘
```

---

## Smart Contracts

### Contract Addresses (Hedera Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| **BoundaryZoneRegistry** | `0xeEFfE09953FDCB844Ff69B67e46E8474B70f0E69` | Manages mission boundary zones |
| **DroneRegistry** | `0x5CE1B45F7af14D864146C16D6E1b168Ae599cFCf` | Registers and tracks drone metadata |

### BoundaryZoneRegistry

**Purpose**: Stores and manages geographic boundaries for patrol missions

**Key Functions**:
- `createZone(zoneId, zoneName, coordinates)` - Create a new boundary zone
- `getZone(zoneId)` - Retrieve zone details
- `isZoneRegistered(zoneId)` - Check if zone exists
- `assignDroneToZone(zoneId, droneAddress)` - Assign drone to zone

**Data Structure**:
```solidity
struct BoundaryZone {
    string zoneId;
    string zoneName;
    uint256 createdAt;
    Coordinate[] coordinates;
    address creator;
    DroneAssignment[] assignedDrones;
}

struct Coordinate {
    int32 latitude;
    int32 longitude;
}
```

**Events**:
- `ZoneCreated` - Emitted when a new zone is created
- `DroneAssigned` - Emitted when a drone is assigned to a zone

### DroneRegistry

**Purpose**: Maintains the master registry of all drones and their operational metadata

**Key Functions**:
- `registerDrone(cairnDroneId, evmAddress, agentTopicId)` - Register a new drone
- `getDrone(droneAddress)` - Retrieve drone information
- `updateDroneStatus(status)` - Update operational status
- `getDroneCount()` - Get total registered drones

**Data Structure**:
```solidity
struct Drone {
    string cairnDroneId;
    address evmAddress;
    uint64 agentTopicId;
    uint256 registeredAt;
    DroneStatus status;
}

enum DroneStatus {
    IDLE,
    DEPLOYING,
    ACTIVE,
    RETURNING,
    MAINTENANCE
}
```

**Events**:
- `DroneRegistered` - Emitted when a drone is registered
- `DroneStatusUpdated` - Emitted when status changes

### Contract Interaction Flow

```
1. User connects MetaMask wallet
   ↓
2. User drops pins on map → Creates boundary polygon
   ↓
3. User clicks "Save Boundary to Blockchain"
   ↓
4. BoundaryZoneRegistry.createZone() executed
   → Zone stored permanently on-chain
   ↓
5. User selects zone for mission deployment
   ↓
6. User clicks "Analyse Drone"
   → Redirected to /analyse-drone page
   ↓
7. System fetches registered drones from DroneRegistry
   ↓
8. Eliza OS analyzes drones (4-second analysis)
   ↓
9. Best drone selected and displayed
   ↓
10. User can deploy mission to selected drone
```

---

## Drone Registration

### Registration Process

When a drone is registered in the system, the following occurs:

#### 1. **Unique ID Assignment**
```
- System generates cairnDroneId using max ID + 1 algorithm
- Example: CAIRN-01, CAIRN-02, CAIRN-03, etc.
- Ensures no duplicate IDs across restarts
```

#### 2. **EVM Address Registration**
```
- Drone's EVM address stored in DroneRegistry contract
- Address used as primary identifier for blockchain interactions
- Enables future smart contract interactions directly from drone
```

#### 3. **HCS Agent Topic Creation**
```
- Automatic HCS topic created for each drone
- Topic ID: 0.0.XXXXXXX (Hedera format)
- Drone becomes an autonomous AI agent
- Topic used for inter-drone communication and verification
```

#### 4. **Blockchain Recording**
```
- DroneRegistry.registerDrone() called
- Event DroneRegistered emitted
- Permanent record created on blockchain
- Drone can be queried at any time
```

### API Endpoint: POST `/api/drones/register`

**Request**:
```json
{
  "walletAddress": "0x...",
  "cairnDroneId": "CAIRN-01",
  "location": {
    "latitude": 11.5381,
    "longitude": 76.4204
  }
}
```

**Response**:
```json
{
  "success": true,
  "drone": {
    "cairnDroneId": "CAIRN-01",
    "evmAddress": "0x...",
    "agentTopicId": 307216,
    "status": "idle",
    "registeredAt": 1709554800,
    "hcsTopicId": "0.0.307216"
  }
}
```

---

## Zone Management

### Zone Registration

Zones represent geographic areas where drone missions will be deployed.

#### 1. **Interactive Zone Creation**
```
- User opens /deploy page
- User drops pins on Leaflet map
- Pins form a polygon boundary
- System validates polygon closure
```

#### 2. **Zone Saving to Blockchain**
```
- User provides unique Zone ID
- BoundaryZoneRegistry.createZone() called
- Zone coordinates stored on-chain
- Zone becomes permanently accessible
```

#### 3. **Zone Selection for Missions**
```
- User can select from previously saved zones
- Zone appears on map with drone visualization
- Zone coordinates used for proximity calculations
```

### API Endpoints

**POST `/api/zones/boundary`** - Create new zone
```json
{
  "zoneId": "Wayanad-01",
  "zoneName": "Wayanad Forest Boundary",
  "coordinates": [
    { "lat": 11.5381, "lng": 76.4204 },
    { "lat": 11.5400, "lng": 76.4220 },
    { "lat": 11.5390, "lng": 76.4240 }
  ]
}
```

**GET `/api/zones`** - Fetch all zones
```json
{
  "zones": [
    {
      "zoneId": "Wayanad-01",
      "zoneName": "Wayanad Forest Boundary",
      "coordinates": [...],
      "assignedDrones": [...]
    }
  ],
  "count": 5
}
```

---

## AI Analysis & Selection

### Eliza OS Analysis System

The analysis page (`/analyse-drone`) showcases a **5-phase AI reasoning system**:

#### Phase 1: Assessment 🔍 (Blue)
```
Activity: Inventory all available drones
- Fetch drone list from registry
- Check operational status
- Validate drone metadata
Duration: ~1 second
```

#### Phase 2: Evaluation ⚡ (Purple)
```
Activity: Score each drone on criteria
- Battery Level: 35% weight
- Proximity to Zone: 30% weight
- Health Status: 25% weight
- Agent Validation: 10% weight
Duration: ~1 second
```

#### Phase 3: Reasoning 🧠 (Cyan)
```
Activity: Analyze top candidates
- Compare scores
- Calculate Haversine distance
- Evaluate trade-offs
Duration: ~1 second
```

#### Phase 4: Decision 🎯 (Yellow)
```
Activity: Select best drone
- Choose highest-scoring candidate
- Verify agent validation
- Prepare deployment parameters
Duration: ~0.5 seconds
```

#### Phase 5: Conclusion ✅ (Green)
```
Activity: Finalize and report
- Calculate confidence level (50-100%)
- Prepare result summary
- Ready for deployment
Duration: ~0.5 seconds
```

### Scoring Algorithm

```
Total Score = 
  (Battery% × 0.35) +
  (ProximityScore × 0.30) +
  (HealthScore × 0.25) +
  (AgentValidScore × 0.10)

Confidence = 50 + (Score × 0.5)
Range: 50% - 100%
```

### Example Analysis Result

```json
{
  "selectedDrone": {
    "cairnDroneId": "CAIRN-01",
    "evmAddress": "0x...",
    "battery": 85,
    "health": "good",
    "distance": 1.2
  },
  "score": 87,
  "confidence": 93.5,
  "thoughts": [
    {
      "phase": "assessment",
      "text": "Loaded 9 drones from registry",
      "timestamp": 1709554800
    }
  ],
  "reasoning": "CAIRN-01 selected: Best proximity (1.2km), high battery (85%), validated agent"
}
```

---

## Agent Verification

### HCS Topic-Based Agent System

Each drone is automatically registered as an **AI agent** using Hedera Consensus Service.

#### Agent Identity Structure

```
Drone → HCS Topic
  ├─ Topic ID: 0.0.XXXXXXX
  ├─ Messages: Agent manifest, status updates
  ├─ Keys: Agent's Ed25519 public key
  └─ Permissions: Read/Write/Delete
```

#### Agent Manifest

```json
{
  "agentId": "0.0.307216",
  "droneId": "CAIRN-01",
  "version": "1.0.0",
  "capabilities": [
    "patrol",
    "surveillance",
    "boundary-monitoring"
  ],
  "permissions": {
    "zoneAccess": "all",
    "missionExecution": true,
    "agentCommunication": true
  },
  "createdAt": 1709554800,
  "signature": "0x..."
}
```

#### Verification Process

```
1. User initiates drone selection
   ↓
2. System fetches drone's HCS topic ID
   ↓
3. Query HCS topic for agent manifest
   ↓
4. Verify manifest signature (Ed25519)
   ↓
5. Check manifest permissions
   ↓
6. Mark agent as "validated" ✅
   ↓
7. Agent Validation score = 100 points (10% of total)
   ↓
8. Drone eligible for mission deployment
```

### Agent Communication

Drones can communicate with each other and the system via HCS:

```
Drone A (Topic 0.0.307216)
  ↓ Submit message
Hedera Consensus Service
  ↑ Distribute message
Drone B (Topic 0.0.307217)
  ↓ Receive & process
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask or Hedera Wallet Connect
- Hedera Testnet account with testnet HBAR

### Installation

```bash
# Clone repository
git clone <repo-url>
cd cairn

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Hedera credentials
```

### Environment Variables

```env
# Hedera Network
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_RPC=https://testnet.hashio.io/api

# Contracts (Pre-deployed)
NEXT_PUBLIC_DRONE_REGISTRY=0x5CE1B45F7af14D864146C16D6E1b168Ae599cFCf
NEXT_PUBLIC_BOUNDARY_ZONE_REGISTRY=0xeEFfE09953FDCB844Ff69B67e46E8474B70f0E69

# Wallet Connect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=<your-project-id>
```

### Running Locally

```bash
# Development server
npm run dev

# Open browser
open http://localhost:3000

# Build for production
npm run build

# Start production server
npm start
```

### Accessing Pages

- **Dashboard**: `http://localhost:3000/dashboard` - Overview and recent activity
- **Deploy**: `http://localhost:3000/deploy` - Create zones and manage drones
- **Analyse Drone**: `http://localhost:3000/analyse-drone` - AI analysis and selection
- **Register**: `http://localhost:3000/register` - Register new drones

---

## API Reference

### Drone Management

**GET `/api/drones`**
- Fetch all registered drones
- Returns drone list with status

**POST `/api/drones/register`**
- Register a new drone
- Creates HCS agent topic
- Records in DroneRegistry contract

**GET `/api/drones/status`**
- Get real-time status of all drones
- Includes battery, location, health

**GET `/api/drones/:id`**
- Get specific drone details
- Includes agent topic information

### Zone Management

**GET `/api/zones`**
- Fetch all saved zones
- Returns zone boundaries and metadata

**POST `/api/zones/boundary`**
- Create new zone on blockchain
- Stores coordinates permanently

**POST `/api/zones/assign`**
- Assign drone to zone
- Links drone with mission area

### Analysis

**POST `/api/analysis`**
- Trigger Eliza OS analysis
- Returns drone selection with reasoning

### Blockchain Sync

**POST `/api/sync-blockchain`**
- Fetch latest data from blockchain
- Updates in-memory cache
- Ensures consistency with on-chain state

---

## Deployment

### Production Build

```bash
npm run build
```

### Docker Deployment

```bash
docker build -t cairn:latest .
docker run -p 3000:3000 -e NEXT_PUBLIC_HEDERA_NETWORK=testnet cairn:latest
```

### Vercel Deployment

```bash
vercel deploy
```

### Environment Setup for Production

```env
NEXT_PUBLIC_HEDERA_NETWORK=mainnet
NEXT_PUBLIC_HEDERA_RPC=https://mainnet.hashio.io/api
NODE_ENV=production
```

---

## Technical Highlights

### Hybrid Architecture
- **Client-side**: Interactive UI, maps, real-time rendering
- **Server-side**: API routes, blockchain interaction, data aggregation
- **Blockchain**: Permanent records, smart contracts, HCS communication

### Scalability Features
- In-memory caching for drone and zone data
- Efficient distance calculations (Haversine algorithm)
- Batch agent verification
- Optimized database queries

### Security
- MetaMask wallet integration
- Smart contract permissions
- Ed25519 signature verification
- HCS topic access control

### User Experience
- Beautiful animated UI
- Real-time progress indicators
- Intuitive map interface
- Clear drone selection reasoning

---

## Future Enhancements

- [ ] Real telemetry integration (live battery, health data)
- [ ] Multi-drone coordination missions
- [ ] Weather integration for mission planning
- [ ] Mission execution and telemetry logging
- [ ] Advanced path planning algorithm
- [ ] Drone swarm optimization
- [ ] Historical mission analytics
- [ ] Mobile app for field operations

---

## Contributing

Contributions are welcome! Please follow the existing code structure and add tests for new features.

---

## License

Proprietary - CAIRN Project

---

## Support

For issues, questions, or feature requests, please open an issue in the repository.
"# cairn" 
