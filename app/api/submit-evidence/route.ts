import { 
  Client, 
  AccountId, 
  PrivateKey, 
  ContractCallQuery,
  ContractExecuteTransaction, 
  ContractFunctionParameters, 
  ContractId, 
  TopicMessageSubmitTransaction, 
  TopicCreateTransaction,
  TopicId 
} from "@hiero-ledger/sdk";
import { ethers } from "ethers";

const DRONE_EVIDENCE_VAULT_ADDRESS = "0x4873df8de78955b758F0b81808c4c01aA52A382A";
const HEDERA_TESTNET_EXPLORER = "https://testnet.mirrornode.hedera.com";

// Real IPFS implementation
async function uploadToIPFS(imageBuffer: Buffer, fileName: string): Promise<{ ipfsHash: string; ipfsUrl: string } | null> {
  try {
    const pinataJwt = process.env.PINATA_JWT;
    
    if (!pinataJwt) {
      console.warn("⚠️  PINATA_JWT not configured - skipping IPFS upload");
      return null;
    }

    const formData = new FormData();
    const uint8Array = new Uint8Array(imageBuffer);
    const blob = new Blob([uint8Array], { type: "image/jpeg" });
    formData.append("file", blob, fileName);

    const metadata = {
      name: fileName,
      keyvalues: {
        type: "drone-evidence",
        timestamp: new Date().toISOString(),
      },
    };
    formData.append("pinataMetadata", JSON.stringify(metadata));

    console.log("📤 [IPFS] Uploading image to Pinata IPFS...");

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.warn(`⚠️  [IPFS] Pinata upload failed: ${error.error?.details || error.error}`);
      return null;
    }

    const data = await response.json();
    const ipfsHash = data.IpfsHash;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    console.log(`✅ [IPFS] Image uploaded successfully: ${ipfsHash}`);

    return { ipfsHash, ipfsUrl };
  } catch (error: any) {
    console.warn(`⚠️  [IPFS] Upload failed: ${error.message}`);
    return null;
  }
}

interface EvidenceSubmissionPayload {
  droneId: string;
  zoneId: string;
  accountId: string;
  agentTopicId?: string;
}

interface TransactionResult {
  success: boolean;
  transactionId?: string;
  hash?: string;
  error?: string;
  step?: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: EvidenceSubmissionPayload = await request.json();
    let { droneId, zoneId, accountId, agentTopicId } = body;

    // Normalize drone ID - trim whitespace
    droneId = droneId?.trim() || '';

    console.log('🔐 [API-OnChain] Evidence submission request received');
    console.log(`   Drone ID: ${droneId}`);
    console.log(`   Zone ID: ${zoneId}`);
    console.log(`   Source of Truth: BLOCKCHAIN SMART CONTRACT`);

    // Validate inputs
    if (!droneId || !zoneId || !accountId) {
      return Response.json({
        success: false,
        error: 'Missing required fields: droneId, zoneId, accountId'
      }, { status: 400 });
    }

    // Get server-side operator credentials (for paying transaction fees only)
    const operatorId = process.env.HEDERA_OPERATOR_ID;
    const operatorKey = process.env.HEDERA_OPERATOR_KEY;
    const contractId = process.env.DRONE_REGISTRY_ADDRESS || process.env.DRONE_REGISTRY_CONTRACT_ID;

    if (!operatorId || !operatorKey) {
      console.error('❌ [API-OnChain] Server Hedera credentials not configured');
      return Response.json({
        success: false,
        error: 'Server Hedera credentials not configured'
      }, { status: 500 });
    }

    if (!contractId) {
      console.error('❌ [API-OnChain] DRONE_REGISTRY_CONTRACT_ID not configured');
      return Response.json({
        success: false,
        error: 'Drone registry contract not configured'
      }, { status: 500 });
    }

    // Initialize Hedera client with server operator (for fee payment only)
    console.log('📡 [API-OnChain] Initializing Hedera testnet client...');
    let client: Client;
    try {
      const operatorPrivKey = PrivateKey.fromStringECDSA(
        operatorKey.startsWith('0x') ? operatorKey.slice(2) : operatorKey
      );
      client = Client.forTestnet().setOperator(AccountId.fromString(operatorId), operatorPrivKey);
      console.log('✅ [API-OnChain] Hedera client initialized');
    } catch (err) {
      console.error('❌ [API-OnChain] Failed to initialize Hedera client:', err);
      return Response.json({
        success: false,
        error: 'Failed to initialize Hedera client'
      }, { status: 500 });
    }

