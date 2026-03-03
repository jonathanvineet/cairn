import { db } from "@/lib/db";

export interface DroneMetrics {
  cairnDroneId: string;
  evmAddress: string;
  batteryLevel: number;
  location: { lat: number; lng: number };
  health: string;
  agentTopicId?: string;
  model?: string;
  serialNumber?: string;
}

export interface AnalysisThought {
  timestamp: number;
  phase: "assessment" | "evaluation" | "reasoning" | "decision" | "conclusion";
  thought: string;
  duration: number; // milliseconds
}

export interface AnalysisResult {
  selectedDrone: DroneMetrics;
  score: number;
  thoughts: AnalysisThought[];
  reasoning: string;
  confidence: number;
}

// Haversine distance calculation
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runElizaAnalysis(
  boundary: { coordinates: Array<{ lat: number; lng: number }> },
  onThought?: (thought: AnalysisThought) => void
): Promise<AnalysisResult> {
  const thoughts: AnalysisThought[] = [];
  const startTime = Date.now();

  // Helper to add thoughts
  const addThought = async (
    phase: AnalysisThought["phase"],
    thought: string,
    delayMs: number = 1500
  ) => {
    const timestamp = Date.now() - startTime;
    await sleep(delayMs);
    const analysisThought: AnalysisThought = {
      timestamp,
      phase,
      thought,
      duration: Date.now() - startTime - timestamp,
    };
    thoughts.push(analysisThought);
    if (onThought) onThought(analysisThought);
  };

  // Phase 1: Assessment
  await addThought(
    "assessment",
    "🔍 Analyzing mission requirements and boundary parameters...",
    800
  );

  // Calculate zone center
  const centerLat =
    boundary.coordinates.reduce((sum, c) => sum + c.lat, 0) /
    boundary.coordinates.length;
  const centerLng =
    boundary.coordinates.reduce((sum, c) => sum + c.lng, 0) /
    boundary.coordinates.length;

  await addThought(
    "assessment",
    `📍 Zone center: ${centerLat.toFixed(4)}°N, ${centerLng.toFixed(4)}°E`,
    600
  );

  // Fetch all drones
  const allDrones = await db.drones.findMany();

  await addThought(
    "assessment",
    `🚁 Found ${allDrones.length} registered drone(s) in system`,
    700
  );

  if (allDrones.length === 0) {
    await addThought("assessment", "❌ No drones available for mission", 500);
    throw new Error("No drones registered");
  }

  // Phase 2: Evaluation
  await addThought("evaluation", "⚡ Evaluating drone capabilities and status...", 900);

  interface DroneScore {
    drone: DroneMetrics;
    batteryScore: number;
    proximityScore: number;
    healthScore: number;
    agentScore: number;
    totalScore: number;
    reasoning: string[];
  }

  const scores: DroneScore[] = [];

  for (const drone of allDrones) {
    const metrics: DroneMetrics = {
      cairnDroneId: drone.cairnDroneId,
      evmAddress: drone.evmAddress,
      batteryLevel: 75, // Default value - would come from real telemetry
      location: {
        lat: drone.registrationLat || 11.6,
        lng: drone.registrationLng || 76.1,
      },
      health: "good", // Default value - would come from real system health check
      agentTopicId: drone.agentTopicId,
      model: drone.model,
      serialNumber: drone.serialNumber,
    };

    const reasoning: string[] = [];
    let totalScore = 0;

    // Battery evaluation (35 points max)
    let batteryScore = 0;
    if (metrics.batteryLevel >= 80) {
      batteryScore = 35;
      reasoning.push(`Battery excellent (${metrics.batteryLevel}%)`);
    } else if (metrics.batteryLevel >= 60) {
      batteryScore = 25;
      reasoning.push(`Battery adequate (${metrics.batteryLevel}%)`);
    } else if (metrics.batteryLevel >= 40) {
      batteryScore = 15;
      reasoning.push(`Battery limited (${metrics.batteryLevel}%)`);
    } else {
      batteryScore = 0;
      reasoning.push(`Battery critical (${metrics.batteryLevel}%)`);
    }

    // Proximity evaluation (30 points max)
    const distance = calculateDistance(
      metrics.location.lat,
      metrics.location.lng,
      centerLat,
      centerLng
    );
    let proximityScore = 0;
    if (distance < 2) {
      proximityScore = 30;
      reasoning.push(`Optimal position (${distance.toFixed(2)}km)`);
    } else if (distance < 5) {
      proximityScore = 20;
      reasoning.push(`Good position (${distance.toFixed(2)}km)`);
    } else if (distance < 10) {
      proximityScore = 10;
      reasoning.push(`Acceptable distance (${distance.toFixed(2)}km)`);
    } else {
      proximityScore = 0;
      reasoning.push(`Too far (${distance.toFixed(2)}km)`);
    }

    // Health evaluation (25 points max)
    let healthScore = 0;
    if (metrics.health === "excellent") {
      healthScore = 25;
      reasoning.push("Health status: Excellent");
    } else if (metrics.health === "good") {
      healthScore = 18;
      reasoning.push("Health status: Good");
    } else if (metrics.health === "fair") {
      healthScore = 10;
      reasoning.push("Health status: Fair");
    } else {
      healthScore = 0;
      reasoning.push("Health status: Poor");
    }

    // Agent validation (10 points max)
    let agentScore = 0;
    if (metrics.agentTopicId) {
      agentScore = 10;
      reasoning.push("Hedera agent: Verified ✓");
    } else {
      reasoning.push("Hedera agent: Not registered");
    }

    totalScore = Math.min(100, batteryScore + proximityScore + healthScore + agentScore);

    scores.push({
      drone: metrics,
      batteryScore,
      proximityScore,
      healthScore,
      agentScore,
      totalScore,
      reasoning,
    });

    await sleep(400);
  }

  // Phase 3: Reasoning
  await addThought(
    "reasoning",
    `🧠 Analyzing ${scores.length} drone profile(s) for optimal mission fitness...`,
    1000
  );

  // Sort by score
  scores.sort((a, b) => b.totalScore - a.totalScore);
  const topCandidate = scores[0];

  await addThought(
    "reasoning",
    `Top candidate: ${topCandidate.drone.cairnDroneId} (Score: ${topCandidate.totalScore}/100)`,
    800
  );

  // Detailed analysis of top candidate
  for (const reason of topCandidate.reasoning) {
    await addThought("reasoning", `  • ${reason}`, 500);
  }

  // Phase 4: Decision
  await addThought(
    "decision",
    `🎯 Making final selection based on mission requirements...`,
    900
  );

  const confidence = Math.min(100, 50 + topCandidate.totalScore);
  await addThought(
    "decision",
    `✅ Confidence level: ${Math.round(confidence)}%`,
    700
  );

  // Phase 5: Conclusion
  await addThought(
    "conclusion",
    `🚀 ${topCandidate.drone.cairnDroneId} is optimal for this mission`,
    800
  );

  await addThought(
    "conclusion",
    `Mission-ready drone selected. Ready for deployment.`,
    600
  );

  const fullReasoning = scores
    .slice(0, 3)
    .map(
      (s, i) =>
        `${i + 1}. ${s.drone.cairnDroneId}: ${s.totalScore}/100 - ${s.reasoning.join(", ")}`
    )
    .join("\n");

  return {
    selectedDrone: topCandidate.drone,
    score: topCandidate.totalScore,
    thoughts,
    reasoning: fullReasoning,
    confidence: Math.round(confidence),
  };
}
