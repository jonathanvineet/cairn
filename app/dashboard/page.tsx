"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plane, MapPin, Shield, Battery, Radio, Mountain, Zap, Copy, ExternalLink, X, ArrowLeft } from "lucide-react";
import { useWalletStore } from "@/stores/walletStore";

interface Drone {
  cairnDroneId: string;
  evmAddress: string;
  model: string;
  assignedZoneId: string;
  status: string;
  registrationLat?: number;
  registrationLng?: number;
  agentTopicId?: string;
  isAgent?: boolean;
  hederaAccountId?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { connected, selectedAccount } = useWalletStore();
  const [drones, setDrones] = useState<Drone[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "live" | "fleet" | "missions">("overview");
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [telemetry, setTelemetry] = useState({
    altitude: 45,
    speed: 12,
    battery: 87,
    signal: 95,
    zone: "Z-001",
    dataRate: 2.4,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!connected) {
      alert("Please connect your HashPack wallet first");
      router.push("/");
    } else {
      fetchData();
    }
  }, [connected, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        altitude: prev.altitude + Math.random() * 10 - 5,
        speed: prev.speed + Math.random() * 4 - 2,
        battery: Math.max(0, prev.battery - 0.1),
        signal: Math.max(50, prev.signal + Math.random() * 10 - 5),
        zone: prev.zone,
        dataRate: prev.dataRate + Math.random() * 0.5 - 0.25,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [dronesRes, zonesRes] = await Promise.all([
        fetch("/api/drones"),
        fetch("/api/zones")
      ]);
      if (dronesRes.ok) setDrones((await dronesRes.json()).drones || []);
      if (zonesRes.ok) setZones((await zonesRes.json()).zones || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] grid-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#D9D9D9] border-t-[#2E2E2E] rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-[#696969] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scanlines min-h-screen bg-[#FAFAFA] grid-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-[#D9D9D9] bg-[#FAFAFA] sticky top-0 z-50">
        <div className="px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-[#2E2E2E] hover:text-[#696969] transition">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-semibold">CAIRN</span>
            </Link>
            <span className="text-[#D9D9D9]">|</span>
            <span className="font-bold text-[#2E2E2E]">COMMAND CENTER</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#4ade80] live-dot"></div>
              <span className="text-xs font-semibold text-[#2E2E2E]">DRONE LIVE</span>
            </div>
            <div className="bg-[#2E2E2E] text-[#FAFAFA] rounded-full px-3 py-1.5 text-xs font-mono font-semibold">
              {selectedAccount?.id?.substring(0, 8)}...
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div className="w-48 border-r border-[#D9D9D9] bg-[#FAFAFA] flex flex-col p-6 space-y-6">
          {/* Nav Tabs */}
          <div className="space-y-2">
            {["overview", "live", "fleet", "missions"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`w-full px-3 py-2 rounded text-left text-xs font-semibold transition ${
                  activeTab === tab
                    ? "bg-[#2E2E2E] text-[#FAFAFA]"
                    : "text-[#696969] hover:bg-[#D9D9D9]"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="border-t border-[#D9D9D9]"></div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Link href="/register">
              <button className="w-full text-xs font-semibold py-2 text-[#2E2E2E] hover:bg-[#D9D9D9] rounded transition">
                REGISTER
              </button>
            </Link>
            <Link href="/deploy">
              <button className="w-full text-xs font-semibold py-2 text-[#2E2E2E] hover:bg-[#D9D9D9] rounded transition">
                DEPLOY
              </button>
            </Link>
            <Link href="/analysis">
              <button className="w-full text-xs font-semibold py-2 text-[#2E2E2E] hover:bg-[#D9D9D9] rounded transition">
                ANALYSIS
              </button>
            </Link>
          </div>

          <div className="border-t border-[#D9D9D9]"></div>

          {/* Mini Telemetry */}
          <div className="space-y-2 text-xs">
            <div className="text-[#696969] font-semibold">TELEMETRY</div>
            <div className="space-y-1 font-mono text-[#2E2E2E]">
              <div>BATTERY: {Math.round(telemetry.battery)}%</div>
              <div>SIGNAL: {Math.round(telemetry.signal)}%</div>
              <div>ALT: {Math.round(telemetry.altitude)}m</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === "overview" && (
            <div className="p-8 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Registered Drones", value: drones.length },
                  { label: "Total Missions", value: 0 },
                  { label: "Active Zones", value: zones.length },
                  { label: "Evidence Hashes", value: 0 }
                ].map(stat => (
                  <div key={stat.label} className="card card-offset">
                    <div className="text-xs text-[#696969] font-semibold mb-2">{stat.label}</div>
                    <div className="text-3xl font-bold text-[#2E2E2E]">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Live Telemetry Card */}
              <div className="card card-offset space-y-4">
                <div className="text-sm font-bold text-[#2E2E2E] flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#4ade80] rounded-full live-dot"></div>
                  LIVE TELEMETRY
                </div>
                <div className="bg-[#2E2E2E] rounded text-[#FAFAFA] p-4 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-center">
                    <Plane className="w-8 h-8 opacity-50" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-[#D9D9D9]">ALTITUDE</div>
                      <div className="text-lg font-bold">{Math.round(telemetry.altitude)}m</div>
                    </div>
                    <div>
                      <div className="text-[#D9D9D9]">SPEED</div>
                      <div className="text-lg font-bold">{Math.round(telemetry.speed)}m/s</div>
                    </div>
                    <div>
                      <div className="text-[#D9D9D9]">BATTERY</div>
                      <div className="text-lg font-bold">{Math.round(telemetry.battery)}%</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-[#D9D9D9]">SIGNAL</div>
                      <div className="text-lg font-bold">{Math.round(telemetry.signal)}%</div>
                    </div>
                    <div>
                      <div className="text-[#D9D9D9]">ZONE</div>
                      <div className="text-lg font-bold">{telemetry.zone}</div>
                    </div>
                    <div>
                      <div className="text-[#D9D9D9]">DATA RATE</div>
                      <div className="text-lg font-bold">{telemetry.dataRate.toFixed(1)}Mbps</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Missions */}
              <div className="card card-offset space-y-4">
                <div className="text-sm font-bold text-[#2E2E2E]">RECENT MISSIONS</div>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>MISSION ID</th>
                      <th>ZONE</th>
                      <th>STATUS</th>
                      <th>TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} className="text-center text-[#696969] text-xs py-6">No missions yet</td>
                    </tr>
                  </tbody>
                </table>
                <button className="btn-ghost w-full">VIEW ALL</button>
              </div>
            </div>
          )}

          {activeTab === "live" && (
            <div className="p-8 space-y-6">
              {/* Live Feed Panel */}
              <div className="space-y-4">
                <div className="bg-[#2E2E2E] aspect-video rounded border border-[#D9D9D9] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 scanlines"></div>
                  <Plane className="w-16 h-16 text-[#FAFAFA] opacity-50 drone-float" />
                  <div className="absolute top-4 left-4 text-[#FAFAFA] text-xs font-semibold">● LIVE · DRONE-001</div>
                  <div className="absolute top-4 right-4 text-[#FAFAFA] text-xs font-mono">
                    <div>45m · 14:23:45</div>
                  </div>
                  <div className="absolute bottom-4 right-4 text-[#FAFAFA] text-xs font-mono">
                    <div>Z-001 · 95%</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button className="btn-primary flex-1">RECORD</button>
                  <button className="btn-primary flex-1">SNAPSHOT</button>
                </div>
              </div>

              {/* Telemetry Strip */}
              <div className="grid grid-cols-8 gap-2">
                {[
                  { label: "ALT", value: `${Math.round(telemetry.altitude)}m` },
                  { label: "SPD", value: `${Math.round(telemetry.speed)}m/s` },
                  { label: "BAT", value: `${Math.round(telemetry.battery)}%` },
                  { label: "SIG", value: `${Math.round(telemetry.signal)}%` },
                  { label: "ZONE", value: telemetry.zone },
                  { label: "RATE", value: `${telemetry.dataRate.toFixed(1)}M` },
                  { label: "LAT", value: "28.61°N" },
                  { label: "LNG", value: "77.23°E" },
                ].map(item => (
                  <div key={item.label} className="border-l-2 border-[#D9D9D9] pl-2 py-2">
                    <div className="text-xs text-[#696969] font-semibold">{item.label}</div>
                    <div className="text-sm font-bold text-[#2E2E2E]">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "fleet" && (
            <div className="p-8">
              <div className="card card-offset overflow-hidden">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>DRONE ID</th>
                      <th>MODEL</th>
                      <th>STATUS</th>
                      <th>ZONE</th>
                      <th>BATTERY</th>
                      <th>HEALTH</th>
                      <th>MISSIONS</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {drones.map(drone => (
                      <tr key={drone.evmAddress}>
                        <td className="font-mono">{drone.cairnDroneId}</td>
                        <td>{drone.model}</td>
                        <td>
                          <span className={`badge ${drone.status === "ACTIVE" ? "badge-active" : "badge-idle"}`}>
                            {drone.status}
                          </span>
                        </td>
                        <td className="text-sm text-[#696969]">{drone.assignedZoneId}</td>
                        <td>
                          <div className="ptrack">
                            <div className="pfill" style={{ width: "87%" }}></div>
                          </div>
                          <span className="text-xs text-[#696969] mt-1">87%</span>
                        </td>
                        <td className="text-sm">Good</td>
                        <td className="text-center">0</td>
                        <td>
                          <a href="https://hashscan.io/testnet" target="_blank" rel="noopener noreferrer" className="text-[#2E2E2E] hover:underline">
                            →
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "missions" && (
            <div className="p-8 space-y-4">
              {/* Filter Tabs */}
              <div className="flex gap-2">
                {["ALL", "SUCCESS", "PROCESSING", "FAILED"].map(filter => (
                  <button key={filter} className="btn-ghost">{filter}</button>
                ))}
              </div>

              <div className="card card-offset overflow-hidden">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>MISSION ID</th>
                      <th>ZONE</th>
                      <th>DRONE</th>
                      <th>STATUS</th>
                      <th>HASH</th>
                      <th>TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="text-center text-[#696969] text-xs py-6">No missions</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
