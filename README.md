# CAIRN - Autonomous Drone Patrol System on Hedera

<div align="center">

**Trustless Drone Operations for India's Airspace**

A sophisticated autonomous drone patrol and mission management system built on the Hedera network. Register drones as AI agents, create verifiable boundary zones, and deploy intelligent patrol missions with on-chain proof.

[🚀 Getting Started](#getting-started) • [📖 Documentation](#api-reference) • [🔗 Smart Contracts](#smart-contracts)

</div>

---

## Overview

CAIRN orchestrates autonomous drone missions by:

- **Registering drones** as autonomous AI agents on the Hedera network
- **Creating and managing boundary zones** with tamper-proof blockchain records
- **Analyzing available drones** using multi-criteria AI algorithms
- **Verifying drone agents** via Hedera Consensus Service (HCS)
- **Selecting optimal drones** for specific missions using Eliza OS multi-phase analysis
- **Deploying missions** with verifiable, immutable records on the blockchain

**Perfect for**: Environmental monitoring, border patrol, surveillance in forest ecosystems, and any large-scale autonomous drone operations requiring trustless verification.

---

## Table of Contents

1. [Core Features](#core-features)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Smart Contracts](#smart-contracts)
5. [Drone Registration](#drone-registration)
6. [Zone Management](#zone-management)
7. [AI Analysis System](#ai-analysis-system)
8. [Agent Verification](#agent-verification)
9. [Getting Started](#getting-started)
10. [Project Structure](#project-structure)
11. [API Reference](#api-reference)
12. [Utility Scripts](#utility-scripts)
13. [Deployment](#deployment)
14. [Troubleshooting](#troubleshooting)

---

## Core Features

### 🚁 Intelligent Drone Management
- **Drone Fleet Registry**: Register multiple drones with unique Cairn IDs and EVM addresses
- **Real-time Status Tracking**: Monitor battery level, health status, location, and operational status
- **Autonomous Agent Assignment**: Each drone automatically becomes an AI agent registered on Hedera
- **Persistent Blockchain Records**: All drone registrations permanently stored on-chain

### 🗺️ Zone Management System
- **Interactive Map Interface**: Drop pins on Leaflet-based maps to create boundary polygons
- **Blockchain-Persisted Zones**: Save zones with immutable on-chain proof of boundaries
- **Zone Selection UI**: Choose from previously saved zones for mission deployment
- **Coordinate Validation**: Automatic validation of zone polygons and boundary parameters

### 🧠 Eliza OS AI Analysis
- **Multi-Phase Reasoning**: 5-stage analysis (Assessment → Evaluation → Reasoning → Decision → Conclusion)
- **Real-time Thought Visualization**: Watch the AI think through drone selection
- **Multi-Criteria Scoring**:
  - Battery Level: 35% weight
  - Proximity to Zone: 30% weight
  - Health Status: 25% weight
  - Agent Validation: 10% weight
- **Confidence Scoring**: 50-100% confidence based on composite analysis

### ✅ Cryptographic Agent Verification
- **HCS Topic-Based Identity**: Each drone gets a permanent HCS topic for identity and communication
- **Manifest Validation**: Verify agent permissions and operational capabilities
- **Ed25519 Signatures**: Cryptographically signed agent manifests
- **Inter-Drone Communication**: Agents communicate and coordinate via HCS topics

### 📊 Analytics Dashboard
- **Futuristic UI**: Modern dark theme with animated background effects
- **Live Analysis Display**: Real-time visualization of the AI reasoning process
- **Progress Tracking**: Animated progress bars and status indicators
- **Decision Cards**: Detailed breakdown of selected drone metrics and reasoning

---

## Technology Stack

### Frontend & UI
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 16.1.6 |
| React | React | 19.2.3 |
| Styling | Tailwind CSS | 3.4.17 |
| Maps | React Leaflet | 5.0.0 |
| State Management | Zustand | 5.0.11 |
| Data Fetching | TanStack React Query | 5.90.21 |
| Icons | Lucide React | 0.542.0 |
| Animations | Framer Motion | Latest |

### Blockchain & Web3
| Component | Technology | Version |
|-----------|-----------|---------|
| Network | Hedera Testnet | - |
| RPC Provider | Ethers.js | 6.16.0 |
| Wallet | Hedera Wallet Connect | 2.0.6 |
| Contract Language | Solidity | 0.8.34 |
| Hedera SDK | @hashgraph/sdk | 2.80.0 |
| Hiero SDK | @hiero-ledger/sdk | 2.79.0 |

### Development & Build
| Tool | Purpose | Version |
|------|---------|---------|
| TypeScript | Type Safety | 5.0 |
| Turbopack | Build Tool | Latest |
| ESLint | Code Linting | 9 |
| tsx | Script Runner | 4.21.0 |
| solc | Contract Compiler | 0.8.34 |

---

## System Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│         User Interface Layer (Next.js Pages)            │
│   Landing → Dashboard → Deploy → Analysis → Register    │
│   Evidence → Blockchain Sync                            │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│       API Layer (Next.js Route Handlers)                │
│  /api/drones/* | /api/zones/* | /api/analysis           │
│  /api/patrol/* | /api/sync-blockchain                   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│      Core Business Logic (lib/)                         │
│  elizaAnalysis.ts | droneAgent.ts | agentValidator.ts   │
│  contracts.ts | hedera-connector.ts | encryption.ts     │
│  droneBlockchainFetcher.ts | geoUtils.ts                │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│     Blockchain & Storage Layer                          │
│  Hedera Smart Contracts (EVM) | HCS Topics              │
│  Local Database | Wallet Storage                        │
└─────────────────────────────────────────────────────────┘
```

### State Management Flow

```
React Components
      ↓
Zustand Stores:
  ├── walletStore.ts (Wallet connection & account)
  ├── missionStore.ts (Current mission state)
  ├── uiStore.ts (UI toggles & modals)
  └── worldStore.ts (Zones & geographic data)
      ↓
API Routes (Server-side processing)
      ↓
Blockchain (Hedera) & Local Database
```

---

## Project Structure

```
cairn/
├── app/                                 # Next.js App Router pages
│   ├── page.tsx                        # Landing page with slides
│   ├── layout.tsx                      # Root layout with providers
│   ├── providers.tsx                   # React Query & Zustand setup
│   │
│   ├── dashboard/                      # Dashboard page
│   │   ├── page.tsx                   # Main dashboard view
│   │   └── loading.tsx                # Loading skeleton
│   │
│   ├── deploy/                         # Zone creation & deployment
│   │   └── page.tsx                   # Deploy interface
│   │
│   ├── analysis/                       # AI analysis page
│   │   └── page.tsx                   # Drone analysis & selection
│   │
│   ├── register/                       # Drone registration
│   │   └── page.tsx                   # Registration form
│   │
│   ├── evidence/                       # Patrol evidence management
│   │   └── page.tsx                   # Evidence display
│   │
│   ├── api/                            # API route handlers
│   │   ├── drones/
│   │   │   ├── route.ts               # GET all drones
│   │   │   ├── [id]/route.ts          # GET specific drone
│   │   │   ├── register/route.ts      # POST new drone
│   │   │   ├── status/route.ts        # GET drone status
│   │   │   ├── balance/route.ts       # GET balance
│   │   │   ├── fund/route.ts          # Fund drone account
│   │   │   └── test-transfer/route.ts # Test transfers
│   │   │
│   │   ├── zones/
│   │   │   ├── route.ts               # GET all zones
│   │   │   ├── boundary/route.ts      # POST create zone
│   │   │   └── assign/route.ts        # POST assign drone to zone
│   │   │
│   │   ├── analysis/route.ts          # POST trigger analysis
│   │   │
│   │   ├── patrol/
│   │   │   ├── submit/route.ts        # POST patrol mission
│   │   │   ├── verify-image/route.ts  # Verify patrol images
│   │   │   ├── store-image/route.ts   # Store patrol images
│   │   │   └── blockchain/route.ts    # Record on-chain
│   │   │
│   │   ├── submit-patrol/route.ts     # Submit patrol endpoint
│   │   └── sync-blockchain/route.ts   # Sync blockchain data
│   │
│   └── styles/
│       └── global.css                 # Global Tailwind styles
│
├── components/                         # React components
│   ├── WalletConnect.tsx              # Wallet connection UI
│   ├── InteractiveMap.tsx             # Map interaction logic
│   ├── LocationPicker.tsx             # Location selection
│   ├── MapComponent.tsx               # Leaflet map wrapper
│   └── ui/                            # Reusable UI components
│       ├── button.tsx                 # Button component
│       ├── card.tsx                   # Card component
│       ├── badge.tsx                  # Badge component
│       ├── skeleton.tsx               # Loading skeleton
│       └── progress.tsx               # Progress bar
│
├── lib/                               # Core library functions
│   ├── elizaAnalysis.ts              # Eliza OS analysis engine
│   ├── droneAgent.ts                 # HCS agent registration
│   ├── agentValidator.ts             # Agent verification logic
│   ├── contracts.ts                  # Contract ABIs & addresses
│   ├── hedera-connector.ts           # Hedera SDK setup
│   ├── droneBlockchainFetcher.ts     # Fetch drone data from chain
│   ├── db.ts                         # Database operations
│   ├── encryption.ts                 # Encryption utilities
│   ├── geoUtils.ts                   # Geographic calculations
│   ├── hederaDroneHelpers.ts         # Hedera drone utilities
│   ├── hederaHelpers.ts              # General Hedera utilities
│   ├── useHederaWallet.ts            # Wallet hook
│   └── utils.ts                      # General utilities
│
├── stores/                           # Zustand state stores
│   ├── walletStore.ts                # Wallet connection state
│   ├── missionStore.ts               # Mission state
│   ├── uiStore.ts                    # UI state (modals, tabs)
│   └── worldStore.ts                 # World/zone state
│
├── types/                            # TypeScript definitions
│   └── ethereum.d.ts                 # Ethereum type definitions
│
├── public/                           # Static assets
│   ├── breach-evidence/              # Evidence samples
│   ├── drones/                       # Drone imagery
│   └── evidence-samples/             # Sample evidence
│
├── scripts/                          # Utility scripts
│   ├── testConnection.ts             # Test Hedera connection
│   ├── submitPatrol.ts               # Submit patrol mission
│   ├── createAccountFromMnemonic.ts  # Account creation
│   ├── extractKey.ts                 # Extract private key
│   ├── verifyKeys.ts                 # Verify key pair
│   ├── checkContract.ts              # Check contract status
│   └── quickCheck.ts                 # Quick system check
│
├── test/                             # Smart contracts & tests
│   ├── contracts/
│   │   ├── DroneRegistry.sol         # Drone registry contract
│   │   ├── BoundaryZoneRegistry.sol  # Zone registry contract
│   │   └── DroneEvidenceRegistry.sol # Evidence registry contract
│   ├── hederaContractTest.ts         # Contract tests
│   ├── deployContracts.ts            # Contract deployment
│   └── package.json
│
└── Configuration Files
    ├── package.json                   # NPM dependencies
    ├── tsconfig.json                  # TypeScript configuration
    ├── next.config.ts                 # Next.js configuration
    ├── tailwind.config.ts             # Tailwind configuration
    ├── postcss.config.mjs             # PostCSS configuration
    ├── eslint.config.mjs              # ESLint configuration
    ├── .env.example                   # Environment template
    ├── .env                           # Local environment (git ignored)
    └── README.md                      # This file
```

---

## Smart Contracts

### Deployed Contract Addresses (Hedera Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| **DroneRegistry** | `0x5CE1B45F7af14D864146C16D6E1b168Ae599cFCf` | Registers and tracks all drone metadata |
| **BoundaryZoneRegistry** | `0xeEFfE09953FDCB844Ff69B67e46E8474B70f0E69` | Manages mission boundary zones |
| **DroneEvidenceRegistry** | TBD | Records patrol evidence on-chain |

### DroneRegistry Contract

**Purpose**: Maintains the master registry of all drones and their operational metadata

**Key Functions**:
```solidity
registerDrone(
    string memory _cairnDroneId,
    address _evmAddress,
    string memory _model,
    uint64 _agentTopicId
) → bool

getDrone(address _droneAddress) → Drone

getTotalDrones() → uint256

updateDroneStatus(address _droneAddress, DroneStatus _status) → bool
```

**Data Structure**:
```solidity
struct Drone {
    string cairnDroneId;        // "CAIRN-01"
    address evmAddress;         // 0x...
    uint64 agentTopicId;        // Hedera HCS topic
    string model;               // Drone model
    uint256 registeredAt;       // Timestamp
    bool isActive;              // Active status
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
- `DroneRegistered(string indexed cairnId, address indexed evmAddress)`
- `DroneStatusUpdated(address indexed droneAddress, bool isActive)`

### BoundaryZoneRegistry Contract

**Purpose**: Stores and manages geographic boundaries for patrol missions

**Key Functions**:
```solidity
createZone(
    string memory _zoneId,
    string memory _zoneName,
    Coordinate[] memory _coordinates
) → bool

getZone(string memory _zoneId) → BoundaryZone

isZoneRegistered(string memory _zoneId) → bool

assignDroneToZone(
    string memory _zoneId,
    address _droneAddress
) → bool
```

**Data Structure**:
```solidity
struct BoundaryZone {
    string zoneId;              // "Wayanad-01"
    string zoneName;            // "Wayanad Forest Boundary"
    uint256 createdAt;          // Creation timestamp
    Coordinate[] coordinates;   // Polygon points
    address creator;            // Creator address
    DroneAssignment[] assignedDrones;
}

struct Coordinate {
    int32 latitude;             // Lat * 1e6
    int32 longitude;            // Lng * 1e6
}
```

**Events**:
- `ZoneCreated(string indexed zoneId, address indexed creator)`
- `DroneAssignedToZone(string indexed zoneId, address indexed droneAddress)`

### Contract Interaction Flow

```
User → Land Page
   ↓
[Connect Wallet]
   ↓
User → Dashboard
   ↓
User → Deploy
   ↓
[Drop Pins] → [Create Polygon]
   ↓
[Save to Blockchain]
   ↓
BoundaryZoneRegistry.createZone()
   ↓
Zone stored on-chain ✅
   ↓
User → Analysis
   ↓
DroneRegistry.getTotalDrones()
   ↓
Fetch all registered drones
   ↓
Eliza OS Analysis (5 phases)
   ↓
Best drone selected ✅
   ↓
[Deploy Mission]
   ↓
Mission recorded on-chain
```

---

## Drone Registration

### Registration Process

When a drone is registered in CAIRN, the following occurs:

#### Step 1: Unique ID Assignment
```
- System generates cairnDroneId using max ID + 1 algorithm
- Example: CAIRN-01, CAIRN-02, CAIRN-03, etc.
- Ensures no duplicate IDs across system restarts
```

#### Step 2: EVM Address Registration
```
- Drone's EVM address stored in DroneRegistry contract
- Address serves as primary blockchain identifier
- Enables direct smart contract interactions from drone
```

#### Step 3: HCS Agent Topic Creation
```
- Automatic HCS topic created for drone agent
- Topic ID format: 0.0.XXXXXXX (Hedera format)
- Drone becomes autonomous AI agent on Hedera
- Topic used for inter-drone communication
```

#### Step 4: Blockchain Recording
```
- DroneRegistry.registerDrone() executed
- Event DroneRegistered emitted
- Permanent on-chain record created
- Drone queryable at any future time
```

### API Endpoint: Register Drone

**POST `/api/drones/register`**

**Request**:
```json
{
  "walletAddress": "0x1234567890abcdef...",
  "cairnDroneId": "CAIRN-01",
  "location": {
    "latitude": 11.5381,
    "longitude": 76.4204
  },
  "model": "DJI M300 RTK"
}
```

**Response**:
```json
{
  "success": true,
  "drone": {
    "cairnDroneId": "CAIRN-01",
    "evmAddress": "0x...",
    "agentTopicId": "307216",
    "hcsTopicId": "0.0.307216",
    "status": "idle",
    "registeredAt": 1709554800,
    "model": "DJI M300 RTK"
  }
}
```

### Example: Register a Drone via cURL

```bash
curl -X POST http://localhost:3000/api/drones/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x...",
    "cairnDroneId": "CAIRN-01",
    "location": {
      "latitude": 11.5381,
      "longitude": 76.4204
    }
  }'
```

---

## Zone Management

### Creating Zones

Zones represent geographic areas where drone missions will be deployed.

#### Interactive Zone Creation

```
1. User opens /deploy page
2. User clicks on map to drop pins
3. Each pin is a coordinate in polygon
4. System validates polygon closure
5. Polygon boundary forms on map
```

#### Saving Zone to Blockchain

```
1. User provides Zone ID (e.g., "Wayanad-01")
2. User names zone (e.g., "Wayanad Forest Boundary")
3. User clicks "Save Boundary to Blockchain"
4. System calls BoundaryZoneRegistry.createZone()
5. Zone coordinates stored on-chain permanently
6. Blockchain event emitted
```

#### Using Zones for Missions

```
1. User navigates to Analysis page
2. User selects previously saved zone from dropdown
3. Zone coordinates loaded and displayed on map
4. Center of zone calculated
5. Used for proximity scoring in analysis
```

### API Endpoints for Zones

**POST `/api/zones/boundary`** - Create new zone

Request:
```json
{
  "zoneId": "Wayanad-01",
  "zoneName": "Wayanad Forest Boundary",
  "coordinates": [
    { "lat": 11.5381, "lng": 76.4204 },
    { "lat": 11.5400, "lng": 76.4220 },
    { "lat": 11.5390, "lng": 76.4240 },
    { "lat": 11.5370, "lng": 76.4210 }
  ]
}
```

Response:
```json
{
  "success": true,
  "zone": {
    "zoneId": "Wayanad-01",
    "zoneName": "Wayanad Forest Boundary",
    "transactionHash": "0x...",
    "blockNumber": 12345678,
    "coordinates": [...]
  }
}
```

**GET `/api/zones`** - Fetch all zones

Response:
```json
{
  "zones": [
    {
      "zoneId": "Wayanad-01",
      "zoneName": "Wayanad Forest Boundary",
      "coordinates": [...],
      "assignedDrones": [
        { "droneId": "CAIRN-01", "assignedAt": 1709554800 }
      ],
      "createdAt": 1709554800
    }
  ],
  "count": 5
}
```

**POST `/api/zones/assign`** - Assign drone to zone

Request:
```json
{
  "zoneId": "Wayanad-01",
  "droneAddress": "0x..."
}
```

---

## AI Analysis System

### Eliza OS 5-Phase Analysis

The analysis page visualizes a **multi-phase AI reasoning system** for optimal drone selection.

#### Phase 1️⃣: Assessment (Blue)

**Duration**: ~1 second

**Activity**: System inventory
- Fetch complete drone list from registry
- Check operational status of each drone
- Validate drone metadata
- Prepare for evaluation

**Output**:
```
"Loaded 9 registered drones from blockchain"
```

#### Phase 2️⃣: Evaluation (Purple)

**Duration**: ~1 second

**Activity**: Multi-criteria scoring
```
For each drone, calculate:
- Battery Score = (batteryLevel / 100) × 35
- Proximity Score = (1 - distance/maxDistance) × 30
- Health Score = (healthStatus value) × 25
- Agent Validation Score = (isValidated ? 1 : 0) × 10
```

**Output**:
```
"CAIRN-01: Battery=29.75, Proximity=24.6, Health=24.5, Agent=10"
"CAIRN-02: Battery=28.0, Proximity=20.1, Health=22.0, Agent=10"
...
```

#### Phase 3️⃣: Reasoning (Cyan)

**Duration**: ~1 second

**Activity**: Candidate analysis
- Compare top candidates
- Calculate Haversine distances to zone center
- Evaluate trade-offs between criteria
- Identify best combination

**Output**:
```
"Analyzing top 3 candidates..."
"CAIRN-01 offers best proximity (1.2km) with high battery"
```

#### Phase 4️⃣: Decision (Yellow)

**Duration**: ~0.5 seconds

**Activity**: Final selection
- Choose highest-scoring candidate
- Verify agent validation
- Prepare deployment parameters
- Confirm eligibility

**Output**:
```
"Selected: CAIRN-01 (Final Score: 87/100)"
```

#### Phase 5️⃣: Conclusion (Green)

**Duration**: ~0.5 seconds

**Activity**: Report generation
- Calculate confidence level (50-100%)
- Generate result summary
- Prepare for deployment

**Output**:
```
"Analysis complete. Confidence: 93.5%"
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
    "batteryLevel": 85,
    "location": {
      "lat": 11.5395,
      "lng": 76.4215
    },
    "health": "good",
    "agentTopicId": "307216",
    "model": "DJI M300 RTK"
  },
  "score": 87,
  "confidence": 93.5,
  "thoughts": [
    {
      "phase": "assessment",
      "thought": "Loaded 9 drones from registry",
      "timestamp": 1709554800,
      "duration": 1050
    },
    {
      "phase": "evaluation",
      "thought": "Calculated scores for all drones",
      "timestamp": 1709554801,
      "duration": 980
    },
    {
      "phase": "reasoning",
      "thought": "CAIRN-01 offers best proximity (1.2km) with high battery (85%)",
      "timestamp": 1709554802,
      "duration": 1100
    },
    {
      "phase": "decision",
      "thought": "Selected CAIRN-01 as optimal choice",
      "timestamp": 1709554803,
      "duration": 450
    },
    {
      "phase": "conclusion",
      "thought": "Analysis complete with 93.5% confidence",
      "timestamp": 1709554804,
      "duration": 520
    }
  ],
  "reasoning": "CAIRN-01 selected: Best proximity (1.2km), high battery (85%), validated agent (10pts), good health"
}
```

### API Endpoint: Trigger Analysis

**POST `/api/analysis`**

Request:
```json
{
  "zoneId": "Wayanad-01",
  "coordinates": [
    { "lat": 11.5381, "lng": 76.4204 },
    { "lat": 11.5400, "lng": 76.4220 },
    { "lat": 11.5390, "lng": 76.4240 }
  ]
}
```

Response: (Same as example above)

---

## Agent Verification

### HCS Topic-Based Agent System

Each registered drone becomes an **autonomous AI agent** using Hedera Consensus Service (HCS).

### Agent Identity Structure

```
Drone Entity
    ├─ EVM Address: 0x...
    ├─ HCS Topic ID: 0.0.307216
    ├─ Agent Manifest: Signed JSON
    ├─ Capabilities: [patrol, surveillance, boundary-monitoring]
    └─ Permissions: zone access, mission execution
```

### Agent Manifest Format

```json
{
  "agentId": "0.0.307216",
  "droneId": "CAIRN-01",
  "version": "1.0.0",
  "capabilities": [
    "autonomous-patrol",
    "surveillance",
    "boundary-monitoring",
    "evidence-collection"
  ],
  "permissions": {
    "zoneAccess": "all",
    "missionExecution": true,
    "agentCommunication": true,
    "evidenceLogging": true
  },
  "createdAt": 1709554800,
  "signature": "0x...",
  "publicKey": "0x..."
}
```

### Agent Verification Process

```
1. User initiates drone selection on /analysis
   ↓
2. System fetches drone's HCS topic ID from registry
   ↓
3. Query HCS topic for latest agent manifest
   ↓
4. Verify manifest signature using Ed25519
   ↓
5. Check manifest capabilities and permissions
   ↓
6. Validate manifest creation timestamp
   ↓
7. Mark drone as "Agent Validated" ✅
   ↓
8. Award 10 points (10% of total score)
   ↓
9. Drone eligible for mission deployment
```

### Agent Communication Example

```
Drone A (Topic 0.0.307216)
    ↓ Submit message
Hedera Consensus Service
    ├─ Timestamp & sequence
    ├─ Cryptographic proof
    └─ Distributed to all nodes
        ↓
Drone B (Topic 0.0.307217)
    ↓ Receive & process message
    ↓ Execute cooperative action
```

---

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- MetaMask or Hedera Wallet Connect browser extension
- Hedera Testnet account with testnet HBAR tokens
- Basic understanding of blockchain concepts

### Installation

```bash
# Clone the repository
git clone https://github.com/jonathanvineet/cairn.git
cd cairn

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Edit .env.local with your configuration
nano .env.local
```

### Environment Configuration

**`.env.local`** (Required variables):

```env
# Hedera Network Configuration
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_RPC_URL=https://testnet.hashio.io/api

# Smart Contract Addresses (Testnet)
NEXT_PUBLIC_DRONE_REGISTRY_ADDRESS=0x5CE1B45F7af14D864146C16D6E1b168Ae599cFCf
NEXT_PUBLIC_BOUNDARY_ZONE_REGISTRY_ADDRESS=0xeEFfE09953FDCB844Ff69B67e46E8474B70f0E69

# Wallet Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Local Hedera Account (for backend operations)
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_OPERATOR_PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# Encryption
ENCRYPTION_SECRET=your_32_byte_hex_key
```

**Get Hedera Testnet HBAR**:
1. Visit [Hedera Faucet](https://portal.hedera.com/faucet)
2. Connect your wallet
3. Request testnet HBAR tokens

### Running Locally

```bash
# Start development server
npm run dev

# Server will start at http://localhost:3000
# Open browser and navigate to the landing page

# In another terminal, you can run scripts:
npm run test:connection    # Test Hedera connection
npm run verify:keys        # Verify key configuration
npm run check:contract     # Check contract status
```

### Building for Production

```bash
# Create production build
npm run build

# Test production build locally
npm start

# Build output in .next/ directory
```

---

## Project Structure

See [Project Structure](#project-structure) section above for detailed file organization.

---

## API Reference

### Authentication

All API endpoints are unauthenticated but require a valid wallet connection on the frontend.

### Drone Management APIs

#### GET `/api/drones`
Fetch all registered drones from the blockchain.

**Query Parameters**: None

**Response**:
```json
{
  "success": true,
  "drones": [
    {
      "cairnDroneId": "CAIRN-01",
      "evmAddress": "0x...",
      "model": "DJI M300 RTK",
      "status": "ACTIVE",
      "batteryLevel": 85,
      "location": {
        "lat": 11.5395,
        "lng": 76.4215
      },
      "health": "good",
      "agentTopicId": "307216",
      "isAgent": true,
      "registeredAt": "2024-03-14T10:30:00Z"
    }
  ],
  "count": 9
}
```

#### GET `/api/drones/:id`
Get specific drone details.

**Response**:
```json
{
  "success": true,
  "drone": { /* drone object */ }
}
```

#### POST `/api/drones/register`
Register a new drone in the system.

**Request**:
```json
{
  "walletAddress": "0x...",
  "cairnDroneId": "CAIRN-02",
  "location": {
    "latitude": 11.5381,
    "longitude": 76.4204
  },
  "model": "DJI M300 RTK"
}
```

**Response**:
```json
{
  "success": true,
  "drone": { /* registered drone object */ }
}
```

#### GET `/api/drones/status`
Get real-time status of all drones.

**Response**:
```json
{
  "success": true,
  "status": [
    {
      "cairnDroneId": "CAIRN-01",
      "battery": 85,
      "health": "good",
      "isOnline": true,
      "lastUpdate": "2024-03-14T10:35:00Z"
    }
  ]
}
```

### Zone Management APIs

#### GET `/api/zones`
Fetch all saved boundary zones.

**Response**:
```json
{
  "success": true,
  "zones": [
    {
      "zoneId": "Wayanad-01",
      "zoneName": "Wayanad Forest Boundary",
      "coordinates": [
        { "lat": 11.5381, "lng": 76.4204 },
        { "lat": 11.5400, "lng": 76.4220 },
        { "lat": 11.5390, "lng": 76.4240 },
        { "lat": 11.5370, "lng": 76.4210 }
      ],
      "assignedDrones": ["CAIRN-01", "CAIRN-02"],
      "createdAt": "2024-03-14T09:00:00Z",
      "transactionHash": "0x..."
    }
  ],
  "count": 5
}
```

#### POST `/api/zones/boundary`
Create a new boundary zone on the blockchain.

**Request**:
```json
{
  "zoneId": "Wayanad-01",
  "zoneName": "Wayanad Forest Boundary",
  "coordinates": [
    { "lat": 11.5381, "lng": 76.4204 },
    { "lat": 11.5400, "lng": 76.4220 },
    { "lat": 11.5390, "lng": 76.4240 },
    { "lat": 11.5370, "lng": 76.4210 }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "zone": {
    "zoneId": "Wayanad-01",
    "transactionHash": "0x...",
    "blockNumber": 12345678,
    "timestamp": "2024-03-14T09:00:00Z"
  }
}
```

#### POST `/api/zones/assign`
Assign a drone to a zone.

**Request**:
```json
{
  "zoneId": "Wayanad-01",
  "droneAddress": "0x..."
}
```

**Response**:
```json
{
  "success": true,
  "assignment": {
    "zoneId": "Wayanad-01",
    "droneAddress": "0x...",
    "assignedAt": "2024-03-14T09:05:00Z",
    "transactionHash": "0x..."
  }
}
```

### Analysis APIs

#### POST `/api/analysis`
Trigger the Eliza OS analysis for drone selection.

**Request**:
```json
{
  "zoneId": "Wayanad-01",
  "coordinates": [
    { "lat": 11.5381, "lng": 76.4204 },
    { "lat": 11.5400, "lng": 76.4220 },
    { "lat": 11.5390, "lng": 76.4240 }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "selectedDrone": {
      "cairnDroneId": "CAIRN-01",
      "evmAddress": "0x...",
      "score": 87,
      "confidence": 93.5
    },
    "thoughts": [
      {
        "phase": "assessment",
        "thought": "Loaded 9 drones from registry",
        "duration": 1050
      }
    ],
    "reasoning": "CAIRN-01 selected: Best proximity with high battery"
  }
}
```

### Patrol APIs

#### POST `/api/patrol/submit`
Submit a completed patrol mission.

**Request**:
```json
{
  "droneId": "CAIRN-01",
  "zoneId": "Wayanad-01",
  "timestamp": 1709554800,
  "evidence": [
    {
      "type": "image",
      "hash": "0x...",
      "ipfsUrl": "ipfs://..."
    }
  ]
}
```

#### POST `/api/patrol/verify-image`
Verify patrol evidence images.

#### GET `/api/patrol/blockchain`
Fetch patrol records from the blockchain.

---

## Utility Scripts

### Available Scripts

**Test Hedera Connection**
```bash
npm run test:connection
# Verifies your Hedera operator credentials
# Output: Connection status, account balance, network info
```

**Submit Patrol Mission**
```bash
npm run test:patrol
# Submit a test patrol mission to the blockchain
# Requires: valid operator credentials
```

**Verify Keys**
```bash
npm run verify:keys
# Verify that your public/private key pair is valid
# Output: Key pair validity, derived addresses
```

**Create Account from Mnemonic**
```bash
npm run create:account
# Create a new Hedera account from a mnemonic phrase
# Output: New account ID, public key, private key
```

**Extract Private Key**
```bash
npm run extract:key
# Extract private key from environment
# ⚠️ Security: Only use in development environments
```

**Check Contract Status**
```bash
npm run check:contract
# Verify deployed contracts are accessible
# Output: Contract addresses, ABI status
```

**Quick System Check**
```bash
npm run quick:check
# Run all diagnostic checks
# Output: Connection, keys, contracts, database
```

---

## Deployment

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
# Follow the prompts to connect your Git repository
```

### Docker Deployment

```bash
# Build Docker image
docker build -t cairn:latest .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_HEDERA_NETWORK=testnet \
  -e HEDERA_OPERATOR_ID=0.0.YOUR_ID \
  -e HEDERA_OPERATOR_PRIVATE_KEY=0x... \
  cairn:latest

# Container will start on port 3000
```

### Manual Server Deployment

```bash
# Build the application
npm run build

# Start production server
npm start

# Use process manager (PM2) for persistence
pm2 start "npm start" --name cairn
pm2 save
```

### Environment Variables for Production

```env
# Hedera Mainnet (for production)
NEXT_PUBLIC_HEDERA_NETWORK=mainnet
NEXT_PUBLIC_HEDERA_RPC_URL=https://mainnet.hashio.io/api

# Update contract addresses for mainnet
NEXT_PUBLIC_DRONE_REGISTRY_ADDRESS=MAINNET_ADDRESS
NEXT_PUBLIC_BOUNDARY_ZONE_REGISTRY_ADDRESS=MAINNET_ADDRESS

# Security
NODE_ENV=production
ENCRYPTION_SECRET=your_secure_32_byte_key
```

---

## Troubleshooting

### Common Issues

#### Issue: "Contract not found" error
**Solution**: Verify contract addresses in `.env.local` match deployed addresses for the network you're using.

#### Issue: Wallet connection fails
**Solution**: 
1. Clear browser cookies and cache
2. Ensure MetaMask is properly installed
3. Verify network is set to Hedera Testnet
4. Check WalletConnect project ID in environment

#### Issue: "Insufficient HBAR balance"
**Solution**: 
1. Request testnet HBAR from [Hedera Faucet](https://portal.hedera.com/faucet)
2. Wait for transaction confirmation
3. Refresh page and try again

#### Issue: Analysis returns no drones
**Solution**:
1. Verify drones are registered via `/api/drones`
2. Check drone status is "ACTIVE"
3. Ensure zone coordinates are valid
4. Try with a different zone

#### Issue: Zone not saving to blockchain
**Solution**:
1. Check Hedera account has sufficient balance
2. Verify zone coordinates are valid polygon
3. Check browser console for detailed error
4. Ensure metamask is connected

### Debug Mode

Enable verbose logging:

```typescript
// In .env.local
NEXT_PUBLIC_DEBUG_MODE=true
```

### Getting Help

1. **Check GitHub Issues**: https://github.com/jonathanvineet/cairn/issues
2. **Review Logs**: Check browser console and terminal logs
3. **Test Connection**: Run `npm run test:connection`
4. **Verify Config**: Run `npm run verify:keys`

---

## Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: ESLint + Prettier
- **Naming**: camelCase for variables, PascalCase for components/classes

### Running Linter

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

---

## Future Enhancements

- [ ] Real telemetry integration (live battery, health data from drones)
- [ ] Multi-drone coordination and swarm optimization
- [ ] Weather integration for mission planning
- [ ] Mission execution with real-time telemetry logging
- [ ] Advanced path planning algorithms
- [ ] Mobile app for field operations
- [ ] Historical mission analytics and reports
- [ ] Drone maintenance tracking
- [ ] Energy-efficient routing optimization
- [ ] AR visualization for drone operations

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Install dependencies
npm install

# Create feature branch
git checkout -b feature/your-feature

# Make changes and test
npm run dev

# Lint your code
npm run lint

# Push and create PR
git push origin feature/your-feature
```

---

## License

**Proprietary License** - CAIRN Project

This software is proprietary and confidential. Unauthorized copying, modification, or distribution is prohibited.

---

## Support & Contact

- **GitHub Issues**: [Create an issue](https://github.com/jonathanvineet/cairn/issues)
- **Email**: contact@cairn.io
- **Discord**: Join our community server

---

## Acknowledgments

- [Hedera Hashgraph](https://hedera.com/) for blockchain infrastructure
- [Next.js](https://nextjs.org/) for the React framework
- [Eliza OS](https://eliza.ai/) for AI analysis capabilities
- [Leaflet](https://leafletjs.com/) for mapping functionality

---

**Built with ❤️ for trustless drone operations on Hedera**

---

*Last Updated: 14 March 2026*
