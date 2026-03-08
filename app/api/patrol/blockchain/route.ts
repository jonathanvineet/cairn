import { NextRequest, NextResponse } from "next/server";
import { ContractExecuteTransaction, ContractFunctionParameters, ContractId, AccountId, PrivateKey, Mnemonic, Client } from "@hiero-ledger/sdk";
import { ethers } from "ethers";
import { DRONE_EVIDENCE_VAULT_ADDRESS } from "@/lib/contracts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { droneId, zoneId, ipfsCid, dataHash } = body;

    console.log("🔗 Submitting patrol to blockchain...");
    console.log("   Drone ID:", droneId);
    console.log("   Zone ID:", zoneId);
    console.log("   IPFS CID:", ipfsCid);
    console.log("   Data Hash:", dataHash);

    // Create Hedera client for testnet
    const client = Client.forTestnet();

    // Get account ID
    const accountIdString = process.env.HEDERA_ACCOUNT_ID;
    if (!accountIdString) {
      throw new Error("HEDERA_ACCOUNT_ID not set in .env");
    }
    const operatorId = AccountId.fromString(accountIdString);

    // Get private key (try multiple env vars)
    let operatorKey: PrivateKey;
    const privateKeyHex = process.env.HEDERA_OPERATOR_PRIVATE_KEY || process.env.HEDERA_PRIVATE_KEY;
    const mnemonicString = process.env.HEDERA_MNEMONIC;
    
    if (privateKeyHex) {
      // Handle both Ethereum-style (0x prefix) and direct hex
      const cleanKey = privateKeyHex.startsWith('0x') ? privateKeyHex.slice(2) : privateKeyHex;
      // For 32-byte raw keys, create ECDSA key
      if (cleanKey.length === 64) {
        operatorKey = PrivateKey.fromStringECDSA(cleanKey);
      } else {
        // For DER-encoded keys
        operatorKey = PrivateKey.fromString(cleanKey);
      }
    } else if (mnemonicString) {
      // Derive private key from mnemonic
      const mnemonic = await Mnemonic.fromString(mnemonicString);
      operatorKey = await mnemonic.toStandardECDSAsecp256k1PrivateKey("", 0);
    } else {
      throw new Error("Either HEDERA_OPERATOR_PRIVATE_KEY, HEDERA_PRIVATE_KEY or HEDERA_MNEMONIC must be set in .env");
    }
    
    client.setOperator(operatorId, operatorKey);

    // Convert EVM address to ContractId
    const contractId = ContractId.fromEvmAddress(0, 0, DRONE_EVIDENCE_VAULT_ADDRESS);

    // Prepare function parameters
    // Ensure dataHash is exactly 32 bytes
    let hashBytes: Uint8Array;
    try {
      // Remove 0x prefix if present
      const cleanHash = dataHash.startsWith('0x') ? dataHash.slice(2) : dataHash;
      // Pad to 64 chars (32 bytes) if needed
      const paddedHash = cleanHash.padEnd(64, '0').substring(0, 64);
      // Convert to bytes
      hashBytes = ethers.getBytes('0x' + paddedHash);
      
      if (hashBytes.length !== 32) {
        throw new Error(`Hash must be 32 bytes, got ${hashBytes.length}`);
      }
    } catch (err) {
      console.error("Hash conversion error:", err);
      throw new Error(`Invalid dataHash format: ${dataHash}`);
    }
    
    const functionParameters = new ContractFunctionParameters()
      .addString(droneId)
      .addString(zoneId)
      .addString(ipfsCid)
      .addBytes32(Array.from(hashBytes) as number[]);

    // Check if drone is registered first
    console.log("🔍 Checking if drone is registered...");
    try {
      // If drone is not registered, register it first
      const registerParams = new ContractFunctionParameters().addString(droneId);
      const registerTx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(150000)
        .setFunction("registerDrone", registerParams)
        .freezeWith(client);
      
      // Sign the registration transaction
      const signedRegisterTx = await registerTx.sign(operatorKey);
      
      console.log("📝 Registering drone (if not already registered)...");
      const registerResponse = await signedRegisterTx.execute(client);
      await registerResponse.getReceipt(client);
      console.log("✅ Drone registration verified");
    } catch (regError: any) {
      // If error is "already registered", that's fine, continue
      if (!regError.message?.includes("already registered")) {
        console.log("ℹ️ Registration check:", regError.message);
      }
    }

    // Create the patrol submission transaction
    const transaction = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(500000)
      .setFunction("submitPatrol", functionParameters);

    // Freeze transaction with client before signing
    console.log("🔒 Freezing transaction...");
    const frozenTx = await transaction.freezeWith(client);
    
    // Explicitly sign the transaction with operator key
    console.log("✍️ Signing transaction with operator key...");
    console.log("   Operator Account:", operatorId.toString());
    console.log("   Operator Key (public):", operatorKey.publicKey.toString());
    const signedTx = await frozenTx.sign(operatorKey);

    console.log("⏳ Executing contract transaction...");
    const txResponse = await signedTx.execute(client);
    
    console.log("⏳ Getting receipt...");
    const receipt = await txResponse.getReceipt(client);
    
    console.log("✅ Transaction successful!");
    console.log("   Transaction ID:", txResponse.transactionId.toString());
    console.log("   Status:", receipt.status.toString());

    client.close();

    return NextResponse.json({
      success: true,
      transactionId: txResponse.transactionId.toString(),
      status: receipt.status.toString(),
      droneId,
      zoneId,
      ipfsCid
    });

  } catch (error: any) {
    console.error("❌ Blockchain submission error:", error);
    console.error("   Error type:", error.constructor.name);
    console.error("   Error message:", error.message);
    if (error.status) {
      console.error("   Hedera Status:", error.status.toString());
    }
    
    let errorMessage = error instanceof Error ? error.message : "Failed to submit to blockchain";
    
    // Provide helpful error messages
    if (errorMessage.includes('INVALID_SIGNATURE')) {
      errorMessage = "Transaction signature is invalid. The private key may not match the account. Please verify your HEDERA_MNEMONIC or provide HEDERA_PRIVATE_KEY in .env";
    } else if (errorMessage.includes('INSUFFICIENT_TX_FEE')) {
      errorMessage = "Insufficient transaction fee. Increase gas limit or check account balance.";
    } else if (errorMessage.includes('INSUFFICIENT_ACCOUNT_BALANCE')) {
      errorMessage = "Insufficient account balance. Please add HBAR to account " + process.env.HEDERA_ACCOUNT_ID;
    } else if (errorMessage.includes('CONTRACT_REVERT_EXECUTED')) {
      errorMessage = "Contract execution reverted. The drone may not be registered or contract parameters may be invalid.";
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error.message
      },
      { status: 500 }
    );
  }
}