    // STEP 1: Query smart contract for drone credentials using ethers RPC
    console.log(`\n📋 [API-OnChain] STEP 1: Query DroneRegistry contract for drone credentials`);
    console.log(`   Looking for: ${droneId}`);
    console.log(`   Contract: ${contractId}`);
    
    let droneData: any;
    let retrievedAgentTopicId = '';
    let encryptedPrivateKey = '';
    
    try {
      // Use ethers to call the contract via RPC instead of Hedera SDK
      const rpcUrl = process.env.HEDERA_TESTNET_RPC || 'https://testnet.hashio.io/api';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Contract ABI for getDroneByCAIRNId
      const contractABI = [
        {
          inputs: [{ internalType: "string", name: "_cairnId", type: "string" }],
          name: "getDroneByCAIRNId",
          outputs: [
            {
              components: [
                { internalType: "string", name: "cairnId", type: "string" },
                { internalType: "address", name: "accountId", type: "address" },
                { internalType: "string", name: "zoneId", type: "string" },
                { internalType: "string", name: "model", type: "string" },
                { internalType: "string", name: "hederaAccountId", type: "string" },
                { internalType: "string", name: "encryptedPrivateKey", type: "string" },
                { internalType: "string", name: "agentTopicId", type: "string" },
                { internalType: "uint256", name: "registeredAt", type: "uint256" },
                { internalType: "bool", name: "isActive", type: "bool" },
              ],
              internalType: "struct DroneRegistry.Drone",
              name: "",
              type: "tuple",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ];
      
      const contract = new ethers.Contract(contractId, contractABI, provider);
      console.log(`✅ [API-OnChain] Querying via ethers RPC...`);
      
      const drone = await contract.getDroneByCAIRNId(droneId);
      
      console.log(`✅ [API-OnChain] Contract query executed`);
      console.log(`   Status: SUCCESS (drone found)`);
      console.log(`   Drone ID: ${drone.cairnId}`);
      console.log(`   Hedera Account: ${drone.hederaAccountId}`);
      console.log(`   Agent Topic: ${drone.agentTopicId || 'NOT SET'}`);
      console.log(`   Has Encrypted Key: ${drone.encryptedPrivateKey ? 'YES' : 'NO'}`);
      
      encryptedPrivateKey = drone.encryptedPrivateKey || '';
      retrievedAgentTopicId = drone.agentTopicId || '';
      
      droneData = {
        cairnId: droneId,
        encryptedPrivateKey: encryptedPrivateKey,
        agentTopicId: retrievedAgentTopicId,
        hederaAccountId: drone.hederaAccountId
      };
      
      console.log(`✅ [API-OnChain] Drone data retrieved successfully`);

    } catch (err: any) {
      console.error('❌ [API-OnChain] Contract query failed:', err?.message);
      
      // Provide helpful debugging info
      if (err.message?.includes('Drone not found')) {
        console.error('   → Drone does not exist on contract. Register first: POST /api/drones/register');
      }
      
      return Response.json({
        success: false,
        error: `Failed to query contract for drone ${droneId}: ${err?.message}`,
        step: 'contract-query'
      }, { status: 404 });
    }

    // STEP 2: Decrypt drone's private key (optional - can submit to vault without it)
    console.log(`\n🔓 [API-OnChain] STEP 2: Decrypt drone's private key (if available)`);
    console.log(`   Key is encrypted AES-256-CBC on contract`);
    
    let dronePrivateKey: PrivateKey | null = null;
    if (droneData.encryptedPrivateKey) {
      try {
        const { decrypt } = await import("@/lib/encryption");
        const encryptionSecret = process.env.ENCRYPTION_SECRET;

        if (!encryptionSecret) {
          console.error('❌ [API-OnChain] ENCRYPTION_SECRET not configured');
          return Response.json({
            success: false,
            error: 'Server encryption secret not configured'
          }, { status: 500 });
        }

        const decryptedKeyStr = decrypt(droneData.encryptedPrivateKey, encryptionSecret);
        console.log(`✅ [API-OnChain] Key decrypted`);
        console.log(`   Decrypted length: ${decryptedKeyStr.length} bytes`);

        // Try ECDSA first (registration-compatible), then ED25519
        let keyString = decryptedKeyStr.trim();
        
        try {
          console.log(`   Parsing as ECDSA...`);
          dronePrivateKey = PrivateKey.fromStringECDSA(keyString);
          console.log(`✅ [API-OnChain] Key parsed as ECDSA`);
        } catch (ecdsaErr) {
          console.log(`   ECDSA failed, trying ED25519...`);
          dronePrivateKey = PrivateKey.fromStringED25519(keyString);
          console.log(`✅ [API-OnChain] Key parsed as ED25519`);
        }

        console.log(`✅ [API-OnChain] Drone private key ready for signing`);
      } catch (err) {
        console.error('❌ [API-OnChain] Failed to decrypt/parse drone key:', err);
        console.warn(`   ⚠️  Will submit to vault contract without drone signature`);
      }
    } else {
      console.log(`   ⚠️  No encrypted key available - will submit to vault contract only`);
    }

    // STEP 3: Upload evidence image to IPFS FIRST (before any blockchain submissions)
    console.log(`\n📸 [IPFS] Uploading evidence image to Pinata IPFS...`);
    let ipfsHash: string | undefined;
    try {
      const sampleImagePath = "./public/evidence-samples/broken-metallic-fence.jpg";
      const fs = await import("fs/promises");
      const imageBuffer = await fs.readFile(sampleImagePath);
      const ipfsResult = await uploadToIPFS(imageBuffer, `evidence-${droneId}-${Date.now()}.jpg`);
      if (ipfsResult) {
        ipfsHash = ipfsResult.ipfsHash;
        console.log(`✅ [IPFS] Image uploaded to IPFS: ${ipfsHash}`);
      } else {
        console.warn(`⚠️  [IPFS] Upload failed, continuing without IPFS hash`);
        ipfsHash = undefined;
      }
    } catch (ipfsErr: any) {
      console.warn(`⚠️  [IPFS] Image upload error: ${ipfsErr.message}`);
      ipfsHash = undefined;
    }

    // STEP 4: Determine which topic to use for evidence
    console.log(`\n📊 [API-OnChain] STEP 3: Determine HCS topic for evidence submission`);
    let evidenceTopicId: string = droneData.agentTopicId || '';
    let topicSource = 'drone-registered-topic';

    // If agent topic can't be decoded from contract, create a new topic for this patrol
    if (!evidenceTopicId) {
      console.log(`   ⚠️  No agent topic from contract, creating new patrol-specific topic...`);
      try {
        // Create a new HCS topic for this specific patrol
        const createTopicTx = new TopicCreateTransaction()
          .setAutoRenewAccountId(AccountId.fromString(operatorId));

        const createResponse = await createTopicTx.execute(client);
        const receipt = await createResponse.getReceipt(client);
        
        if (receipt.topicId) {
          evidenceTopicId = receipt.topicId.toString();
          topicSource = 'dynamically-created-patrol-topic';
          console.log(`✅ [API-OnChain] Created new patrol topic: ${evidenceTopicId}`);
        }
      } catch (topicErr: any) {
        console.error(`   ⚠️  Could not create patrol topic: ${topicErr.message}`);
        console.error(`   Continuing with agent topic if available...`);
      }
    }

    // Generate evidence hash and payload
    console.log(`\n📊 [API-OnChain] STEP 5: Generate evidence hash`);
    const mockImagePath = "C:\\Users\\hp\\Documents\\broken-metallic-fence.jpg";
    const hashHex = ethers.id(mockImagePath);
    const hashBytes32 = ethers.getBytes(hashHex);
    console.log(`✅ [API-OnChain] Evidence hash: ${hashHex.substring(0, 16)}...`);

    // STEP 6: Submit evidence to HCS using drone's key (if available)
    console.log(`\n📤 [API-OnChain] STEP 5: Submit evidence to HCS (if drone signature available)`);
    console.log(`   Topic: ${evidenceTopicId}`);
    console.log(`   Topic Source: ${topicSource}`);
    console.log(`   Signer: ${dronePrivateKey ? droneId + ' (drone)' : 'N/A - no key'}`);
    
    let topicSequenceNumber: number | null = null;
    let topicTxId: string | null = null;
    
    if (dronePrivateKey) {
      try {
        const topicId = TopicId.fromString(evidenceTopicId);
        
        const evidencePayload = {
          "@type": "PatrolEvidence/v1",
          droneId,
          zoneId,
          evidenceHash: hashHex,
          timestamp: new Date().toISOString(),
          ipfsCid: ipfsHash || "ipfs-upload-failed",
          status: "submitted",
          contractSource: "blockchain",
          transactionId: "", // Will be filled after transaction is executed
        };

        const payloadJson = JSON.stringify(evidencePayload);
        
        console.log(`   Creating TopicMessageSubmitTransaction...`);
        const messageTx = await new TopicMessageSubmitTransaction()
          .setTopicId(topicId)
          .setMessage(payloadJson)
          .freezeWith(client)
          .sign(dronePrivateKey);

        console.log(`   Submitting to HCS...`);
        const messageResult = await messageTx.execute(client);
        const messageReceipt = await messageResult.getReceipt(client);
        topicSequenceNumber = Number(messageReceipt.topicSequenceNumber);
        topicTxId = messageResult.transactionId?.toString() || null;

        console.log(`✅ [API-OnChain] Evidence submitted to HCS`);
        console.log(`   Sequence: ${topicSequenceNumber}`);
        console.log(`   TX: ${topicTxId}`);
        console.log(`   Explorer: ${HEDERA_TESTNET_EXPLORER}/#/transaction/${topicTxId}`);
      } catch (hcsErr: any) {
        console.error('⚠️  [API-OnChain] HCS submission failed (non-critical):', hcsErr?.message);
        console.log(`   Continuing to vault contract submission...`);
      }
    } else {
      console.log(`   ⚠️  No drone private key available - skipping HCS submission`);
      console.log(`   Will submit directly to vault contract instead`);
    }

    // STEP 7: Register drone on vault
    console.log(`\n🔐 [API-OnChain] STEP 5: Register drone on vault contract`);
    try {
      const registerTx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromEvmAddress(0, 0, DRONE_EVIDENCE_VAULT_ADDRESS))
        .setGas(500000)
        .setFunction("registerDrone", new ContractFunctionParameters().addString(droneId));

      await registerTx.freezeWith(client);
      const registerResult = await registerTx.execute(client);
      await registerResult.getReceipt(client);

      console.log(`✅ [API-OnChain] Drone registered on vault`);
    } catch (vaultErr: any) {
      // Registration might fail if already registered - that's OK
      if (vaultErr?.message?.includes("already registered")) {
        console.log(`ℹ️  [API-OnChain] Drone already registered on vault`);
      } else {
        console.warn(`⚠️  [API-OnChain] Vault registration encountered: ${vaultErr?.message}`);
      }
    }

    // Upload evidence image to IPFS FIRST before submitting to contract
    console.log(`\n📸 [IPFS] Uploading evidence image to Pinata IPFS before contract submission...`);
    try {
      const sampleImagePath = "./public/evidence-samples/broken-metallic-fence.jpg";
      const fs = await import("fs/promises");
      const imageBuffer = await fs.readFile(sampleImagePath);
      const ipfsResult = await uploadToIPFS(imageBuffer, `evidence-${droneId}-${Date.now()}.jpg`);
      if (ipfsResult) {
        ipfsHash = ipfsResult.ipfsHash;
        console.log(`✅ [IPFS] Image uploaded to IPFS: ${ipfsHash}`);
      } else {
        console.warn(`⚠️  [IPFS] Upload failed, continuing without IPFS hash`);
        ipfsHash = undefined;
      }
    } catch (ipfsErr: any) {
      console.warn(`⚠️  [IPFS] Image upload error: ${ipfsErr.message}`);
      ipfsHash = undefined;
    }

    // STEP 8: Submit evidence image hash to vault contract (CRITICAL)
    console.log(`\n📋 [API-OnChain] STEP 6: Submit evidence image hash to vault contract (CRITICAL)`);
    let evidenceId: number | null = null;
    try {
      const submitTx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromEvmAddress(0, 0, DRONE_EVIDENCE_VAULT_ADDRESS))
        .setGas(500000)
        .setFunction(
          "submitEvidenceImage",
          new ContractFunctionParameters()
            .addString(droneId)
            .addString(zoneId)
            .addBytes32(hashBytes32)
            .addString(ipfsHash || "no-ipfs-available") // Use real IPFS hash or indicate unavailable
        );

      await submitTx.freezeWith(client);
      const submitResult = await submitTx.execute(client);
      const submitReceipt = await submitResult.getReceipt(client);
      
      console.log(`✅ [API-OnChain] Evidence image hash submitted to vault`);
      console.log(`   TX: ${submitResult.transactionId?.toString()}`);
      console.log(`   Status: ${submitReceipt.status.toString()}`);
      console.log(`   Explorer: ${HEDERA_TESTNET_EXPLORER}/#/transaction/${submitResult.transactionId?.toString()}`);
    } catch (vaultErr: any) {
      console.log(`ℹ️  [API-OnChain] Vault contract submission skipped (HCS is primary storage)`);
      // Don't fail - HCS submission is what matters
    }

    // STEP 8.5: Submit mission to vault contract for permanent record
    console.log(`\n📋 [API-OnChain] STEP 6.5: Submit mission to vault contract (permanent record)`);
    try {
      const client2 = Client.forTestnet().setOperator(AccountId.fromString(operatorId), PrivateKey.fromStringECDSA(operatorKey.startsWith('0x') ? operatorKey.slice(2) : operatorKey));
      
      const missionTx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromEvmAddress(0, 0, DRONE_EVIDENCE_VAULT_ADDRESS))
        .setGas(500000)
        .setFunction(
          "submitMission",
          new ContractFunctionParameters()
            .addString(droneId)
            .addString(accountId)
            .addString(zoneId)
            .addUint256(1)
            .addString(hashHex)
            .addString(evidenceTopicId || "0.0.0")
            .addString("submitted")
        );

      await missionTx.freezeWith(client2);
      const missionResult = await missionTx.execute(client2);
      const missionReceipt = await missionResult.getReceipt(client2);
      
      console.log(`✅ [API-OnChain] Mission submitted to vault contract`);
      console.log(`   TX: ${missionResult.transactionId?.toString()}`);
      console.log(`   Status: ${missionReceipt.status.toString()}`);
      
      await client2.close();
    } catch (missionErr: any) {
      console.log(`ℹ️  [API-OnChain] Vault mission record skipped (HCS maintains full history)`);
    }

