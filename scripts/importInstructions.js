/**
 * Import Account into HashPack
 * 
 * Instructions for creating a new account with your existing key
 */

console.log("📱 IMPORT YOUR KEY INTO HASHPACK\n");
console.log("=".repeat(60));

console.log("\n🔑 Your Private Key (from mnemonic):\n");
console.log("3030020100300706052b8104000a0422042054fab83642115e66a02d3644355ed11d3d8d89c86cd80d5bb1dc757797b285d7");
console.log("\n");

console.log("📋 STEPS TO CREATE NEW ACCOUNT:\n");
console.log("1. Open HashPack wallet");
console.log("2. Click Menu (☰) → Add Account → Import Account");
console.log("3. Choose 'Import Private Key'");
console.log("4. Paste the key above");
console.log("5. Name it something like 'Cairn Drone Account'");
console.log("6. Switch to TESTNET in settings");
console.log("7. Get testnet HBAR from: https://portal.hedera.com/\n");

console.log("8. Write down the NEW account ID (e.g., 0.0.1234567)\n");

console.log("9. Update your .env file:");
console.log("   HEDERA_ACCOUNT_ID=0.0.YOUR_NEW_ACCOUNT_ID");
console.log("   HEDERA_PRIVATE_KEY=3030020100300706052b8104000a0422042054fab83642115e66a02d3644355ed11d3d8d89c86cd80d5bb1dc757797b285d7\n");

console.log("=".repeat(60));
console.log("\n💡 This will create a NEW account that matches your key!");
console.log("   The old account 0.0.8106120 was created with a different key.\n");
