# Hedera Smart Contract Deployment Guide

## 📁 Project Structure

```
test/
├── contracts/           # Solidity smart contracts
│   ├── SimpleCounter.sol        # Basic counter contract
│   ├── DroneRegistry.sol        # Drone registration
│   └── MissionTracker.sol       # Mission tracking
├── deployContracts.ts   # Deployment script
├── hederaContractTest.ts # Test suite
└── DEPLOYMENT_GUIDE.md  # This file
```

## 🚀 Quick Start

### Prerequisites
```bash
# Install required packages
npm install --save-dev hardhat ethers

# Or for TypeScript
npm install --save-dev hardhat ethers typescript ts-node

# Install Hedera SDK (already in your package.json)
npm install @hiero-ledger/sdk
```

### Get Testnet HBAR
1. Visit: https://portal.hedera.com/faucet
2. Sign in with your wallet
3. Get 50 test HBAR
4. Copy your Account ID and Private Key

### Set Environment Variables

```bash
# Add to .env or .env.local
HEDERA_OPERATOR_ID="0.0.xxxxx"
HEDERA_OPERATOR_KEY="302e020100300506032b6570042204203..."
HEDERA_NETWORK="testnet"

# For WalletConnect (already in your project)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_project_id"
```

## 📝 Contract Descriptions

### SimpleCounter
A basic contract demonstrating fundamental Solidity patterns.

**Functions:**
- `increment()` - Add 1 to counter
- `decrement()` - Subtract 1 from counter
- `getCount()` - View current count
- `setCount(uint256)` - Owner only, set count directly
- `reset()` - Owner only, reset to 0

**Events:**
- `CountIncremented(uint256 newCount)`
- `CountDecremented(uint256 newCount)`
- `CountReset(address resetBy)`

**Use Case:** Learn contract basics, understand state changes and events

### DroneRegistry
Manages drone registration and status tracking on Hedera.

**Functions:**
- `registerDrone(string droneId)` - Register a new drone
- `updateDroneStatus(string droneId, string status)` - Update mission status
- `deactivateDrone(string droneId)` - Deactivate a drone
- `getDrone(string droneId)` - Get drone information
- `getOwnerDrones(address)` - Get all drones owned by address
- `getTotalDrones()` - Get total registered drones

**Data Structure:**
```solidity
struct Drone {
    string droneId;
    address owner;
    uint256 registeredAt;
    bool isActive;
    string missionStatus;
}
```

**Use Case:** Register and track drones, manage ownership and status

### MissionTracker
Tracks drone missions from creation to completion.

**Functions:**
- `createMission(...)` - Create a new mission
- `startMission(uint256 missionId)` - Start a pending mission
- `completeMission(uint256 missionId)` - Mark as completed
- `failMission(uint256 missionId)` - Mark as failed
- `getMission(uint256 missionId)` - Get mission details

**Mission Statuses:**
```
PENDING (0)    - Created but not started
ACTIVE (1)     - Currently in progress
COMPLETED (2)  - Successfully completed
FAILED (3)     - Failed during execution
CANCELLED (4)  - Cancelled by coordinator
```

**Use Case:** Track mission lifecycle, log events for audit trail

## 🔧 Deployment Methods

### Method 1: Using Hardhat (Recommended)

```bash
# Initialize Hardhat project
npx hardhat init

# Edit hardhat.config.ts to add Hedera network:
```

**hardhat.config.ts:**
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    "hedera-testnet": {
      url: "https://testnet.hashio.io/api",
      accounts: [process.env.HEDERA_OPERATOR_KEY || ""],
      chainId: 296,
    },
  },
};

export default config;
```

**Deploy Script (scripts/deploy.ts):**
```typescript
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying SimpleCounter...");
  const Counter = await ethers.getContractFactory("SimpleCounter");
  const counter = await Counter.deploy();
  await counter.waitForDeployment();
  
  console.log("Counter deployed to:", await counter.getAddress());
}