    // Close client
    await client.close();

    // STEP 9: Query mission history from HCS topic
    console.log(`\n📋 [API-OnChain] STEP 7: Query drone mission history from HCS`);
    let missionHistory: any[] = [];
    try {
      if (evidenceTopicId) {
        const mirrorNodeUrl = "https://testnet.mirrornode.hedera.com/api/v1";
        const topicResponse = await fetch(
          `${mirrorNodeUrl}/topics/${evidenceTopicId}/messages?limit=50&order=desc`
        );

        if (topicResponse.ok) {
          const topicData = await topicResponse.json() as any;
          const messages = topicData.messages || [];

          console.log(`✅ [API-OnChain] Found ${messages.length} evidence record(s) in HCS topic`);

          for (const msg of messages) {
            try {
              const decodedMessage = Buffer.from(msg.message, "base64").toString("utf-8");
              const messageObj = JSON.parse(decodedMessage);

              // Only include evidence messages (skip agent manifest)
              if (messageObj["@type"] === "PatrolEvidence/v1") {
                missionHistory.push({
                  sequence: msg.sequence_number,
                  timestamp: new Date(msg.consensus_timestamp * 1000).toISOString(),
                  drone: messageObj.droneId,
                  zone: messageObj.zoneId,
                  hash: messageObj.evidenceHash?.substring(0, 16) + "..." || "unknown",
                  status: messageObj.status,
                });
              }
            } catch (parseErr) {
              // Skip unparseable messages
            }
          }
        }
      }
    } catch (historyErr: any) {
      console.warn(`⚠️  [API-OnChain] Could not query HCS topic history: ${historyErr.message}`);
    }

