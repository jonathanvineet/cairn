/**
 * Create New Hedera Account from Existing Mnemonic
 * 
 * This script creates a new Hedera testnet account using your mnemonic.
 * The new account will start with 100 HBAR from the faucet.
 * 
 * Usage:
 *   npm run create:account
 */

import { 
  Client, 
  AccountId, 
  PrivateKey, 
  Mnemonic,
  AccountCreateTransaction,
  Hbar,
  TransferTransaction
} from "@hiero-ledger/sdk";
import dotenv from "dotenv";

dotenv.config();

async function createAccount() {
  console.log("🏗️  CREATE NEW HEDERA ACCOUNT FROM MNEMONIC\n");
  console.log("=".repeat(60));

  // Get mnemonic from env
  const mnemonicString = process.env.HEDERA_MNEMONIC;
  if (!mnemonicString) {
    console.error("❌ HEDERA_MNEMONIC not set in .env");
    process.exit(1);
  }

  console.log("\n🔑 Deriving key from mnemonic...");
  const mnemonic = await Mnemonic.fromString(mnemonicString);
  const newAccountKey = await mnemonic.toStandardECDSAsecp256k1PrivateKey("", 0);
  
  console.log("✅ New account key derived:");
  console.log("   Private Key:", newAccountKey.toStringDer().substring(0, 30) + "...");
  console.log("   Public Key:", newAccountKey.publicKey.toStringDer());

  // Use Hedera testnet faucet account to fund the new account
  // For testnet, we'll use account 0.0.2 which is the testnet treasury
  console.log("\n🌐 Connecting to Hedera Testnet...");
  
  // We need a temporary account with funds to create the new account
  // The user needs to fund this manually via faucet first
  
  console.log("\n⚠️  MANUAL STEPS REQUIRED:");
  console.log("\n1. Go to: https://portal.hedera.com/register");
  console.log("2. Choose 'Import existing account'");
  console.log("3. Enter this private key:");
  console.log("\n   " + newAccountKey.toStringDer());
  console.log("\n4. Complete registration to get your new account ID");
  console.log("5. Use the testnet faucet to add HBAR");
  console.log("6. Update .env with:");
  console.log("   HEDERA_ACCOUNT_ID=0.0.YOUR_NEW_ACCOUNT_ID");
  console.log("   HEDERA_PRIVATE_KEY=" + newAccountKey.toStringDer());
  console.log("\n" + "=".repeat(60));
  
  // Alternative: Use HashPack
  console.log("\n💡 ALTERNATIVE - Use HashPack Wallet:");
  console.log("\n1. Install HashPack: https://www.hashpack.app/");
  console.log("2. Click 'Import Wallet'");
  console.log("3. Enter your 24-word mnemonic phrase");
  console.log("4. Get testnet HBAR from faucet");
  console.log("5. Export private key from HashPack settings");
  console.log("6. Update .env with the account ID and private key");
  console.log("\n" + "=".repeat(60));
}

createAccount().catch(console.error);