main();
```

**Run Deployment:**
```bash
npx hardhat run scripts/deploy.ts --network hedera-testnet
```

### Method 2: Using Custom Deployment Script

```bash
npx ts-node test/deployContracts.ts
```

### Method 3: Using Remix IDE

1. Go to https://remix.ethereum.org
2. Create new files for each contract
3. Compile the contracts
4. Deploy using "Injected Web3" with your wallet

## 🧪 Testing Contracts

### Run Test Suite
```bash
npx ts-node test/hederaContractTest.ts
```

### Test Locally with Hardhat
```bash
npx hardhat test
```

**Example Test File (test/SimpleCounter.test.ts):**
```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SimpleCounter", function () {
  it("Should increment counter", async function () {
    const Counter = await ethers.getContractFactory("SimpleCounter");
    const counter = await Counter.deploy();
    
    await counter.increment();
    const count = await counter.getCount();
    
    expect(count).to.equal(1);
  });
});
```

Run tests:
```bash
npx hardhat test
```

## 📊 Monitor Deployments

### HashScan (Hedera Block Explorer)

1. **Testnet:** https://hashscan.io/testnet
2. **Mainnet:** https://hashscan.io/mainnet

**Find your contract:**
- Paste contract address in search bar
- View all transactions
- Check contract state and events
- Verify on-chain code

## 🔗 Integrate with Next.js App

### 1. Add Contract ABI to your project

```typescript
// lib/abis/SimpleCounter.json
[
  {
    "inputs": [],
    "name": "increment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ... more ABI entries
]
```

### 2. Create Contract Hook

```typescript
// lib/useSimpleCounter.ts
import { useContract } from "@/lib/useContract";
import SimpleCounterABI from "@/lib/abis/SimpleCounter.json";

export function useSimpleCounter() {
  const contractAddress = "0x..."; // Your deployed contract
  const { contract, callFunction, executeFunction } = 
    useContract(contractAddress, SimpleCounterABI);

  const getCount = async () => {
    return await callFunction("getCount");
  };

  const increment = async () => {
    return await executeFunction("increment");
  };

  return { getCount, increment };
}
```

### 3. Use in Components

```tsx
// components/CounterWidget.tsx
import { useSimpleCounter } from "@/lib/useSimpleCounter";
import { useState } from "react";

export function CounterWidget() {
  const { getCount, increment } = useSimpleCounter();
  const [count, setCount] = useState(0);

  const handleIncrement = async () => {
    await increment();
    const newCount = await getCount();
    setCount(Number(newCount));
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleIncrement}>Increment</button>
    </div>
  );
}
```

## 🛡️ Security Considerations

1. **Private Keys**
   - Never commit `.env` files to git
   - Use environment variables for sensitive data
   - Rotate keys regularly

2. **Gas Limits**
   - Hedera uses different gas model than Ethereum
   - SimpleCounter: ~50,000 gas
   - DroneRegistry: ~100,000-150,000 gas
   - MissionTracker: ~150,000-200,000 gas

3. **Contract Verification**
   - Verify source code on HashScan
   - Allows users to see contract code
   - Increases trust in your contracts

## 🌐 Network Configuration

### Hedera Testnet
```
RPC: https://testnet.hashio.io/api
Chain ID: 296
Explorer: https://hashscan.io/testnet
```

### Hedera Mainnet
```
RPC: https://mainnet.hashio.io/api
Chain ID: 295
Explorer: https://hashscan.io/mainnet
```

## 🚀 Deployment Checklist

- [ ] Contracts written and compiled
- [ ] Tests passing locally
- [ ] Environment variables set
- [ ] Testnet HBAR obtained
- [ ] Deployment script ready
- [ ] Contracts deployed to testnet
- [ ] Verified on HashScan
- [ ] Integrated into app
- [ ] UI components created
- [ ] Ready for mainnet deployment

## 📚 Useful Resources

- **Hedera SDK:** https://docs.hedera.com/sdks/
- **Solidity Docs:** https://docs.soliditylang.org/
- **Hardhat Docs:** https://hardhat.org/docs
- **Ethers.js Docs:** https://docs.ethers.org/
- **HashScan Explorer:** https://hashscan.io/

## 🐛 Troubleshooting

### Contract Not Deploying
```
Error: Bytecode too large
→ Optimize contract, remove unnecessary code
```

### Transaction Failing
```
Error: Insufficient gas
→ Increase gasLimit in deployment script
```

### Contract Not Found on HashScan
```
→ Wait a few seconds for indexing
→ Check transaction receipt in logs
→ Verify contract address is correct
```

## ✨ Next Steps

1. Compile your contracts
2. Deploy to Hedera Testnet
3. Test transactions on HashScan
4. Integrate into your dashboard
5. Create monitoring UI
6. Deploy to mainnet when confident

Happy deploying! 🎉
