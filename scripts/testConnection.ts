/**
 * Test Hedera Connection
 * Verifies your account credentials and checks balance
 */

import { Client, AccountId, PrivateKey, Mnemonic, AccountBalanceQuery } from "@hiero-ledger/sdk";
import dotenv from "dotenv";

dotenv.config();

async function testConnection() {
  console.log("🔍 Testing Hedera Connection...\n");
  console.log("=".repeat(50));

  try {
    // Get account ID
    const accountIdString = process.env.HEDERA_ACCOUNT_ID;
    if (!accountIdString) {
      throw new Error("❌ HEDERA_ACCOUNT_ID not set in .env");
    }
    console.log("✅ Account ID:", accountIdString);

    // Get private key
    let operatorKey: PrivateKey;
    if (process.env.HEDERA_PRIVATE_KEY) {
      operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);
      console.log("✅ Using private key from .env");
    } else if (process.env.HEDERA_MNEMONIC) {
      const mnemonic = await Mnemonic.fromString(process.env.HEDERA_MNEMONIC);
      operatorKey = await mnemonic.toStandardECDSAsecp256k1PrivateKey("", 0);
      console.log("✅ Derived private key from mnemonic");
    } else {
      throw new Error("❌ Neither HEDERA_PRIVATE_KEY nor HEDERA_MNEMONIC set in .env");
    }

    // Create client
    const client = Client.forTestnet();
    const operatorId = AccountId.fromString(accountIdString);
    client.setOperator(operatorId, operatorKey);

    console.log("✅ Client created for Testnet");

    // Get account balance
    console.log("\n🔍 Fetching account balance...");
    const balance = await new AccountBalanceQuery()
      .setAccountId(operatorId)
      .execute(client);

    console.log("✅ Account Balance:", balance.hbars.toString());

    // Check if account has enough HBAR
    const hbarAmount = balance.hbars.toTinybars().toNumber() / 100_000_000;
    if (hbarAmount < 1) {
      console.log("\n⚠️  Warning: Low balance!");
      console.log("   You may need more testnet HBAR for transactions");
      console.log("   Visit: https://portal.hedera.com/faucet");
    } else {
      console.log("✅ Sufficient balance for transactions");
    }

    client.close();

    console.log("\n" + "=".repeat(50));
    console.log("✅ Connection test successful!");
    console.log("=".repeat(50));
    console.log("\n🚀 Ready to submit patrols to blockchain!");
    console.log("\nNext steps:");
    console.log("  npm run dev              # Start the app");
    console.log("  npm run test:patrol      # Test patrol submission");

  } catch (error) {
    console.log("\n" + "=".repeat(50));
    console.log("❌ Connection test failed!");
    console.log("=".repeat(50));
    console.error("\nError:", error instanceof Error ? error.message : error);
    
    console.log("\n💡 Troubleshooting:");
    console.log("  1. Check .env file exists with correct values");
    console.log("  2. Verify HEDERA_ACCOUNT_ID format: 0.0.XXXXXXX");
    console.log("  3. Verify HEDERA_MNEMONIC has 24 words");
    console.log("  4. Check account exists on Hedera Testnet");
    
    process.exit(1);
  }
}

testConnection();
