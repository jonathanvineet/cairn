const MIRROR_NODE_URL = "https://testnet.mirrornode.hedera.com/api/v1";

async function queryHCSTopicMessages(topicId: string) {
  try {
    console.log(`\n🔍 Querying HCS topic for messages: ${topicId}\n`);

    const response = await fetch(
      `${MIRROR_NODE_URL}/topics/${topicId}/messages?limit=100&order=desc`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    const messages = data.messages || [];

    if (messages.length === 0) {
      console.log("No messages found in topic");
      return [];
    }

    console.log(`📊 Found ${messages.length} message(s) in topic:\n`);

    const missionHistory: any[] = [];

    for (const msg of messages) {
      try {
        // Decode the message from base64
        const decodedMessage = Buffer.from(msg.message, "base64").toString(
          "utf-8"
        );
        const messageObj = JSON.parse(decodedMessage);

        const sequenceNumber = msg.sequence_number;
        const timestamp = new Date(msg.consensus_timestamp * 1000).toISOString();

        console.log(`📸 Message #${sequenceNumber}`);
        console.log(`   Timestamp: ${timestamp}`);
        console.log(`   Type: ${messageObj["@type"] || "unknown"}`);
        console.log(`   Drone: ${messageObj.droneId || "unknown"}`);
        console.log(`   Zone: ${messageObj.zoneId || "unknown"}`);
        console.log(`   Hash: ${messageObj.evidenceHash?.substring(0, 16)}...`);
        console.log("");

        missionHistory.push({
          sequence: sequenceNumber,
          timestamp: timestamp,
          drone: messageObj.droneId,
          zone: messageObj.zoneId,
          hash: messageObj.evidenceHash,
          status: messageObj.status,
        });
      } catch (parseErr) {
        console.warn(`⚠️  Could not parse message #${msg.sequence_number}`);
      }
    }

    return missionHistory;
  } catch (error: any) {
    console.error(`❌ Error querying topic:`, error.message);
    return [];
  }
}

// Test with known topic IDs
const topicToQuery = process.argv[2] || "0.0.8310496"; // sfgsfg's topic
queryHCSTopicMessages(topicToQuery);
