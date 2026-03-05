"use client";

import { useWorldStore } from "@/stores/worldStore";

export function OperatorStatus() {
  const camera = useWorldStore((state) => state.camera);
  const scrollSpeed = useWorldStore((state) => state.scrollSpeed);
  
  const altitude = Math.round(camera.altitude);
  const speed = scrollSpeed.toFixed(1);
  const heading = Math.round(camera.heading);
  
  return (
    <div className="font-mono text-xs text-white/90 tracking-wider">
      <span className="text-white/60">ALT:</span> {altitude}m{" "}
      <span className="text-white/60">SPD:</span> {speed}{" "}
      <span className="text-white/60">HDG:</span> {heading}°
    </div>
  );
}
