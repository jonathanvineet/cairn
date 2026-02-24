"use client";

import * as RL from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapContainer = RL.MapContainer as any;
const TileLayer = RL.TileLayer as any;
const CircleMarker = RL.CircleMarker as any;
const Tooltip = RL.Tooltip as any;

type LatLngTuple = [number, number];

const WAYANAD_CENTER: LatLngTuple = [11.6, 76.1];

const CHECKPOINTS: { position: LatLngTuple; id: string; status: "intact" | "anomaly" | "breach" }[] = [
  { position: [11.605, 76.08], id: "CP#1", status: "intact" },
  { position: [11.61, 76.09], id: "CP#2", status: "intact" },
  { position: [11.615, 76.1], id: "CP#3", status: "intact" },
  { position: [11.62, 76.11], id: "CP#4", status: "anomaly" },
  { position: [11.625, 76.12], id: "CP#5", status: "intact" },
  { position: [11.63, 76.13], id: "CP#6", status: "breach" },
  { position: [11.635, 76.14], id: "CP#7", status: "intact" },
];

const statusColor: Record<string, string> = {
  intact: "#22c55e",
  anomaly: "#f59e0b",
  breach: "#ef4444",
};

export function LeafletTriangleMap() {
  return (
    <div
      className="relative h-52 sm:h-64 rounded-lg border border-blue-500/30 bg-forest-900/80 overflow-hidden"
      style={{
        clipPath: "polygon(0 0, 100% 10%, 100% 90%, 0 100%)",
      }}
    >
      <MapContainer
        center={WAYANAD_CENTER}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {CHECKPOINTS.map((cp) => (
          <CircleMarker
            key={cp.id}
            center={cp.position}
            radius={cp.status === "breach" ? 9 : cp.status === "anomaly" ? 7 : 5}
            pathOptions={{
              color: statusColor[cp.status],
              fillColor: statusColor[cp.status],
              fillOpacity: cp.status === "breach" ? 0.6 : 0.4,
              weight: 2,
            }}
          >
            <Tooltip direction="top" offset={[0, -4]} opacity={0.9}>
              <span>{cp.id} — {cp.status}</span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      <div className="pointer-events-none absolute inset-x-2 bottom-2 flex items-center justify-between text-[10px] text-gray-400 font-mono">
        <span>Leaflet Map — Wayanad</span>
        <span className="flex gap-2">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Intact</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />Anomaly</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-400" />Breach</span>
        </span>
      </div>
    </div>
  );
}
