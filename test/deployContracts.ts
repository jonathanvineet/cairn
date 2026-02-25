/**
 * Hedera Smart Contract Deployment Script
 * Deploy contracts to Hedera Testnet
 * 
 * Usage: npx ts-node test/deployContracts.ts
 */

import {
  Client,
  ContractCreateFlow,
  ContractExecuteTransaction,
  ContractCallQuery,
  ContractFunctionParameters,
  FileCreateTransaction,
  Hbar,
  PrivateKey,
  AccountId,
} from "@hiero-ledger/sdk";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
const OPERATOR_ID = process.env.HEDERA_OPERATOR_ID || "";
const OPERATOR_KEY = process.env.HEDERA_OPERATOR_KEY || "";
const NETWORK = process.env.HEDERA_NETWORK || "testnet";

if (!OPERATOR_ID || !OPERATOR_KEY) {
  throw new Error("HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY must be set");
}

const client = Client.forTestnet();
client.setOperator(AccountId.fromString(OPERATOR_ID), PrivateKey.fromStringED25519(OPERATOR_KEY));

/**
 * Deploy a contract from bytecode
 */
async function deployContract(
  contractName: string,
  bytecode: string,
  gasLimit: number = 100000
): Promise<string> {
  console.log(`\n📦 Deploying ${contractName}...`);

  try {
    // Create file with contract bytecode
    const fileCreateTx = new FileCreateTransaction()
      .setKeys([client.operatorPublicKey!])
      .setContents(Buffer.from(bytecode, "hex"))
      .setMaxTransactionFee(new Hbar(2));

    const fileCreateTxResponse = await fileCreateTx.execute(client);
    const fileCreateTxReceipt = await fileCreateTxResponse.getReceipt(client);
    const bytecodeFileId = fileCreateTxReceipt.fileId;

    console.log(`  ✅ Bytecode file created: ${bytecodeFileId}`);

    // Deploy contract
    const contractCreateTx = new ContractCreateFlow()
      .setBytecode(Buffer.from(bytecode, "hex"))
      .setGas(gasLimit)
      .setConstructorParameters(new ContractFunctionParameters());

    const contractCreateTxResponse = await contractCreateTx.execute(client);
    const contractCreateTxReceipt = await contractCreateTxResponse.getReceipt(client);
    const contractId = contractCreateTxReceipt.contractId;

    console.log(`  ✅ Contract deployed: ${contractId}`);
    return contractId!.toString();
  } catch (error) {
    console.error(`  ❌ Error deploying ${contractName}:`, error);
    throw error;
  }
}

/**
 * Call a contract function
 */
async function callContractFunction(
  contractId: string,
  functionName: string,
  params: any[] = []
): Promise<any> {
  console.log(`\n📞 Calling ${functionName} on ${contractId}...`);

  try {
    const query = new ContractCallQuery()
      .setContractId(contractId)
      .setFunction(functionName)
      .setGas(100000);

    const result = await query.execute(client);
    console.log(`  ✅ Result:`, result);
    return result;
  } catch (error) {
    console.error(`  ❌ Error calling function:`, error);
    throw error;
  }
}

/**
 * Execute a contract transaction (state-changing)
 */
async function executeContractTransaction(
  contractId: string,
  functionName: string,
  params: any[] = []
): Promise<string> {
  console.log(`\n⚙️  Executing ${functionName} on ${contractId}...`);

  try {
    const tx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setFunction(functionName)
      .setGas(100000)
      .setMaxTransactionFee(new Hbar(1));

    const txResponse = await tx.execute(client);
    const txReceipt = await txResponse.getReceipt(client);

    console.log(`  ✅ Transaction executed: ${txResponse.transactionId}`);
    return txResponse.transactionId.toString();
  } catch (error) {
    console.error(`  ❌ Error executing transaction:`, error);
    throw error;
  }
}

/**
 * Main deployment flow
 */
async function main() {
  console.log("🚀 Hedera Smart Contract Deployment");
  console.log(`Network: ${NETWORK}`);
  console.log(`Operator: ${OPERATOR_ID}`);

  try {
    // Example bytecode for SimpleCounter (you'll need actual compiled bytecode)
    const simpleCounterBytecode =
      "608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610261806100606000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80630c55699c1461005c57806306661abd1461007a5780630d0e30db146100985780635b34b966146100a257806373d4a13a146100be575b600080fd5b61006461012c565b6040516100719190610188565b60405180910390f35b610082610132565b60405161008f9190610188565b60405180910390f35b6100a0610155565b005b6100bc60048036038101906100b791906101a3565b610171565b005b6100da60048036038101906100d591906101a3565b6101d0565b6040516100e79190610188565b60405180910390f35b6000806000905090505b81811015610123576000808154809291906101119061020e565b9190505549806001019050505050610108565b50565b60015481565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6001600081548092919061016990610251565b919050555b565b806000808154809291906101859061020e565b919050555050565b6000819050919050565b610198816101aa565b82525050565b600060208201905061018c6000830184610190565b92915050565b6000819050919050565b600080fd5b6101a981610191565b81146101b457600080fd5b50565b6000813590506101c6816101a0565b92915050565b6000602082840312156101de57600080fd5b60006101ec848285016101b7565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600061022b826101a9565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820361025d5761025c6101f5565b5b600182019050919050565b600061027482610191565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820361029f5761029e6101f5565b5b600182019050919050565b6101a8806102b86000396000fef2a26469706673582212205f5d7d8e8f8e8f8e8f8e8f8e8f8e8f8e8f8e8f8e8f8e8f8e8f8e8f8e8f8e8f64736f6c63430008110033";

    console.log("\n📋 Contracts to deploy:");
    console.log("  1. SimpleCounter");
    console.log("  2. DroneRegistry");
    console.log("  3. MissionTracker");

    console.log("\n⚠️  Note: The bytecode above is a placeholder.");
    console.log("You need to compile the Solidity contracts to get actual bytecode.");
    console.log("Use: solc --optimize --bin contracts/SimpleCounter.sol");

    console.log("\n💡 To deploy real contracts:");
    console.log("1. Install Solidity compiler: npm install -g solc");
    console.log("2. Compile contracts: solc --optimize --bin test/contracts/*.sol");
    console.log("3. Replace bytecode in this script with compiled output");
    console.log("4. Set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY environment variables");
    console.log("5. Run: npx ts-node test/deployContracts.ts");

    // Uncomment below to deploy when you have actual bytecode
    /*
    const counterContractId = await deployContract("SimpleCounter", simpleCounterBytecode);
    
    // Test the contract
    await executeContractTransaction(counterContractId, "increment");
    await callContractFunction(counterContractId, "getCount");
    
    // Save contract addresses
    const deploymentLog = {
      timestamp: new Date().toISOString(),
      network: NETWORK,
      operator: OPERATOR_ID,
      contracts: {
        SimpleCounter: counterContractId,
      },
    };
    
    fs.writeFileSync(
      path.join(__dirname, "deploymentLog.json"),
      JSON.stringify(deploymentLog, null, 2)
    );
    
    console.log("\n✅ Deployment complete! Saved to deploymentLog.json");
    */
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main();
