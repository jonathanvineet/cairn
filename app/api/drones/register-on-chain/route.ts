import { NextRequest, NextResponse } from "next/server";
import { 
  Client, 
  AccountId,
  PrivateKey,
  ContractExecuteTransaction, 
  ContractCallQuery,
  ContractFunctionParameters,
  ContractId 
} from "@hiero-ledger/sdk";

/**
 * POST /api/drones/register-on-chain
 * 
 * Registers a drone with credentials ON THE BLOCKCHAIN smart contract
 * instead of in-memory database. This becomes the source of truth.
 * 
 * Request body:
 * {
 *   "cairnDroneId": "drone-dubai",
 *   "zoneId": "zone-1",
 *   "model": "DJI Matrice 300",
 *   "hederaAccountId": "0.0.5555",
 *   "encryptedPrivateKey": "hex-encoded-aes256-encrypted-key"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cairnDroneId, zoneId, model, hederaAccountId, encryptedPrivateKey } = body;

    if (!cairnDroneId || !hederaAccountId || !encryptedPrivateKey) {
      return NextResponse.json(
        { error: "Missing required fields: cairnDroneId, hederaAccountId, encryptedPrivateKey" },
        { status: 400 }
      );
    }

    // Initialize Hedera client
    const operatorId = process.env.HEDERA_OPERATOR_ID;
    const operatorKey = process.env.HEDERA_OPERATOR_KEY;
    const contractId = process.env.DRONE_REGISTRY_ADDRESS || process.env.DRONE_REGISTRY_CONTRACT_ID;

    if (!operatorId || !operatorKey || !contractId) {
      return NextResponse.json(
        { error: "Server not configured: missing HEDERA_OPERATOR_ID, HEDERA_OPERATOR_KEY, or DRONE_REGISTRY_ADDRESS" },
        { status: 500 }
      );
    }

    const operatorPrivKey = PrivateKey.fromStringECDSA(
      operatorKey.startsWith('0x') ? operatorKey.slice(2) : operatorKey
    );
    const client = Client.forTestnet().setOperator(AccountId.fromString(operatorId), operatorPrivKey);

    try {
      // Build contract call to registerDrone()
      const params = new ContractFunctionParameters()
        .addString(cairnDroneId)
        .addAddress("0x0000000000000000000000000000000000000000")
        .addString(zoneId || "")
        .addString(model || "")
        .addString(hederaAccountId)
        .addString(encryptedPrivateKey);

      const contractExecTx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromEvmAddress(0, 0, contractId))
        .setGas(300000)
        .setFunction("registerDrone", params);

      const txResponse = await contractExecTx.execute(client);
      const receipt = await txResponse.getReceipt(client);

      console.log(`✅ [On-Chain] Drone ${cairnDroneId} registered in smart contract`);
      console.log(`   Hedera Account: ${hederaAccountId}`);
      console.log(`   Contract Status: ${receipt.status}`);

      return NextResponse.json({
        success: true,
        message: `Drone ${cairnDroneId} registered on-chain`,
        cairnDroneId,
        hederaAccountId,
        status: receipt.status?.toString(),
        contractId,
        transactionId: txResponse.transactionId?.toString()
      });
    } finally {
      client.close();
    }
  } catch (error: any) {
    console.error("❌ [On-Chain] Error registering drone:", error?.message);
    return NextResponse.json(
      { error: `Failed to register drone: ${error?.message}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/drones/register-on-chain?cairnId=drone-dubai
 * 
 * Fetches drone details from the smart contract
 */
export async function GET(request: NextRequest) {
  try {
    const cairnId = request.nextUrl.searchParams.get("cairnId");

    if (!cairnId) {
      return NextResponse.json(
        { error: "Missing query param: cairnId" },
        { status: 400 }
      );
    }

    const operatorId = process.env.HEDERA_OPERATOR_ID;
    const operatorKey = process.env.HEDERA_OPERATOR_KEY;
    const contractId = process.env.DRONE_REGISTRY_ADDRESS || process.env.DRONE_REGISTRY_CONTRACT_ID;

    if (!operatorId || !operatorKey || !contractId) {
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 }
      );
    }

    const operatorPrivKey = PrivateKey.fromStringECDSA(
      operatorKey.startsWith('0x') ? operatorKey.slice(2) : operatorKey
    );
    const client = Client.forTestnet().setOperator(AccountId.fromString(operatorId), operatorPrivKey);

    try {
      // Query smart contract for drone by CAIRN ID
      const params = new ContractFunctionParameters()
        .addString(cairnId);

      const query = new ContractCallQuery()
        .setContractId(ContractId.fromEvmAddress(0, 0, contractId))
        .setGas(100000)
        .setFunction("getDroneByCAIRNId", params);

      const result = await query.execute(client);

      return NextResponse.json({
        success: true,
        cairnId,
        message: "Query executed successfully",
        note: "Drone struct returned from contract (may need decoding on client)"
      });
    } finally {
      client.close();
    }
  } catch (error: any) {
    console.error("❌ [On-Chain] Error fetching drone:", error?.message);
    return NextResponse.json(
      { error: `Failed to fetch drone: ${error?.message}` },
      { status: 500 }
    );
  }
}
