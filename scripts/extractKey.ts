/**
 * Extract Private Key from Mnemonic
 * 
 * This simply shows you the private key derived from your mnemonic
 * so you can use it to import into HashPack or Hedera Portal.
 * 
 * Usage:
 *   npm run extract:key
 */

import { Mnemonic } from "@hiero-ledger/sdk";
import dotenv from "dotenv";

dotenv.config();

async function extractKey() {
  const mnemonicString = process.env.HEDERA_MNEMONIC;
  
  if (!mnemonicString) {
    console.error("❌ HEDERA_MNEMONIC not set in .env");
    process.exit(1);
  }

  console.log("🔑 EXTRACTING PRIVATE KEY FROM MNEMONIC\n");
  console.log("=".repeat(60));
  
  const mnemonic = await Mnemonic.fromString(mnemonicString);
  
  console.log("\n📋 Derivation Index 0 (Standard):");
  const key0 = await mnemonic.toStandardECDSAsecp256k1PrivateKey("", 0);
  console.log("\nPrivate Key (DER format):");
  console.log(key0.toStringDer());
  console.log("\nPrivate Key (Raw hex):");
  console.log(key0.toStringRaw());
  console.log("\nPublic Key:");
  console.log(key0.publicKey.toStringDer());
  
  console.log("\n" + "=".repeat(60));
  console.log("\n💡 NEXT STEPS:\n");
  console.log("1. Import this private key into HashPack or Hedera Portal");
  console.log("2. This will create a NEW account OR import existing one");
  console.log("3. Get the account ID (e.g., 0.0.123456)");
  console.log("4. Update your .env:\n");
  console.log("   HEDERA_ACCOUNT_ID=0.0.YOUR_NEW_ACCOUNT_ID");
  console.log("   HEDERA_PRIVATE_KEY=" + key0.toStringDer());
  console.log("\n" + "=".repeat(60));
  
  console.log("\n⚠️  IMPORTANT:");
  console.log("   The mnemonic you have does NOT match account 0.0.8106120");
  console.log("   You need to either:");
  console.log("   A) Get the correct private key for 0.0.8106120");
  console.log("   B) Use the key above to create/import a NEW account");
  console.log("\n");
}

extractKey().catch(console.error);
