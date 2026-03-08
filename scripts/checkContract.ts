/**
 * Check if DroneEvidenceVault contract exists
 */

import { Client, AccountId, PrivateKey, ContractInfoQuery, ContractId } from "@hiero-ledger/sdk";
import dotenv from "dotenv";

dotenv.config();

const DRONE_EVIDENCE_VAULT_ADDRESS = "0x4873df8de78955b758F0b81808c4c01aA52A382A";

async function checkContract() {
  console.log("🔍 CHECKING CONTRACT STATUS\n");
  console.log("=".repeat(60));
  
  const accountIdString = process.env.HEDERA_ACCOUNT_ID;
  const privateKeyString = process.env.HEDERA_PRIVATE_KEY;
  
  if (!accountIdString || !privateKeyString) {
    console.error("❌ Missing credentials in .env");
    process.exit(1);
  }
  
  const client = Client.forTestnet();
  const operatorId = AccountId.fromString(accountIdString);
  const operatorKey = PrivateKey.fromString(privateKeyString);
  
  client.setOperator(operatorId, operatorKey);
  
  console.log("\n📋 Configuration:");
  console.log("   Network: Hedera Testnet");
  console.log("   Account:", accountIdString);
  console.log("   Contract Address:", DRONE_EVIDENCE_VAULT_ADDRESS);
  
  try {
    // Convert EVM address to ContractId
    const contractId = ContractId.fromEvmAddress(0, 0, DRONE_EVIDENCE_VAULT_ADDRESS);
    console.log("   Contract ID (Hedera format):", contractId.toString());
    
    // Query contract info (doesn't require signing)
    console.log("\n🔍 Querying contract info...");
    const contractInfo = await new ContractInfoQuery()
      .setContractId(contractId)
      .execute(client);
    
    console.log("✅ CONTRACT EXISTS!");
    console.log("   Contract ID:", contractInfo.contractId.toString());
    console.log("   Admin Key:", contractInfo.adminKey?.toString() || "None");
    console.log("   Storage:", contractInfo.storage.toString());
    console.log("   Created:", new Date(contractInfo.expirationTime.toDate()).toISOString());
    
  } catch (error: any) {
    console.error("\n❌ CONTRACT NOT FOUND OR ERROR:");
    console.error("   ", error.message);
    console.log("\n💡 Possible issues:");
    console.log("   1. Contract doesn't exist at this address on TESTNET");
    console.log("   2. Contract might be on MAINNET instead");
    console.log("   3. Contract address is incorrect");
    console.log("\n   Check contract deployment or get correct address.");
  }
  
  client.close();
  console.log("\n" + "=".repeat(60));
}

checkContract().catch(console.error);
