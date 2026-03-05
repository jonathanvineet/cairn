import {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
    AccountId,
    AccountBalanceQuery,
    TransferTransaction,
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

        // ─────────────────────────────────────────
        // ACTION 1: Create Drone Account (Steps 1-3: Keypair + Account + Initial 20 HBAR funding)
        // ─────────────────────────────────────────
        if (body.action === "createDroneAccount") {
            const {
                cairnDroneId,
                serialNumber,
                registrationLat,
                registrationLng,
            } = body;

            if (!cairnDroneId || !serialNumber) {
                return Response.json({
                    success: false,
                    error: "Missing cairnDroneId or serialNumber"
                }, { status: 400 });
            }

            // Check if drone name already exists
            const existingDrone = await db.drones.findByCairnId(cairnDroneId);
            if (existingDrone) {
                return Response.json({
                    success: false,
                    error: `Drone with name "${cairnDroneId}" already exists. Please choose a different name.`
                }, { status: 400 });
            }

            // Setup Hedera client
            const operatorId = process.env.HEDERA_OPERATOR_ID;
            const operatorKey = process.env.HEDERA_OPERATOR_PRIVATE_KEY;
            
            if (!operatorId || !operatorKey) {
                return Response.json({
                    success: false,
                    error: "Operator credentials not configured"
                }, { status: 500 });
            }

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
                    error: `Could not parse private key: ${e.message}`
                }, { status: 500 });
            }

            const client = Client.forTestnet()
                .setOperator(AccountId.fromString(operatorId), operatorPrivKey);

            // Check operator balance before proceeding
            try {
                const operatorBalance = await new AccountBalanceQuery()
                    .setAccountId(AccountId.fromString(operatorId))
                    .execute(client);
                
                const hbarBalance = operatorBalance.hbars.toBigNumber().toNumber();
                console.log(`💰 Operator balance: ${hbarBalance} HBAR`);
                
                if (hbarBalance < 21) {
                    client.close();
                    return Response.json({
                        success: false,
                        error: `Insufficient operator balance. Current: ${hbarBalance} HBAR, Required: 21 HBAR. Please fund operator account ${operatorId}`
                    }, { status: 400 });
                }
            } catch (balanceErr: any) {
                console.error("Balance check failed:", balanceErr);
            }

            // STEP 1: Generate drone's keypair
            const dronePrivateKey = PrivateKey.generateECDSA();
            const dronePublicKey = dronePrivateKey.publicKey;

            // STEP 2: Create Hedera account with 20 HBAR
            const accountCreateTx = new AccountCreateTransaction()
                .setECDSAKeyWithAlias(dronePublicKey)
                .setInitialBalance(new Hbar(20))
                .setAccountMemo(`CAIRN-DRONE-${serialNumber}`);

            const txResponse = await accountCreateTx.execute(client);
            const receipt = await txResponse.getReceipt(client);
            const droneAccountId = receipt.accountId!.toString();
            const droneEvmAddress = `0x${dronePublicKey.toEvmAddress()}`;

            // STEP 3: Encrypt and return keys (do NOT save to DB yet - only after contract registration)
            const encryptionSecret = process.env.ENCRYPTION_SECRET || "";
            const encryptedPrivateKey = encrypt(dronePrivateKey.toString(), encryptionSecret);
            const encryptedPublicKey = encrypt(dronePublicKey.toString(), encryptionSecret);

            client.close();

            return Response.json({
                success: true,
                droneAccountId,
                evmAddress: droneEvmAddress,
                cairnDroneId,
                encryptedPrivateKey,
                encryptedPublicKey,
                message: "Drone account created with 20 HBAR. Ready for contract registration."
            });
        }

        // ─────────────────────────────────────────
        // ACTION 2: Complete Registration (Steps 4-8: CREATE in DB, NFT, HCS, Return 2 HBAR)
        // ─────────────────────────────────────────
        if (body.action === "completeRegistration") {
            const {
                droneAccountId,
                cairnDroneId,
                evmAddress,
                encryptedPrivateKey,
                encryptedPublicKey,
                serialNumber,
                model,
                dgcaCertNumber,
                certExpiryDate,
                assignedZoneId,
                sensorType,
                maxFlightMinutes,
                registeredByOfficerId,
                userWalletAddress,
                registrationLat,
                registrationLng,
                contractTransactionId,
            } = body;

            // Verify contract registration was successful
            if (!contractTransactionId || contractTransactionId === "0.0.contract-tx-placeholder") {
                return Response.json({
                    success: false,
                    error: "Contract registration transaction ID is required"
                }, { status: 400 });
            }

            // Setup operator client
            const operatorId = process.env.HEDERA_OPERATOR_ID;
            const operatorKey = process.env.HEDERA_OPERATOR_PRIVATE_KEY;
            const encryptionSecret = process.env.ENCRYPTION_SECRET;

            if (!operatorId || !operatorKey || !encryptionSecret) {
                return Response.json({
                    success: false,
                    error: "Server configuration missing"
                }, { status: 500 });
            }

            let operatorPrivKey: PrivateKey;
            try {
                let keyString = operatorKey.startsWith("0x") ? operatorKey.slice(2) : operatorKey;
                if (keyString.startsWith("302e") || keyString.startsWith("3030")) {
                    operatorPrivKey = PrivateKey.fromStringED25519(keyString);
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
                    error: `Could not parse private key: ${e.message}`
                }, { status: 500 });
            }

            const client = Client.forTestnet()
                .setOperator(AccountId.fromString(operatorId), operatorPrivKey);

            // STEP 4: CREATE drone in database (only now after contract success)
            const { decrypt } = await import("@/lib/encryption");
            const dronePublicKey = decrypt(encryptedPublicKey, encryptionSecret);
            
            const drone = await db.drones.create({
                cairnDroneId,
                hederaAccountId: droneAccountId,
                hederaPublicKey: dronePublicKey,
                hederaPrivateKeyEncrypted: encryptedPrivateKey,
                evmAddress,
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

            // STEP 5: Mint DroneCredential NFT
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

            // STEP 6: Register drone as Hedera AI Agent (HCS)
            let agentTopicId: string | null = null;
            let agentManifestSequence: number | null = null;
            try {
                const dronePrivateKeyString = decrypt(encryptedPrivateKey, encryptionSecret);
                const dronePrivateKey = PrivateKey.fromStringECDSA(dronePrivateKeyString);

                const agentResult = await registerDroneAsAgent(
                    {
                        cairnDroneId,
                        hederaAccountId: droneAccountId,
                        evmAddress,
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

                await db.drones.update(drone.id, {
                    agentTopicId,
                    agentManifestSequence,
                });
            } catch (agentErr: any) {
                console.error("⚠️  Agent registration failed (non-fatal):", agentErr.message);
            }

            // STEP 7: Return 2 HBAR to user using Hedera Agent Kit
            let testReturnTxId: string | null = null;
            try {
                console.log("💸 STEP 7: Returning 2 HBAR to user using Hedera Agent Kit...");
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const hashgraphSdk = await import("@hashgraph/sdk");
                const { HederaLangchainToolkit, AgentMode } = await import("hedera-agent-kit");
                
                const dronePrivateKeyString = decrypt(encryptedPrivateKey, encryptionSecret);
                
                const droneClient = hashgraphSdk.Client.forTestnet().setOperator(
                    hashgraphSdk.AccountId.fromString(droneAccountId),
                    hashgraphSdk.PrivateKey.fromStringECDSA(dronePrivateKeyString)
                );
                
                const toolkit = new HederaLangchainToolkit({
                    client: droneClient,
                    configuration: {
                        tools: [],
                        plugins: [],
                        context: { mode: AgentMode.AUTONOMOUS },
                    },
                });
                
                const tools = toolkit.getTools();
                const transferTool = tools.find((t: any) => t.name === 'transfer_hbar_tool');
                
                if (!transferTool) {
                    throw new Error(`transfer_hbar_tool not found`);
                }
                
                let recipientAddress = operatorId;
                if (userWalletAddress && userWalletAddress.startsWith('0.0.')) {
                    recipientAddress = userWalletAddress;
                    console.log(`✅ Returning 2 HBAR to user's HashPack account: ${recipientAddress}`);
                }
                
                const result = await transferTool.invoke({
                    transfers: [
                        {
                            accountId: recipientAddress,
                            amount: 2,
                        }
                    ]
                });
                
                if (result) {
                    if (typeof result === 'object' && result.raw && result.raw.transactionId) {
                        testReturnTxId = result.raw.transactionId;
                    } else if (typeof result === 'string') {
                        const txMatch = result.match(/TX:\s*([^\s)]+)/i) || result.match(/transaction[:\s]+([0-9.@]+)/i);
                        if (txMatch) {
                            testReturnTxId = txMatch[1];
                        }
                    }
                }
                
                droneClient.close();
                console.log(`✅ 2 HBAR returned to user (TX: ${testReturnTxId || 'completed'})`);
            } catch (returnError: any) {
                console.error("⚠️  Return transfer failed (non-fatal):", returnError.message);
            }

            client.close();

            return Response.json({
                success: true,
                drone: {
                    cairnDroneId,
                    hederaAccountId: droneAccountId,
                    evmAddress,
                    serialNumber,
                    model,
                    assignedZoneId,
                    status: "ACTIVE",
                    initialBalance: "20 HBAR",
                    currentBalance: testReturnTxId ? "18 HBAR (2 HBAR returned)" : "20 HBAR",
                    nftSerialNumber: nftResult.serialNumber,
                    agentTopicId,
                    agentManifestSequence,
                    isAgent: agentTopicId !== null,
                    testReturnTransactionId: testReturnTxId,
                    contractTransactionId,
                    message: `Drone ${cairnDroneId} registered successfully!${testReturnTxId ? ` 2 HBAR returned (TX: ${testReturnTxId})` : ""}`
                }
            });
        }

        // Old single-step registration (fallback) - keeping for backward compatibility
        const {
            cairnDroneId,
            serialNumber,
            model,
            dgcaCertNumber,
            certExpiryDate,
            assignedZoneId,
            sensorType,
            maxFlightMinutes,
            registeredByOfficerId,
            userWalletAddress,
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

        const client = Client.forTestnet()
            .setOperator(AccountId.fromString(operatorId), operatorPrivKey)
            .setRequestTimeout(30000); // 30 second network timeout

        // Helper: fail fast instead of hanging forever
        const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
            Promise.race([
                promise,
                new Promise<T>((_, reject) =>
                    setTimeout(() => reject(new Error(`Hedera ${label} timed out after ${ms / 1000}s. Check your HEDERA_OPERATOR_ID and network connectivity.`)), ms)
                ),
            ]);

        // ─────────────────────────────────────────
        // STEP 1.5: Check operator account has sufficient balance
        // ─────────────────────────────────────────
        const REQUIRED_HBAR = 20.5; // 20 for drone + 0.5 buffer for tx fees
        
        try {
            const operatorBalance = await withTimeout(
                new AccountBalanceQuery()
                    .setAccountId(operatorId)
                    .execute(client),
                15000,
                "AccountBalanceQuery"
            );
            
            const currentHbar = operatorBalance.hbars.toBigNumber().toNumber();
            
            if (currentHbar < REQUIRED_HBAR) {
                return Response.json({
                    success: false,
                    error: `Insufficient HBAR balance. Your operator account (${operatorId}) has ${currentHbar.toFixed(2)} HBAR but needs at least ${REQUIRED_HBAR} HBAR to register a drone (20 HBAR + fees). Get free testnet HBAR at https://portal.hedera.com`
                }, { status: 402 }); // 402 Payment Required
            }
            
            console.log(`✓ Operator balance: ${currentHbar.toFixed(2)} HBAR (sufficient)`);
        } catch (balanceError: any) {
            console.error("Balance check failed:", balanceError);
            // Non-fatal: proceed anyway (balance check might fail due to network issues)
        }

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

        const txResponse = await withTimeout(
            accountCreateTx.execute(client),
            30000,
            "AccountCreateTransaction"
        );
        const receipt = await withTimeout(
            txResponse.getReceipt(client),
            30000,
            "getReceipt"
        );
        const droneAccountId = receipt.accountId!.toString();
        const droneEvmAddress = `0x${dronePublicKey.toEvmAddress()}`;
        const accountCreationTxId = txResponse.transactionId.toString();

        // ─────────────────────────────────────────
        // STEP 3.5: TESTING - Transfer 2 HBAR back to operator using Hedera Agent Kit
        // ─────────────────────────────────────────
        let testReturnTxId: string | null = null;
        try {
            console.log("💸 TEST MODE: Transferring 2 HBAR back to operator using Hedera Agent Kit...");
            
            // Wait 2 seconds for account creation to settle
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Import @hashgraph/sdk (required by hedera-agent-kit)
            const hashgraphSdk = await import("@hashgraph/sdk");
            const { HederaLangchainToolkit, AgentMode } = await import("hedera-agent-kit");
            
            // Create Hedera client with @hashgraph/sdk using the drone's credentials
            const droneClient = hashgraphSdk.Client.forTestnet().setOperator(
                hashgraphSdk.AccountId.fromString(droneAccountId),
                hashgraphSdk.PrivateKey.fromStringECDSA(dronePrivateKey.toStringRaw())
            );
            
            console.log("🔧 Initializing Hedera Agent Kit toolkit...");
            
            // Initialize toolkit exactly as documented
            const toolkit = new HederaLangchainToolkit({
                client: droneClient,
                configuration: {
                    tools: [],
                    plugins: [],
                    context: { mode: AgentMode.AUTONOMOUS },
                },
            });
            
            // Get all tools from the toolkit
            const tools = toolkit.getTools();
            console.log(`📦 Available tools: ${tools.map((t: any) => t.name).join(', ')}`);
            
            // Find the TRANSFER_HBAR_TOOL (lowercase in actual implementation)
            const transferTool = tools.find((t: any) => t.name === 'transfer_hbar_tool');
            
            if (!transferTool) {
                throw new Error(`transfer_hbar_tool not found. Available: ${tools.map((t: any) => t.name).join(', ')}`);
            }
            
            // Determine recipient: 
            // If userWalletAddress is a Hedera account ID (0.0.xxxxx), use it
            // If it's an EVM address (0x...), convert to Hedera account alias format: 0.0.<evmAddress>
            let recipientAddress = operatorId;
            let recipientLabel = "operator";
            
            if (userWalletAddress && userWalletAddress.startsWith('0.0.')) {
                recipientAddress = userWalletAddress;
                recipientLabel = "user's Hedera account";
            } else if (userWalletAddress && userWalletAddress.startsWith('0x')) {
                // For EVM addresses, we need to ensure the account exists first
                // Otherwise transfer to EVM alias won't work if account doesn't exist
                console.log(`⚠️  User has EVM address ${userWalletAddress} - account may not exist on Hedera yet`);
                console.log(`💡 Returning to operator instead. User can claim by importing their EVM key into HashPack.`);
                recipientLabel = "operator (user needs Hedera account)";
                // Keep recipientAddress as operatorId
            }
            
            console.log(`🚀 Invoking transfer_hbar_tool: 2 HBAR from ${droneAccountId} to ${recipientAddress} (${recipientLabel})`);
            
            // Call invoke with the correct schema: transfers array
            const result = await transferTool.invoke({
                transfers: [
                    {
                        accountId: recipientAddress,
                        amount: 2,
                    }
                ]
            });
            
            console.log("✅ Transfer result:", result);
            
            // Parse the result to extract transaction ID
            if (result) {
                if (typeof result === 'object' && result.raw && result.raw.transactionId) {
                    testReturnTxId = result.raw.transactionId;
                } else if (typeof result === 'string') {
                    const txMatch = result.match(/TX:\s*([^\s)]+)/i) || result.match(/transaction[:\s]+([0-9.@]+)/i);
                    if (txMatch) {
                        testReturnTxId = txMatch[1];
                    }
                }
            }
            
            droneClient.close();
            console.log(`✅ TEST: 2 HBAR returned to operator via Agent Kit (TX: ${testReturnTxId || 'completed'})`);
        } catch (returnError: any) {
            console.error("⚠️  TEST return transfer failed (non-fatal):", returnError.message);
            console.error("Stack:", returnError.stack);
            // Non-fatal: continue with registration even if test return fails
        }

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
                currentBalance: testReturnTxId ? "18 HBAR (2 HBAR returned for testing)" : "20 HBAR",
                nftSerialNumber: nftResult.serialNumber,
                // PROOF: Transaction ID for the 20 HBAR transfer
                fundingTransactionId: accountCreationTxId,
                // TEST: Transaction ID for the 2 HBAR return
                testReturnTransactionId: testReturnTxId,
                // AI Agent fields
                agentTopicId,
                agentManifestSequence,
                isAgent: agentTopicId !== null,
                message: `Drone ${cairnDroneId} registered as Hedera AI Agent${agentTopicId ? ` (topic: ${agentTopicId})` : ""}. 20 HBAR transferred (TX: ${accountCreationTxId})${testReturnTxId ? `. 2 HBAR returned for testing (TX: ${testReturnTxId})` : ""}`
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
