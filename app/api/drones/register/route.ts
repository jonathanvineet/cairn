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
import { registerDroneAsAgent } from "@/lib/droneAgent";

export async function POST(req: Request) {
    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return Response.json({
                success: false,
                error: "Invalid JSON in request body"
            }, { status: 400 });
        }
        
        const {
            cairnDroneId,  // User's custom drone name like "drone-mumbai-andheri"
            serialNumber,
            model,
            dgcaCertNumber,
            certExpiryDate,
            assignedZoneId,
            sensorType,
            maxFlightMinutes,
            registeredByOfficerId,
            registrationLat,
            registrationLng,
        } = body;

        if (!cairnDroneId || !serialNumber || !model || !dgcaCertNumber || !assignedZoneId) {
            return Response.json({
                success: false,
                error: "Missing required fields (cairnDroneId, serialNumber, model, dgcaCertNumber, assignedZoneId)"
            }, { status: 400 });
        }

        if (!registrationLat || !registrationLng) {
            return Response.json({
                success: false,
                error: "Location is required for drone registration"
            }, { status: 400 });
        }

        // ─────────────────────────────────────────
        // STEP 1: Initialize Hedera client
        // ─────────────────────────────────────────
        const operatorId = process.env.HEDERA_OPERATOR_ID;
        const operatorKey = process.env.HEDERA_OPERATOR_PRIVATE_KEY;
        const encryptionSecret = process.env.ENCRYPTION_SECRET;

        if (!operatorId || operatorId === "0.0.XXXXXX") {
            return Response.json({
                success: false,
                error: "HEDERA_OPERATOR_ID is not configured. Get your free testnet account at https://portal.hedera.com"
            }, { status: 500 });
        }
        if (!operatorKey || operatorKey === "YOUR_REAL_PRIVATE_KEY_HERE") {
            return Response.json({
                success: false,
                error: "HEDERA_OPERATOR_PRIVATE_KEY is not configured. Get your free testnet account at https://portal.hedera.com"
            }, { status: 500 });
        }
        if (!encryptionSecret) {
            return Response.json({
                success: false,
                error: "ENCRYPTION_SECRET is not configured"
            }, { status: 500 });
        }

        // Parse the private key — handle all formats Hedera Portal may give:
        // • DER hex (302e020100...) → ED25519
        // • Raw 64-char hex        → ECDSA
        // • 0x-prefixed hex        → ECDSA (remove 0x prefix)
        // • Passphrase-derived     → ED25519
        let operatorPrivKey: PrivateKey;
        try {
            // Strip 0x prefix if present
            let keyString = operatorKey.startsWith("0x") ? operatorKey.slice(2) : operatorKey;
            
            if (keyString.startsWith("302e") || keyString.startsWith("3030")) {
                // DER-encoded ED25519 key from Hedera Portal
                operatorPrivKey = PrivateKey.fromStringED25519(keyString);
            } else if (keyString.startsWith("3026") || keyString.startsWith("3041")) {
                // DER-encoded ECDSA key
                operatorPrivKey = PrivateKey.fromStringECDSA(keyString);
            } else {
                // Raw hex — try ECDSA first, fallback to ED25519
                try {
                    operatorPrivKey = PrivateKey.fromStringECDSA(keyString);
                } catch {
                    operatorPrivKey = PrivateKey.fromStringED25519(keyString);
                }
            }
        } catch (e: any) {
            console.error("Key parsing error:", e);
            return Response.json({
                success: false,
                error: `Could not parse HEDERA_OPERATOR_PRIVATE_KEY: ${e.message}. Ensure you copied the full key from portal.hedera.com`
            }, { status: 500 });
        }

        const client = Client.forTestnet().setOperator(
            AccountId.fromString(operatorId),
            operatorPrivKey
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
        // STEP 4: Use custom CAIRN drone ID from user
        // ─────────────────────────────────────────
        // User provides their own drone name like "drone-mumbai-andheri"
        // Validate it's unique
        const existingDrone = await db.drones.findByCairnId(cairnDroneId);
        if (existingDrone) {
            return Response.json({
                success: false,
                error: `Drone with name "${cairnDroneId}" already exists. Please choose a different name.`
            }, { status: 400 });
        }

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
            registrationLat: Number(registrationLat),
            registrationLng: Number(registrationLng),
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
        // STEP 6.5: Register drone in Smart Contract
        // ─────────────────────────────────────────
        try {
            console.log("📝 Registering drone in blockchain smart contract...");
            await registerDroneInSmartContract({
                cairnDroneId,
                droneAccountId,
                assignedZoneId,
                model,
                operatorClient: client,
            });
            console.log("✅ Drone registered in smart contract successfully!");
        } catch (scError: any) {
            console.error("⚠️  Smart contract registration failed (non-fatal):", scError.message);
            // Non-fatal: continue with registration even if smart contract fails
        }

        // ─────────────────────────────────────────
        // STEP 7: Register drone as Hedera AI Agent
        //   - Creates a dedicated HCS topic (the agent's on-chain inbox)
        //   - Submits a signed agent manifest message to that topic
        //   - No NLP / no AI API key required — pure Hedera SDK
        // ─────────────────────────────────────────
        let agentTopicId: string | null = null;
        let agentManifestSequence: number | null = null;
        try {
            const agentResult = await registerDroneAsAgent(
                {
                    cairnDroneId,
                    hederaAccountId: droneAccountId,
                    evmAddress: droneEvmAddress,
                    model,
                    assignedZoneId,
                    registeredAt: new Date().toISOString(),
                    registrationLat: Number(registrationLat),
                    registrationLng: Number(registrationLng),
                },
                client,
                dronePrivateKey,
            );
            agentTopicId = agentResult.agentTopicId;
            agentManifestSequence = agentResult.agentManifestSequence;

            // Persist agent fields into the in-memory DB record
            await db.drones.update(drone.id, {
                agentTopicId,
                agentManifestSequence,
            });
        } catch (agentErr: any) {
            // Non-fatal: agent registration failure should not block drone registration
            console.error("⚠️  Agent registration failed (non-fatal):", agentErr.message);
        }

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
                // AI Agent fields
                agentTopicId,
                agentManifestSequence,
                isAgent: agentTopicId !== null,
                message: `Drone ${cairnDroneId} registered as Hedera AI Agent${agentTopicId ? ` (topic: ${agentTopicId})` : ""}.`
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
