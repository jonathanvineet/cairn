import {
    Client,
    PrivateKey,
    TransferTransaction,
    Hbar,
    AccountId,
    AccountBalanceQuery,
} from "@hiero-ledger/sdk";
import { db } from "@/lib/db";

/**
 * POST /api/drones/fund
 * Fund existing drones with HBAR (for drones that already have Hedera accounts)
 * 
 * Body: { droneId: string, amount: number } or { fundAll: true, amount: number }
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { droneId, amount = 20, fundAll = false } = body;

        if (!droneId && !fundAll) {
            return Response.json({
                success: false,
                error: "Provide either 'droneId' or set 'fundAll: true'"
            }, { status: 400 });
        }

        if (amount <= 0) {
            return Response.json({
                success: false,
                error: "Amount must be greater than 0"
            }, { status: 400 });
        }

        const operatorId = process.env.HEDERA_OPERATOR_ID;
        const operatorKey = process.env.HEDERA_OPERATOR_PRIVATE_KEY;

        if (!operatorId || !operatorKey) {
            return Response.json({
                success: false,
                error: "Missing HEDERA_OPERATOR_ID or HEDERA_OPERATOR_PRIVATE_KEY"
            }, { status: 500 });
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
            return Response.json({
                success: false,
                error: `Could not parse HEDERA_OPERATOR_PRIVATE_KEY: ${e.message}`
            }, { status: 500 });
        }

        const client = Client.forTestnet()
            .setOperator(AccountId.fromString(operatorId), operatorPrivKey);

        // Check operator balance
        const operatorBalance = await new AccountBalanceQuery()
            .setAccountId(operatorId)
            .execute(client);
        
        const currentHbar = operatorBalance.hbars.toBigNumber().toNumber();
        
        let dronesToFund: any[] = [];
        
        if (fundAll) {
            dronesToFund = await db.drones.findMany();
            dronesToFund = dronesToFund.filter(d => d.hederaAccountId); // Only fund drones with accounts
        } else {
            const drone = await db.drones.findByCairnId(droneId);
            if (!drone) {
                return Response.json({
                    success: false,
                    error: `Drone ${droneId} not found`
                }, { status: 404 });
            }
            if (!drone.hederaAccountId) {
                return Response.json({
                    success: false,
                    error: `Drone ${droneId} does not have a Hedera account`
                }, { status: 400 });
            }
            dronesToFund = [drone];
        }

        const totalRequired = dronesToFund.length * amount + 1; // +1 for fees
        
        if (currentHbar < totalRequired) {
            return Response.json({
                success: false,
                error: `Insufficient balance. Need ${totalRequired} HBAR, have ${currentHbar.toFixed(2)} HBAR`
            }, { status: 402 });
        }

        const results = [];

        for (const drone of dronesToFund) {
            try {
                // Create transfer transaction
                const transferTx = await new TransferTransaction()
                    .addHbarTransfer(operatorId, new Hbar(-amount))
                    .addHbarTransfer(drone.hederaAccountId, new Hbar(amount))
                    .setTransactionMemo(`Funding ${drone.cairnDroneId} with ${amount} HBAR`)
                    .execute(client);

                const receipt = await transferTx.getReceipt(client);

                results.push({
                    droneId: drone.cairnDroneId,
                    droneAccount: drone.hederaAccountId,
                    amount: `${amount} HBAR`,
                    status: receipt.status.toString(),
                    transactionId: transferTx.transactionId.toString(),
                    success: true,
                });

            } catch (error: any) {
                results.push({
                    droneId: drone.cairnDroneId,
                    droneAccount: drone.hederaAccountId,
                    amount: `${amount} HBAR`,
                    status: "FAILED",
                    error: error.message,
                    success: false,
                });
            }
        }

        client.close();

        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        return Response.json({
            success: true,
            summary: {
                totalDrones: dronesToFund.length,
                successful: successCount,
                failed: failCount,
                amountPerDrone: `${amount} HBAR`,
                totalTransferred: `${successCount * amount} HBAR`,
            },
            results,
        });

    } catch (error: any) {
        console.error("[/api/drones/fund] Error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to fund drones"
        }, { status: 500 });
    }
}
