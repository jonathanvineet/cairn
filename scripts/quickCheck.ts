/**
 * Simple Account Check - No Private Key Required
 */

import { Client, AccountId, AccountBalanceQuery, PublicKey } from "@hiero-ledger/sdk";

async function quickCheck() {
  console.log("🔍 QUICK ACCOUNT CHECK (No Private Key Needed)\n");
  console.log("=".repeat(60));
  
  const client = Client.forTestnet();
  
  const accountId = "0.0.8106120";
  
  try {
    console.log("\n💰 Checking balance for", accountId);
    const balance = await new AccountBalanceQuery()
      .setAccountId(AccountId.fromString(accountId))
      .execute(client);
    
    console.log("✅ Balance:", balance.hbars.toString());
    console.log("   Account exists and has funds!");
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
  
  console.log("\n📝 YOUR PRIVATE KEY IN .ENV:");
  console.log("   Starts with: 3030020100300706052b8104000a042204...");
  console.log("\n❓ IS THIS KEY FROM:");
  console.log("   A) HashPack → Settings → Export Private Key for account 0.0.8106120");
  console.log("   B) Your mnemonic phrase (recovery words)");
  console.log("\n💡 If B, then the key doesn't match account 0.0.8106120");
  console.log("   You need to export the ACTUAL key from HashPack for that specific account.");
  
  console.log("\n=".repeat(60));
  client.close();
}

quickCheck();