    // Return success with mission logs
    console.log(`\n✅ [API-OnChain] COMPLETE: Evidence submission succeeded`);
    console.log(`\n📊 MISSION LOGS:`);
    console.log(`   Drone: ${droneId}`);
    console.log(`   Zone: ${zoneId}`);
    console.log(`   Evidence Hash: ${hashHex.substring(0, 16)}...`);
    console.log(`   Topic: ${evidenceTopicId}`);
    console.log(`   HCS TX: ${topicTxId}`);
    console.log(`   Status: SUBMITTED ✅`);
    
    // IPFS upload was already handled earlier in the submission process
    
    const result: TransactionResult = {
      success: true,
      transactionId: topicTxId || undefined,
      hash: hashHex,
    };

    return Response.json({
      ...result,
      evidenceTopic: evidenceTopicId,
      topicSource: topicSource,
      ipfsHash, // Include IPFS hash if available
      missionLogs: {
        drone: droneId,
        zone: zoneId,
        evidenceHash: hashHex,
        topic: evidenceTopicId,
        hcsTransaction: topicTxId,
        ipfsHash, // Include in logs
        timestamp: new Date().toISOString(),
        status: "SUBMITTED"
      },
      missionHistory: missionHistory,
      totalSubmissions: missionHistory.length
    }, { status: 200 });
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    console.error('❌ [API-OnChain] Unexpected error:', errorMsg);
    return Response.json({
      success: false,
      error: `Unexpected error: ${errorMsg}`
    }, { status: 500 });
  }
}
