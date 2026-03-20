import { ethers } from "ethers";

const DRONE_EVIDENCE_VAULT_ADDRESS = "0x4873df8de78955b758F0b81808c4c01aA52A382A";

const VAULT_ABI = [
  {
    inputs: [{ internalType: "string", name: "droneId", type: "string" }],
    name: "getDroneEvidence",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "evidenceId", type: "uint256" }],
    name: "getEvidenceImage",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "evidenceId", type: "uint256" },
          { internalType: "string", name: "droneId", type: "string" },
          { internalType: "string", name: "zoneId", type: "string" },
          { internalType: "bytes32", name: "imageHash", type: "bytes32" },
          { internalType: "string", name: "ipfsCid", type: "string" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "address", name: "submittedBy", type: "address" },
          { internalType: "bool", name: "verified", type: "bool" },
        ],
        internalType: "struct DroneEvidenceVault.EvidenceImage",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalEvidence",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

async function queryMissionHistory(droneId: string) {
  const rpc = process.env.HEDERA_TESTNET_RPC || "https://testnet.hashio.io/api";

  console.log(`\n${"=".repeat(70)}`);
  console.log(`📋 MISSION HISTORY: ${droneId.toUpperCase()}`);
  console.log(`${"=".repeat(70)}\n`);

  try {
    const provider = new ethers.JsonRpcProvider(rpc);
    const contract = new ethers.Contract(
      DRONE_EVIDENCE_VAULT_ADDRESS,
      VAULT_ABI,
      provider
    );

    // Get total evidence count
    const totalEvidence = await contract.getTotalEvidence();
    console.log(`📊 Total Evidence Submissions on Blockchain: ${totalEvidence}\n`);

    // Get drone's evidence IDs
    console.log(`🔍 Querying evidence for drone: ${droneId}`);
    const evidenceIds = await contract.getDroneEvidence(droneId);

    if (evidenceIds.length === 0) {
      console.log(`   ⚠️  No evidence records found for this drone`);
      console.log(`\n${"=".repeat(70)}\n`);
      return;
    }

    console.log(
      `✅ Found ${evidenceIds.length} evidence submission(s)\n`
    );

    // Display each evidence record
    for (let i = 0; i < evidenceIds.length; i++) {
      const evidenceId = evidenceIds[i];
      const evidence = await contract.getEvidenceImage(evidenceId);

      const timestamp = new Date(Number(evidence.timestamp) * 1000).toISOString();
      const isVerified = evidence.verified ? "✅ VERIFIED" : "⏳ PENDING";

      console.log(
        `\n📸 Evidence #${Number(evidence.evidenceId)} - ${isVerified}`
      );
      console.log(`   Drone: ${evidence.droneId}`);
      console.log(`   Zone: ${evidence.zoneId}`);
      console.log(`   Timestamp: ${timestamp}`);
      console.log(`   Image Hash: ${evidence.imageHash.substring(0, 16)}...`);
      if (evidence.ipfsCid) {
        console.log(`   IPFS CID: ${evidence.ipfsCid}`);
        console.log(
          `   IPFS Link: https://ipfs.io/ipfs/${evidence.ipfsCid}`
        );
      }
      console.log(`   Submitted By: ${evidence.submittedBy}`);
    }

    // Summary
    console.log(`\n${"=".repeat(70)}`);
    console.log(`📊 MISSION SUMMARY`);
    console.log(`${"=".repeat(70)}`);
    console.log(`   Total Submissions: ${evidenceIds.length}`);
    const verified = (
      await Promise.all(
        evidenceIds.map((id) => contract.getEvidenceImage(id))
      )
    ).filter((e) => e.verified).length;
    console.log(`   Verified: ${verified}`);
    console.log(`   Pending: ${evidenceIds.length - verified}`);
    console.log(`\n${"=".repeat(70)}\n`);
  } catch (error: any) {
    console.error(`❌ Error querying contract:`, error.message);
  }
}

// Get drone ID from command line or use default
const droneId = process.argv[2] || "sfgsfg";
queryMissionHistory(droneId);
