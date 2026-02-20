import Link from "next/link";
import {
  Map,
  Activity,
  AlertTriangle,
  Database,
  Navigation,
  Plus,
} from "lucide-react";

const stats = [
  { label: "Active Zones", value: "12", icon: <Map className="h-5 w-5" />, color: "text-green-400" },
  { label: "Patrols Today", value: "7", icon: <Activity className="h-5 w-5" />, color: "text-blue-400" },
  { label: "Open Alerts", value: "3", icon: <AlertTriangle className="h-5 w-5" />, color: "text-amber-400", highlight: true },
  { label: "Pending Anchors", value: "2", icon: <Database className="h-5 w-5" />, color: "text-purple-400" },
];

const zones = [
  { name: "Nilgiris-04", region: "Tamil Nadu", lastInspected: "2 hrs ago", condition: "Good", risk: 2, status: "Active" },
  { name: "Wayanad-11", region: "Kerala", lastInspected: "5 hrs ago", condition: "Warning", risk: 6, status: "Alert" },
  { name: "Coorg-07", region: "Karnataka", lastInspected: "1 day ago", condition: "Critical", risk: 9, status: "Dispute" },
  { name: "Anamalai-03", region: "Tamil Nadu", lastInspected: "3 hrs ago", condition: "Good", risk: 1, status: "Active" },
  { name: "Agasthya-02", region: "Kerala", lastInspected: "6 hrs ago", condition: "Moderate", risk: 4, status: "Active" },
];

const activity = [
  { id: 1, text: "Zone Nilgiris-04: Anomaly detected at Checkpoint 7", time: "14 mins ago", href: "/dashboard/zones/nilgiris-04", type: "alert" },
  { id: 2, text: "Mission #MIS-2041 completed", time: "1 hour ago", href: "/dashboard/patrol/history", type: "mission" },
  { id: 3, text: "Evidence record EV-8821 anchored to Hedera", time: "2 hours ago", href: "/dashboard/evidence/ev-8821", type: "anchor" },
  { id: 4, text: "Zone Wayanad-11 patrol started by Rajan K.", time: "3 hours ago", href: "/dashboard/patrol/active", type: "mission" },
  { id: 5, text: "Dispute filed for Coorg-07 boundary violation", time: "5 hours ago", href: "/dashboard/disputes", type: "alert" },
];

const conditionColors: Record<string, string> = {
  Good: "bg-green-500/20 text-green-400",
  Moderate: "bg-blue-500/20 text-blue-400",
  Warning: "bg-amber-500/20 text-amber-400",
  Critical: "bg-red-500/20 text-red-400",
};

const statusColors: Record<string, string> = {
  Active: "text-green-400",
  Alert: "text-amber-400",
  Dispute: "text-red-400",
};

const activityDot: Record<string, string> = {
  alert: "bg-amber-400",
  mission: "bg-blue-400",
  anchor: "bg-purple-400",
};

const role = "OPERATOR";
const hasActiveMission = false;

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Stat row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border ${
              stat.highlight ? "border-amber-500/30 bg-amber-500/5" : "border-white/10 bg-white/5"
            } p-5`}
          >
            <div className={`mb-2 ${stat.color}`}>{stat.icon}</div>
            <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Zone Status Overview */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-white">Zone Status Overview</h2>
          <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-gray-500">
                  <th className="px-4 py-3 font-medium">Zone</th>
                  <th className="px-4 py-3 font-medium">Region</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Last Inspected</th>
                  <th className="px-4 py-3 font-medium">Condition</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Risk</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone, i) => (
                  <tr
                    key={zone.name}
                    className={`border-b border-white/5 hover:bg-white/5 transition cursor-pointer ${
                      i === zones.length - 1 ? "border-0" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      <Link href={`/dashboard/zones/${zone.name.toLowerCase()}`}>
                        {zone.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{zone.region}</td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{zone.lastInspected}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${conditionColors[zone.condition]}`}>
                        {zone.condition}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${
                              zone.risk >= 7 ? "bg-red-400" : zone.risk >= 4 ? "bg-amber-400" : "bg-green-400"
                            }`}
                            style={{ width: `${zone.risk * 10}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{zone.risk}/10</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-xs font-medium ${statusColors[zone.status]}`}>
                      {zone.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity feed */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-white">Recent Activity</h2>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
            {activity.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-start gap-3 group"
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${activityDot[item.type]}`} />
                <div>
                  <p className="text-xs text-gray-300 group-hover:text-white transition leading-snug">
                    {item.text}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{item.time}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Active Mission Panel (OPERATOR only) */}
      {role === "OPERATOR" && (
        <div>
          <h2 className="mb-4 text-base font-semibold text-white">Active Mission</h2>
          {hasActiveMission ? (
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-white">Mission #MIS-2042</p>
                  <p className="text-sm text-gray-400">Zone: Nilgiris-04 · Started 32 mins ago</p>
                </div>
                <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
                  In Progress
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Checkpoint progress</span>
                  <span>5 / 12</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full w-[42%] rounded-full bg-green-400" />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/20 p-8 text-center">
              <Navigation className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm mb-4">No active patrol mission</p>
              <Link
                href="/dashboard/patrol/active"
                className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-green-400 transition"
              >
                <Plus className="h-4 w-4" />
                Start New Patrol
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
