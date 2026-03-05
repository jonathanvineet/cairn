import {
    Client,
    PrivateKey,
    TransferTransaction,
    Hbar,
    AccountId,
} from "@hiero-ledger/sdk";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

/**
 * POST /api/drones/test-transfer
 * Streams live progress as each drone sends 2 HBAR to the operator account
 */
export async function POST(req: Request) {
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
        async start(controller) {
            const sendMessage = (data: any) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            try {
                const operatorId = process.env.HEDERA_OPERATOR_ID;
                const operatorKey = process.env.HEDERA_OPERATOR_PRIVATE_KEY;
                const encryptionSecret = process.env.ENCRYPTION_SECRET;

                if (!operatorId || !operatorKey || !encryptionSecret) {
                    sendMessage({
                        type: 'error',
                        error: "Missing environment variables"
                    });
                    controller.close();
                    return;
                }

                // Parse operator private key
                let operatorPrivKey: PrivateKey;
                try {
                    let keyString = operatorKey.startsWith("0x") ? operatorKey.slice(2) : operatorKey;
                    if (keyString.startsWith("302e") || keyString.startsWith("3030")) {
                        operatorPrivKey = PrivateKey.fromStringED25519(keyString);
                    } else if (keyString.startsWith("3026") || keyString.startsWith("3041")) {
                        operatorPrivKey = PrivateKey.fromStringECDSA(keyString);
                    } else {
                        try {
                            operatorPrivKey = PrivateKey.fromStringECDSA(keyString);
                        } catch {
                            operatorPrivKey = PrivateKey.fromStringED25519(keyString);
                        }
                    }
                } catch (e: any) {
                    sendMessage({
                        type: 'error',
                        error: `Could not parse HEDERA_OPERATOR_PRIVATE_KEY: ${e.message}`
                    });
                    controller.close();
                    return;
                }

                const client = Client.forTestnet()
                    .setOperator(AccountId.fromString(operatorId), operatorPrivKey);

                // Get all registered drones
                const drones = await db.drones.findMany();
                
                if (drones.length === 0) {
                    sendMessage({
                        type: 'error',
                        error: "No drones registered yet. Register a drone first."
                    });
                    controller.close();
                    return;
                }

                // Send initial status
                sendMessage({
                    type: 'start',
                    totalDrones: drones.length,
                    operatorAccount: operatorId
                });

                let successCount = 0;
                let failCount = 0;
                
                for (let i = 0; i < drones.length; i++) {
                    const drone = drones[i];
                    
                    // Send progress update
                    sendMessage({
                        type: 'progress',
                        current: i + 1,
                        total: drones.length,
                        droneId: drone.cairnDroneId,
                        droneAccount: drone.hederaAccountId,
                        status: 'processing'
                    });

                    try {
                        // Decrypt drone's private key
                        const dronePrivKeyString = decrypt(drone.hederaPrivateKeyEncrypted, encryptionSecret);
                        const dronePrivateKey = PrivateKey.fromStringECDSA(dronePrivKeyString);

                        // Create transfer transaction
                        const transferTx = new TransferTransaction()
                            .addHbarTransfer(drone.hederaAccountId, new Hbar(-2))
                            .addHbarTransfer(operatorId, new Hbar(2))
                            .setTransactionMemo(`Test transfer from ${drone.cairnDroneId}`)
                            .freezeWith(client);

                        // Sign with drone's key
                        const signedTx = await transferTx.sign(dronePrivateKey);

                        // Execute transaction
                        const txResponse = await signedTx.execute(client);
                        const receipt = await txResponse.getReceipt(client);

                        successCount++;

                        // Send success update
                        sendMessage({
                            type: 'success',
                            current: i + 1,
                            total: drones.length,
                            droneId: drone.cairnDroneId,
                            droneAccount: drone.hederaAccountId,
                            status: receipt.status.toString(),
                            transactionId: txResponse.transactionId.toString(),
                            amount: "2 HBAR"
                        });

                    } catch (error: any) {
                        failCount++;

                        // Send failure update
                        sendMessage({
                            type: 'failure',
                            current: i + 1,
                            total: drones.length,
                            droneId: drone.cairnDroneId,
                            droneAccount: drone.hederaAccountId,
                            error: error.message
                        });
                    }
                }

                // Send final summary
                sendMessage({
                    type: 'complete',
                    totalDrones: drones.length,
                    successful: successCount,
                    failed: failCount,
                    totalTransferred: `${successCount * 2} HBAR`
                });

                controller.close();

            } catch (error: any) {
                sendMessage({
                    type: 'error',
                    error: error.message || "Failed to execute test transfers"
                });
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
