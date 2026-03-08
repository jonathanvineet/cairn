/**
 * Verify Hedera Account Keys
 * 
 * This script helps diagnose INVALID_SIGNATURE errors by:
 * 1. Deriving private key from mnemonic
 * 2. Checking account balance
 * 3. Verifying public key matches account
 * 4. Testing transaction signing
 * 
 * Usage:
 *   npm run verify:keys
 */

import { 
  Client, 
  AccountId, 
  PrivateKey, 
  Mnemonic,
  AccountBalanceQuery,
  AccountInfoQuery,
  TransferTransaction,
  Hbar
} from "@hiero-ledger/sdk";
import dotenv from "dotenv";

dotenv.config();

async function verifyKeys() {
  console.log("🔐 HEDERA KEY VERIFICATION TOOL\n");
  console.log("=".repeat(60));

  // Step 1: Get environment variables
  const accountIdString = process.env.HEDERA_ACCOUNT_ID;
  const mnemonicString = process.env.HEDERA_MNEMONIC;
  const privateKeyString = process.env.HEDERA_PRIVATE_KEY;

  if (!accountIdString) {
    console.error("❌ HEDERA_ACCOUNT_ID not set in .env");
    process.exit(1);
  }

  console.log("\n📋 Environment Variables:");
  console.log("   HEDERA_ACCOUNT_ID:", accountIdString);
  console.log("   HEDERA_MNEMONIC:", mnemonicString ? "✅ Set" : "❌ Not set");
  console.log("   HEDERA_PRIVATE_KEY:", privateKeyString ? "✅ Set" : "❌ Not set");

  // Step 2: Derive private key
  let derivedKey: PrivateKey;
  let keySource: string;

  try {
    if (privateKeyString) {
      console.log("\n🔑 Using HEDERA_PRIVATE_KEY from .env");
      // Use fromString() which auto-detects key type
      derivedKey = PrivateKey.fromString(privateKeyString);
      keySource = "HEDERA_PRIVATE_KEY (" + derivedKey.type + ")";
    } else if (mnemonicString) {
      console.log("\n🔑 Deriving key from HEDERA_MNEMONIC");
      const mnemonic = await Mnemonic.fromString(mnemonicString);
      
      // Try different derivation indices
      console.log("   Trying derivation index 0...");
      derivedKey = await mnemonic.toStandardECDSAsecp256k1PrivateKey("", 0);
      keySource = "HEDERA_MNEMONIC (index 0)";
    } else {
      console.error("❌ Neither HEDERA_PRIVATE_KEY nor HEDERA_MNEMONIC is set");
      process.exit(1);
    }

    console.log("✅ Key derived successfully");
    console.log("   Source:", keySource);
    console.log("   Private Key:", derivedKey.toStringDer().substring(0, 20) + "...");
    console.log("   Public Key:", derivedKey.publicKey.toStringDer());
  } catch (error: any) {
    console.error("❌ Failed to derive key:", error.message);
    process.exit(1);
  }

  // Step 3: Create client and set operator
  console.log("\n🌐 Connecting to Hedera Testnet...");
  const client = Client.forTestnet();
  const accountId = AccountId.fromString(accountIdString);
  client.setOperator(accountId, derivedKey);

  // Step 4: Query account balance
  try {
    console.log("\n💰 Querying Account Balance...");
    const balance = await new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(client);

    console.log("✅ Account Balance:", balance.hbars.toString());
    
    if (balance.hbars.toBigNumber().lt(1)) {
      console.warn("⚠️  WARNING: Low balance! Add more HBAR for transactions.");
    }
  } catch (error: any) {
    console.error("❌ Failed to query balance:", error.message);
  }

  // Step 5: Query account info and verify keys
  try {
    console.log("\n🔍 Querying Account Info...");
    const accountInfo = await new AccountInfoQuery()
      .setAccountId(accountId)
      .execute(client);

    console.log("✅ Account Info Retrieved:");
    console.log("   Account ID:", accountInfo.accountId.toString());
    console.log("   Account Key:", accountInfo.key.toString());
    console.log("   Derived Public Key:", derivedKey.publicKey.toString());
    
    // Check if keys match
    const accountKeyString = accountInfo.key.toString();
    const derivedKeyString = derivedKey.publicKey.toString();
    
    if (accountKeyString === derivedKeyString) {
      console.log("✅ ✅ ✅ KEYS MATCH! Your configuration is correct.");
    } else {
      console.log("❌ ❌ ❌ KEYS DO NOT MATCH!");
      console.log("   This is why you're getting INVALID_SIGNATURE errors.");
      console.log("\n📝 SOLUTION:");
      console.log("   1. Get the actual private key for account", accountIdString);
      console.log("   2. Add it to .env as:");
      console.log("      HEDERA_PRIVATE_KEY=" + accountKeyString);
      console.log("\n   OR");
      console.log("   3. Create a new account using this mnemonic");
      console.log("   4. Update HEDERA_ACCOUNT_ID to the new account");
    }
  } catch (error: any) {
    console.error("❌ Failed to query account info:", error.message);
    console.error("   This might be a network issue or insufficient permissions");
  }

  // Step 6: Test transaction signing (dry-run)
  try {
    console.log("\n✍️  Testing Transaction Signing...");
    
    // Create a simple transfer transaction (we won't execute it)
    const testTx = new TransferTransaction()
      .addHbarTransfer(accountId, new Hbar(-0.001))
      .addHbarTransfer("0.0.3", new Hbar(0.001))
      .freezeWith(client);
    
    // Try to sign it
    const signedTx = await testTx.sign(derivedKey);
    
    console.log("✅ Transaction signing successful");
    console.log("   Signature length:", signedTx.getSignatures().size);
    console.log("   (Transaction not executed - this was a dry run)");
  } catch (error: any) {
    console.error("❌ Failed to sign transaction:", error.message);
  }

  // Step 7: Alternative derivation paths (if using mnemonic)
  if (mnemonicString && !privateKeyString) {
    console.log("\n🔄 Trying Alternative Derivation Indices...");
    try {
      const mnemonic = await Mnemonic.fromString(mnemonicString);
      
      for (let i = 0; i <= 5; i++) {
        const altKey = await mnemonic.toStandardECDSAsecp256k1PrivateKey("", i);
        console.log(`   Index ${i}: ${altKey.publicKey.toString()}`);
      }
      
      console.log("\n💡 If any of these public keys match your account key,");
      console.log("   update the derivation index in the blockchain API code.");
    } catch (error: any) {
      console.error("   Error testing alternatives:", error.message);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Verification Complete\n");

  client.close();
}

verifyKeys().catch((error) => {
  console.error("\n💥 Unexpected error:", error);
  process.exit(1);
});
