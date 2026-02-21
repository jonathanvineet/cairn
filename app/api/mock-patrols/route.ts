import { NextResponse } from "next/server";

const mockPatrols = [
  {
    id: "PTR-2041",
    zone: "Wayanad WY-11",
    timestamp: "2026-02-21 09:00",
    checkpoints: 12,
    status: "complete",
    operator: "Drone-Alpha",
    intactCount: 10,
    anomalyCount: 1,
    breachCount: 1,
  },
  {
    id: "PTR-2040",
    zone: "Wayanad WY-11",
    timestamp: "2026-02-20 14:30",
    checkpoints: 16,
    status: "complete",
    operator: "Drone-Beta",
    intactCount: 14,
    anomalyCount: 2,
    breachCount: 0,
  },
  {
    id: "PTR-2039",
    zone: "Wayanad WY-11",
    timestamp: "2026-02-20 06:00",
    checkpoints: 16,
    status: "complete",
    operator: "Drone-Alpha",
    intactCount: 16,
    anomalyCount: 0,
    breachCount: 0,
  },
  {
    id: "PTR-2038",
    zone: "Nilgiris NG-04",
    timestamp: "2026-02-19 15:45",
    checkpoints: 8,
    status: "complete",
    operator: "Drone-Gamma",
    intactCount: 7,
    anomalyCount: 1,
    breachCount: 0,
  },
  {
    id: "PTR-2037",
    zone: "Coorg CG-07",
    timestamp: "2026-02-19 10:15",
    checkpoints: 10,
    status: "complete",
    operator: "Drone-Beta",
    intactCount: 8,
    anomalyCount: 1,
    breachCount: 1,
  },
  {
    id: "PTR-LIVE",
    zone: "Wayanad WY-11",
    timestamp: "2026-02-21 09:30",
    checkpoints: 12,
    status: "in-progress",
    operator: "Drone-Alpha",
    intactCount: 7,
    anomalyCount: 0,
    breachCount: 0,
  },
];

const mockCheckpoints = Array.from({ length: 16 }, (_, i) => ({
  id: `CP#${i + 1}`,
  lat: (11.685 + i * 0.001).toFixed(4) + "°N",
  lng: (76.07 + i * 0.0013).toFixed(4) + "°E",
  status: i === 3 ? "anomaly" : i === 11 ? "breach" : "intact",
  lastInspected: `2026-02-21 0${8 + Math.floor(i / 4)}:${String((i % 4) * 15).padStart(2, "0")}`,
  photo: `/photos/cp${i + 1}.jpg`,
  hashOnChain: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
}));

export async function GET() {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json({
    zone: {
      id: "WY-11",
      name: "Wayanad Wildlife Sanctuary",
      region: "Kerala, India",
      totalCheckpoints: 16,
      intact: 14,
      anomalies: 2,
      breaches: 0,
      lastPatrol: "2026-02-21T09:00:00Z",
    },
    patrols: mockPatrols,
    checkpoints: mockCheckpoints,
  });
}
