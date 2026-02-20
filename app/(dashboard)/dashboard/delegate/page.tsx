"use client";

import { useState } from "react";
import { Bot, CheckCircle, ChevronRight, Map, RefreshCw, Shield, Zap } from "lucide-react";

const cloudAgents = [
  {
    id: "agent-01",
    name: "SentinelAI-01",
    status: "online",
    specialization: "Perimeter Patrol",
    activeZones: 2,
    accuracy: 98,
    description: "High-accuracy perimeter monitoring with real-time anomaly detection.",
  },
  {
    id: "agent-02",
    name: "ForestGuard-07",
    status: "online",
    specialization: "Wildlife Monitoring",
    activeZones: 1,
    accuracy: 95,
    description: "Specialised in wildlife movement tracking and encroachment detection.",
  },
  {
    id: "agent-03",
    name: "BorderScan-03",
    status: "idle",
    specialization: "Boundary Verification",
    activeZones: 0,
    accuracy: 97,
    description: "Continuous boundary condition assessment and dispute flagging.",
  },
];

const delegatableZones = [
  { id: "nilgiris-04", name: "Nilgiris-04", region: "Tamil Nadu", risk: 2 },
  { id: "wayanad-11", name: "Wayanad-11", region: "Kerala", risk: 6 },
  { id: "coorg-07", name: "Coorg-07", region: "Karnataka", risk: 9 },
  { id: "anamalai-03", name: "Anamalai-03", region: "Tamil Nadu", risk: 1 },
  { id: "agasthya-02", name: "Agasthya-02", region: "Kerala", risk: 4 },
];

type DelegateStep = "configure" | "confirm" | "success";

export default function DelegatePage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [step, setStep] = useState<DelegateStep>("configure");

  const toggleZone = (id: string) => {
    setSelectedZones((prev) =>
      prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id]
    );
  };

  const canProceed = selectedAgent !== null && selectedZones.length > 0;

  const handleDelegate = () => setStep("success");

  const handleReset = () => {
    setSelectedAgent(null);
    setSelectedZones([]);
    setStep("configure");
  };

  const agent = cloudAgents.find((a) => a.id === selectedAgent);
  const zones = delegatableZones.filter((z) => selectedZones.includes(z.id));

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-white">Delegate to Cloud Agent</h1>
        <p className="mt-1 text-sm text-gray-400">
          Assign patrol and monitoring tasks to an autonomous cloud agent for selected zones.
        </p>
      </div>

      {step === "success" ? (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-10 text-center">
          <div className="inline-flex p-4 rounded-full bg-green-500/20 mb-4">
            <CheckCircle className="h-14 w-14 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Delegation Successful</h2>
          <p className="text-sm text-gray-400 mb-1">
            <span className="text-white font-medium">{agent?.name}</span> is now monitoring
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-3 mb-6">
            {zones.map((z) => (
              <span
                key={z.id}
                className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400"
              >
                {z.name}
              </span>
            ))}
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition"
          >
            <RefreshCw className="h-4 w-4" />
            New Delegation
          </button>
        </div>
      ) : step === "confirm" ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-base font-semibold text-white mb-4">Review Delegation</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Cloud Agent</span>
                <span className="font-medium text-white">{agent?.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Specialization</span>
                <span className="text-gray-300">{agent?.specialization}</span>
              </div>
              <div className="border-t border-white/10 pt-3">
                <p className="text-gray-400 text-sm mb-2">Zones to delegate</p>
                <div className="flex flex-wrap gap-2">
                  {zones.map((z) => (
                    <span
                      key={z.id}
                      className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white"
                    >
                      {z.name} &middot; {z.region}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep("configure")}
              className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition"
            >
              Back
            </button>
            <button
              onClick={handleDelegate}
              className="flex-1 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-green-400 transition"
            >
              Confirm Delegation
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Step 1: Choose agent */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">
              1. Select Cloud Agent
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {cloudAgents.map((ag) => (
                <button
                  key={ag.id}
                  onClick={() => setSelectedAgent(ag.id)}
                  className={`text-left rounded-xl border p-4 transition ${
                    selectedAgent === ag.id
                      ? "border-green-500/60 bg-green-500/10"
                      : "border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-white/10">
                      <Bot className="h-5 w-5 text-green-400" />
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        ag.status === "online"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {ag.status}
                    </span>
                  </div>
                  <p className="font-semibold text-white text-sm">{ag.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 mb-2">{ag.specialization}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{ag.description}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Map className="h-3 w-3" />
                      {ag.activeZones} zones
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {ag.accuracy}% accuracy
                    </span>
                  </div>
                  {selectedAgent === ag.id && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-green-400 font-medium">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Selected
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Choose zones */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">
              2. Select Zones to Delegate
            </h2>
            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              {delegatableZones.map((zone, i) => (
                <button
                  key={zone.id}
                  onClick={() => toggleZone(zone.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-sm transition ${
                    i < delegatableZones.length - 1 ? "border-b border-white/5" : ""
                  } ${
                    selectedZones.includes(zone.id)
                      ? "bg-green-500/10"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-4 w-4 rounded border flex items-center justify-center transition ${
                        selectedZones.includes(zone.id)
                          ? "border-green-500 bg-green-500"
                          : "border-white/30 bg-transparent"
                      }`}
                    >
                      {selectedZones.includes(zone.id) && (
                        <CheckCircle className="h-3 w-3 text-black" />
                      )}
                    </div>
                    <span className="font-medium text-white">{zone.name}</span>
                    <span className="text-gray-400">{zone.region}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Zap className="h-3.5 w-3.5" />
                    Risk {zone.risk}/10
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Proceed button */}
          <button
            disabled={!canProceed}
            onClick={() => setStep("confirm")}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition ${
              canProceed
                ? "bg-green-500 text-black hover:bg-green-400"
                : "bg-white/10 text-gray-500 cursor-not-allowed"
            }`}
          >
            Review Delegation
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
