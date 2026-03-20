const MIRROR_NODE_URL = "https://testnet.mirrornode.hedera.com/api/v1";

async function findRecentTopics() {
  try {
    console.log(`\n🔍 Searching for recently created HCS topics...\n`);

    // Query for topics (ordered by creation, most recent first)
    const response = await fetch(
      `${MIRROR_NODE_URL}/topics?limit=20&order=desc`
    );
    const data = await response.json();

    const topics = data.topics || [];

    if (topics.length === 0) {
      console.log("No topics found");
      return;
    }

    console.log(`Found ${topics.length} topics:\n`);

    topics.forEach((topic: any, index: number) => {
      const createdTime = new Date(topic.created_timestamp * 1000).toISOString();
      console.log(`${index + 1}. Topic ID: ${topic.topic_id}`);
      console.log(`   Created: ${createdTime}`);
      console.log(`   Messages: ${topic.message_count}`);
      console.log("");
    });

    console.log("\n💡 Topics around 2026-03-20T21:54-21:56 should be your drones");
    console.log("   sfgsfg: 2026-03-20T21:54:31.000Z");
    console.log("   fdhsrhrth: 2026-03-20T21:55:41.000Z\n");

    // Return the top 2 for updating
    if (topics.length >= 2) {
      return {
        topic1: topics[0].topic_id, // Most recent (fdhsrhrth)
        topic2: topics[1].topic_id, // Second most recent (sfgsfg)
      };
    }
  } catch (error: any) {
    console.error("Error querying mirror node:", error.message);
  }
}

findRecentTopics();
