# 🚀 Quick Deployment Steps

## Step 1: Prepare Your Environment

```bash
# Get testnet HBAR
# 1. Go to https://portal.hedera.com/faucet
# 2. Sign in and claim 50 test HBAR
# 3. Copy your Account ID (0.0.xxxxx)
# 4. Copy your Private Key (starts with 302e...)

# Set environment variables
export HEDERA_OPERATOR_ID="0.0.xxxxx"
export HEDERA_OPERATOR_KEY="302e020100300506032b6570042204203..."
export HEDERA_NETWORK="testnet"
```

## Step 2: Install Dependencies

```bash
# Option A: Using Hardhat (Recommended)
npm install --save-dev hardhat ethers typescript ts-node @nomicfoundation/hardhat-toolbox

# Option B: Minimal setup
npm install --save-dev ethers typescript ts-node
```

## Step 3: Compile Contracts

### Option A: Using Solc (Simple)
```bash
# Install solc
npm install -g solc

# Compile contracts
solc --optimize --bin test/contracts/SimpleCounter.sol -o build/
solc --optimize --bin test/contracts/DroneRegistry.sol -o build/
solc --optimize --bin test/contracts/MissionTracker.sol -o build/
```

### Option B: Using Hardhat (Full-Featured)
```bash
# Create hardhat.config.ts in project root
cat > hardhat.config.ts << 'EOF'
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
EOF

# Compile
npx hardhat compile
```

## Step 4: Deploy Contracts

### Using Hardhat (Recommended)
```bash
# Create deployment script
mkdir -p scripts

cat > scripts/deploy.ts << 'EOF'
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying SimpleCounter...");
  const Counter = await ethers.getContractFactory("SimpleCounter");
  const counter = await Counter.deploy();
  await counter.waitForDeployment();
  console.log("Deployed to:", await counter.getAddress());

  console.log("Deploying DroneRegistry...");
  const Registry = await ethers.getContractFactory("DroneRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  console.log("Deployed to:", await registry.getAddress());

  console.log("Deploying MissionTracker...");
  const Tracker = await ethers.getContractFactory("MissionTracker");
  const tracker = await Tracker.deploy();
  await tracker.waitForDeployment();
  console.log("Deployed to:", await tracker.getAddress());
}

main();
EOF

# Deploy
npx hardhat run scripts/deploy.ts --network hedera-testnet
```

### Using Custom Script
```bash
npx ts-node test/deployContracts.ts
```

### Using Remix (No Installation)
1. Go to https://remix.ethereum.org
2. Create files: SimpleCounter.sol, DroneRegistry.sol, MissionTracker.sol
3. Paste contract code from test/contracts/
4. Click "Compile" (left sidebar)
5. Click "Deploy & Run Transactions"
6. Change environment to "Injected Web3"
7. Click Deploy button
8. Confirm transaction in your wallet

## Step 5: Monitor on HashScan

1. Go to https://hashscan.io/testnet
2. Paste your contract address
3. View transactions, state, and events

## Example: Deploy SimpleCounter

```typescript
import { ethers } from "hardhat";

async function deploy() {
  // Get contract factory
  const Counter = await ethers.getContractFactory("SimpleCounter");
  
  // Deploy
  const counter = await Counter.deploy();
  const address = await counter.getAddress();
  
  console.log("SimpleCounter deployed to:", address);
  
  // Test it
  let count = await counter.getCount();
  console.log("Initial count:", count); // 0
  
  // Increment
  await counter.increment();
  count = await counter.getCount();
  console.log("After increment:", count); // 1
  
  // Decrement
  await counter.decrement();
  count = await counter.getCount();
  console.log("After decrement:", count); // 0
}

deploy();
```

## Example: Deploy DroneRegistry

```typescript
async function deployDroneRegistry() {
  const Registry = await ethers.getContractFactory("DroneRegistry");
  const registry = await Registry.deploy();
  const address = await registry.getAddress();
  
  console.log("DroneRegistry deployed to:", address);
  
  // Register a drone
  await registry.registerDrone("DRONE-001");
  console.log("Registered drone: DRONE-001");
  
  // Update status
  await registry.updateDroneStatus("DRONE-001", "patrol");
  
  // Get drone info
  const drone = await registry.getDrone("DRONE-001");
  console.log("Drone info:", drone);
  
  // Get all drones owned by you
  const signers = await ethers.getSigners();
  const myDrones = await registry.getOwnerDrones(signers[0].address);
  console.log("My drones:", myDrones);
}

deployDroneRegistry();
```

## Example: Deploy MissionTracker

```typescript
async function deployMissionTracker() {
  const Tracker = await ethers.getContractFactory("MissionTracker");
  const tracker = await Tracker.deploy();
  const address = await tracker.getAddress();
  
  console.log("MissionTracker deployed to:", address);
  
  // Create a mission
  const tx = await tracker.createMission(
    "DRONE-001",  // droneId
    3600,         // duration (1 hour in seconds)
    "Zone-A",     // destination
    500           // altitude limit (meters)
  );
  
  console.log("Mission created. Transaction:", tx.hash);
  
  // Get mission details
  const mission = await tracker.getMission(0);
  console.log("Mission 0:", mission);
  
  // Start mission
  await tracker.startMission(0);
  console.log("Mission started");
  
  // Complete mission
  await tracker.completeMission(0);
  console.log("Mission completed");
}

deployMissionTracker();
```

## Using with Next.js

### 1. Install contract into your app
```bash
# Copy ABI from compilation output
mkdir -p lib/abis

# Extract and save ABI (from hardhat/artifacts/contracts/)
cp artifacts/contracts/SimpleCounter.sol/SimpleCounter.json lib/abis/
```

### 2. Create contract hook
```typescript
// lib/useSimpleCounter.ts
import { useCallback, useState } from "react";
import { ethers } from "ethers";
import SimpleCounterABI from "@/lib/abis/SimpleCounter.json";

const CONTRACT_ADDRESS = "0x..."; // Your deployed address

export function useSimpleCounter() {
  const [loading, setLoading] = useState(false);

  const getCount = useCallback(async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      SimpleCounterABI,
      provider
    );
    return await contract.getCount();
  }, []);

  const increment = useCallback(async () => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        SimpleCounterABI,
        signer
      );
      const tx = await contract.increment();
      await tx.wait();
      return tx;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getCount, increment, loading };
}
```

### 3. Use in component
```tsx
// components/CounterDemo.tsx
import { useSimpleCounter } from "@/lib/useSimpleCounter";
import { useEffect, useState } from "react";

export function CounterDemo() {
  const { getCount, increment, loading } = useSimpleCounter();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    getCount().then(c => setCount(Number(c)));
  }, []);

  return (
    <div>
      <h2>Counter: {count}</h2>
      <button 
        onClick={() => {
          increment().then(() => getCount()).then(setCount);
        }}
        disabled={loading}
      >
        {loading ? "Loading..." : "Increment"}
      </button>
    </div>
  );
}
```

## Troubleshooting

| Error | Solution |
|-------|----------|
| "Bytecode too large" | Optimize contract or remove unnecessary code |
| "Insufficient funds" | Get more test HBAR from faucet |
| "Contract not found" | Wait for block confirmation, check address |
| "Invalid RPC URL" | Verify HEDERA_NETWORK setting |
| "Account not found" | Ensure HEDERA_OPERATOR_ID is correct |

## Next Steps

✅ Compile contracts
✅ Deploy to Testnet
✅ Verify on HashScan
✅ Integrate with Next.js
✅ Test on dashboard
✅ Deploy to Mainnet (when ready)

---

📚 Full documentation: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
