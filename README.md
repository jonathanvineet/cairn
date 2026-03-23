# CAIRN - Autonomous Drone Patrol System on Hedera

<div align="center">

**Trustless Drone Operations for India's Airspace**

A sophisticated autonomous drone patrol and mission management system built on the Hedera network.

[🚀 Getting Started](#getting-started) • [📖 API Reference](#api-reference) • [🔗 Smart Contracts](#smart-contracts)

</div>

---

## Overview

CAIRN is a complete drone management and patrol system that:

- **Registers drones** as autonomous AI agents on the Hedera network
- **Creates and manages boundary zones** with on-chain records
- **Analyzes available drones** using multi-criteria AI algorithms
- **Verifies drone agents** via Hedera Consensus Service (HCS)
- **Selects optimal drones** for specific missions using Eliza OS analysis
- **Records patrol evidence** with immutable blockchain proof

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [System Architecture](#system-architecture)
3. [Smart Contracts](#smart-contracts)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [API Reference](#api-reference)
7. [Features](#features)

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16.1.6
- **UI**: React 19.2.3, Tailwind CSS 3.4.17
- **Maps**: React Leaflet 5.0.0
- **State**: Zustand 5.0.11
- **Icons**: Lucide React 0.542.0

### Blockchain & Web3
- **Network**: Hedera Testnet
- **RPC**: Ethers.js 6.16.0
- **Wallet**: Hedera Wallet Connect 2.0.6
- **Contracts**: Solidity 0.8.34
- **Hedera SDK**: @hashgraph/sdk 2.80.0

### Development
- **Language**: TypeScript 5.0
- **Build**: Turbopack
- **Linting**: ESLint 9
- **Script Runner**: tsx 4.21.0

---

## System Architecture

```
┌──────────────────────────────────────────────────┐
│   User Interface (Next.js Pages)                 │
│   Dashboard → Deploy → Analysis → Register      │
└──────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────┐
│   API Layer (Next.js Route Handlers)             │
│   /api/drones/* | /api/zones/* | /api/analysis  │
└──────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────┐
│   Core Business Logic                            │
│   elizaAnalysis.ts | droneAgent.ts               │
│   agentValidator.ts | contracts.ts               │
└──────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────┐
│   Blockchain Layer (Hedera)                      │
│   Smart Contracts | HCS Topics                   │
└──────────────────────────────────────────────────┘
```

### State Management

- **walletStore.ts**: Wallet connection and account state
- **missionStore.ts**: Current mission and drone selection
- **worldStore.ts**: Zones and drone fleet data
- **uiStore.ts**: UI toggles and modal states

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

### Deployed Contracts (Hedera Testnet)

| Contract | Address |
|----------|---------|
| **DroneRegistry** | `0x5CE1B45F7af14D864146C16D6E1b168Ae599cFCf` |
| **BoundaryZoneRegistry** | `0x2e6F40553B4C66591152F82eA6a611269A0D6A84` |
| **DroneEvidenceRegistry** | TBD |

### DroneRegistry

Registers and tracks all drone metadata.

**Key Functions**:
```solidity
registerDrone(string cairnId, address evmAddress, string model, uint64 topicId)
getDrone(address droneAddress)
getTotalDrones()
updateDroneStatus(address droneAddress, uint8 status)
```

### BoundaryZoneRegistry

Manages mission boundary zones and coordinates.

**Key Functions**:
```solidity
createZone(string zoneId, string zoneName, Coordinate[] coordinates)
getZone(string zoneId)
assignDroneToZone(string zoneId, address droneAddress)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Hedera Wallet Connect browser extension
- Hedera Testnet account with HBAR tokens

### Installation

```bash
git clone https://github.com/jonathanvineet/cairn.git
cd cairn
npm install
cp .env.example .env.local
```

### Environment Setup

Edit `.env.local` with your configuration:

```env
HEDERA_TESTNET_RPC=https://testnet.hashio.io/api
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_OPERATOR_KEY=0xYOUR_PRIVATE_KEY
ENCRYPTION_SECRET=your_32_byte_hex_key

DRONE_REGISTRY_ADDRESS=0x5CE1B45F7af14D864146C16D6E1b168Ae599cFCf
ZONE_REGISTRY_ADDRESS=0x2e6F40553B4C66591152F82eA6a611269A0D6A84

ELIZA_API_URL=http://localhost:3000
PINATA_JWT=your_pinata_jwt_token
```

### Running

```bash
# Development
npm run dev
# Server at http://localhost:3001

# Production build
npm run build
npm start
```

### Get Testnet HBAR

Visit [Hedera Faucet](https://portal.hedera.com/faucet) to request testnet tokens.

---

## Project Structure

```
cairn/
├── app/                           # Next.js pages
│   ├── page.tsx                   # Landing page
│   ├── layout.tsx                 # Root layout
│   ├── dashboard/                 # Dashboard page
│   ├── deploy/                    # Zone creation
│   ├── analysis/                  # AI drone analysis
│   ├── register/                  # Drone registration
│   ├── evidence/                  # Evidence display
│   └── api/                       # API routes
│
├── components/                    # React components
│   ├── WalletConnect.tsx          # Wallet UI
│   ├── InteractiveMap.tsx         # Map logic
│   ├── LocationPicker.tsx         # Location selection
│   ├── MapComponent.tsx           # Leaflet wrapper
│   └── ui/                        # UI components
│
├── lib/                           # Core functions
│   ├── elizaAnalysis.ts           # AI analysis
│   ├── droneAgent.ts              # HCS agent
│   ├── agentValidator.ts          # Verification
│   ├── contracts.ts               # Contract ABIs
│   ├── hedera-connector.ts        # Hedera SDK
│   ├── droneBlockchainFetcher.ts  # Fetch data
│   ├── encryption.ts              # Encryption
│   ├── geoUtils.ts                # Geo calcs
│   └── utils.ts                   # Utilities
│
├── stores/                        # Zustand stores
│   ├── walletStore.ts             # Wallet state
│   ├── missionStore.ts            # Mission state
│   ├── uiStore.ts                 # UI state
│   └── worldStore.ts              # World state
│
├── scripts/                       # Utility scripts
├── public/                        # Static assets
└── test/                          # Smart contracts
```

---

## API Reference

### Drone Management

**GET `/api/drones`** - List all registered drones
```json
{
  "drones": [
    {
      "cairnDroneId": "CAIRN-01",
      "evmAddress": "0x...",
      "model": "DJI M300 RTK",
      "batteryLevel": 85,
      "location": { "lat": 11.5395, "lng": 76.4215 },
      "health": "good"
    }
  ]
}
```

**POST `/api/drones/register`** - Register new drone
```json
{
  "walletAddress": "0x...",
  "cairnDroneId": "CAIRN-01",
  "model": "DJI M300 RTK",
  "location": { "latitude": 11.5381, "longitude": 76.4204 }
}
```

**GET `/api/drones/:id`** - Get specific drone details

**GET `/api/drones/:id/status`** - Get operational status

### Zone Management

**GET `/api/zones`** - List all zones

**POST `/api/zones/boundary`** - Create new zone
```json
{
  "zoneId": "Wayanad-01",
  "zoneName": "Wayanad Forest Boundary",
  "coordinates": [
    { "lat": 11.5381, "lng": 76.4204 },
    { "lat": 11.5400, "lng": 76.4220 }
  ]
}
```

**POST `/api/zones/assign`** - Assign drone to zone

### Analysis

**POST `/api/analysis`** - Trigger Eliza analysis for drone selection
```json
{
  "zoneId": "Wayanad-01",
  "coordinates": [...]
}
```

---

## Features

### 🚁 Drone Management
- Register drones with unique Cairn IDs
- Track battery, health, and location
- Autonomous agent registration on Hedera
- Persistent blockchain records

### 🗺️ Zone Management
- Interactive map interface with pin drops
- Polygon boundary creation
- Blockchain storage of zones
- Zone selection for missions

### 🧠 AI Analysis
- 5-phase Eliza OS reasoning engine
- Multi-criteria drone scoring:
  - Battery Level (35%)
  - Proximity to Zone (30%)
  - Health Status (25%)
  - Agent Validation (10%)
- Confidence scoring (50-100%)
- Real-time visualization

### ✅ Agent Verification
- HCS topic-based identity
- Ed25519 signature verification
- Manifest validation
- Permission checking

### 📊 Dashboard
- Fleet overview
- Real-time drone status
- Zone management
- Mission history
