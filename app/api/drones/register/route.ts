import {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
    AccountId,
} from "@hiero-ledger/sdk";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { mintDroneCredentialNFT, registerDroneInSmartContract } from "@/lib/hederaDroneHelpers";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            serialNumber,
            model,
            dgcaCertNumber,
            certExpiryDate,
            assignedZoneId,
            sensorType,
            maxFlightMinutes,
            registeredByOfficerId,
        } = body;

        // ─────────────────────────────────────────
        // STEP 1: Initialize Hedera client
        // ─────────────────────────────────────────
        const operatorId = process.env.HEDERA_OPERATOR_ID || "0.0.1234"; // Fallback for demo
        const operatorKey = process.env.HEDERA_OPERATOR_PRIVATE_KEY;
        const encryptionSecret = process.env.ENCRYPTION_SECRET || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

        if (!operatorKey) {
            throw new Error("HEDERA_OPERATOR_PRIVATE_KEY is not configured");
        }

        const client = Client.forTestnet().setOperator(
            AccountId.fromString(operatorId),
            PrivateKey.fromString(operatorKey)
        );

        // ─────────────────────────────────────────
        // STEP 2: Generate drone's own keypair
        // ─────────────────────────────────────────
        const dronePrivateKey = PrivateKey.generateECDSA();
        const dronePublicKey = dronePrivateKey.publicKey;

        // ─────────────────────────────────────────
        // STEP 3: Create Hedera account for the drone
        // ─────────────────────────────────────────
        const accountCreateTx = new AccountCreateTransaction()
            .setECDSAKeyWithAlias(dronePublicKey)
            .setInitialBalance(new Hbar(20))          // 20 HBAR initial funding
            .setAccountMemo(`CAIRN-DRONE-${serialNumber}`);

        const txResponse = await accountCreateTx.execute(client);
        const receipt = await txResponse.getReceipt(client);
        const droneAccountId = receipt.accountId!.toString();
        const droneEvmAddress = `0x${dronePublicKey.toEvmAddress()}`;

        // ─────────────────────────────────────────
        // STEP 4: Generate CAIRN drone ID
        // ─────────────────────────────────────────
        const droneCount = await db.drones.count();
        const cairnDroneId = `CAIRN-${String(droneCount + 1).padStart(2, "0")}`;

        // ─────────────────────────────────────────
        // STEP 5: Store in database
        // ─────────────────────────────────────────
        const encryptedPrivateKey = encrypt(
            dronePrivateKey.toString(),
            encryptionSecret
        );

        const drone = await db.drones.create({
            cairnDroneId,
            hederaAccountId: droneAccountId,
            hederaPublicKey: dronePublicKey.toString(),
            hederaPrivateKeyEncrypted: encryptedPrivateKey,
            evmAddress: droneEvmAddress,
            serialNumber,
            model,
            dgcaCertNumber,
            certExpiryDate: new Date(certExpiryDate),
            assignedZoneId,
            sensorType,
            maxFlightMinutes: Number(maxFlightMinutes),
            registeredByOfficerId,
            status: "ACTIVE",
            missionCount: 0,
            completionRate: null,
            registeredAt: new Date(),
            initialHBARBalance: 20,
        });

        // ─────────────────────────────────────────
        // STEP 6: Mint DroneCredential NFT
        // ─────────────────────────────────────────
        const nftResult = await mintDroneCredentialNFT({
            cairnDroneId,
            droneAccountId,
            serialNumber,
            model,
            assignedZoneId,
            dgcaCertNumber,
            certExpiryDate,
            sensorType,
            registeredByOfficerId,
        });

        // ─────────────────────────────────────────
        // STEP 7: Update BoundaryZoneRegistry.sol
        // ─────────────────────────────────────────
        await registerDroneInSmartContract({
            droneAccountId,
            assignedZoneId,
            operatorClient: client,
        });

        client.close();

        return Response.json({
            success: true,
            drone: {
                cairnDroneId,
                hederaAccountId: droneAccountId,
                evmAddress: droneEvmAddress,
                hederaPublicKey: dronePublicKey.toString(),
                serialNumber,
                model,
                assignedZoneId,
                status: "ACTIVE",
                initialBalance: "20 HBAR",
                nftSerialNumber: nftResult.serialNumber,
                message: `Drone ${cairnDroneId} registered. Hedera wallet created.`
            }
        });

    } catch (error: any) {
        console.error("DRONE REGISTRATION ERROR:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to register drone"
        }, { status: 500 });
    }
}
