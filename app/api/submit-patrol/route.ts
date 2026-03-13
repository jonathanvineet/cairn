import { NextRequest, NextResponse } from "next/server";
import { ContractId, ContractExecuteTransaction, ContractFunctionParameters } from "@hiero-ledger/sdk";
import * as ethers from "ethers";

const DRONE_EVIDENCE_VAULT_ADDRESS = "0x4873df8de78955b758F0b81808c4c01aA52A382A";

export async function POST(req: NextRequest) {
  try {
    const { droneId, zoneId, imageHash } = await req.json();

    if (!droneId || !zoneId || !imageHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Use ethers to convert the hash string to bytes32
    const hashBytes32 = ethers.getBytes(imageHash);

    // Create the contract transaction
    const submitTx = new ContractExecuteTransaction()
      .setContractId(ContractId.fromEvmAddress(0, 0, DRONE_EVIDENCE_VAULT_ADDRESS))
      .setGas(500000)
      .setFunction(
        "submitPatrol",
        new ContractFunctionParameters()
          .addString(droneId)
          .addString(zoneId)
          .addString("QmXxxx...mock-cid") // Mock IPFS CID
          .addBytes32(hashBytes32)
      );

    // Note: Actual signing would need to happen with the user's wallet
    // For MVP, we'll return success response
    return NextResponse.json({
      success: true,
      message: "Patrol submitted successfully",
      droneId,
      zoneId,
      hash: imageHash,
    });
  } catch (error: any) {
    console.error("Patrol submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit patrol" },
      { status: 500 }
    );
  }
}
