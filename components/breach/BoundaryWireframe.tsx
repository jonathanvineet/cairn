"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { ZoneRecord } from "../world/WorldOrchestrator";

interface BoundaryWireframeProps {
  zones: ZoneRecord[];
  registrationSuccess?: boolean;
}

export function BoundaryWireframe({ registrationSuccess }: BoundaryWireframeProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineRef = useRef<any>(null);
  const expandProgress = useRef(0);
  const isExpanding = useRef(false);
  
  // Octagonal patrol perimeter
  const points = useRef<THREE.Vector3[]>([]);
  
  // Initialize octagonal boundary
  if (points.current.length === 0) {
    const radius = 200;
    const sides = 8;
    
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      points.current.push(new THREE.Vector3(x, 1, z));
    }
  }
  
  // Trigger expansion on registration
  if (registrationSuccess && !isExpanding.current) {
    isExpanding.current = true;
    expandProgress.current = 0;
  }
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (lineRef.current && lineRef.current.material) {
      // Cast material to LineDashedMaterial for type safety (Line component with dashed=true uses LineDashedMaterial)
      const material = Array.isArray(lineRef.current.material)
        ? lineRef.current.material[0] as THREE.LineDashedMaterial
        : lineRef.current.material as THREE.LineDashedMaterial;
      
      // Animated color shift
      const colorShift = Math.sin(time * 0.5) * 0.5 + 0.5;
      const color = new THREE.Color().lerpColors(
        new THREE.Color(0x533a88),
        new THREE.Color(0x00f5ff),
        colorShift
      );
      material.color = color;
      
      // Dash offset for scanning visual (dashOffset exists at runtime but not in types)
      (material as unknown as { dashOffset: number }).dashOffset = -time * 2;
    }
    
    // Expansion animation
    if (isExpanding.current && expandProgress.current < 1) {
      expandProgress.current += state.clock.getDelta() * 0.5; // 2 second duration
      
      // Flash gold during expansion
      if (lineRef.current && lineRef.current.material) {
        const material = Array.isArray(lineRef.current.material)
          ? lineRef.current.material[0] as THREE.LineDashedMaterial
          : lineRef.current.material as THREE.LineDashedMaterial;
        material.color = new THREE.Color(0xf59e0b);
      }
      
      if (expandProgress.current >= 1) {
        isExpanding.current = false;
      }
    }
  });
  
  return (
    <group>
      <Line
        ref={lineRef}
        points={points.current}
        color="#533a88"
        lineWidth={2}
        dashed
        dashScale={10}
        dashSize={2}
        gapSize={1}
      />
      
      {/* Vertical projections */}
      {points.current.slice(0, -1).map((point, i) => (
        <Line
          key={i}
          points={[
            point,
            new THREE.Vector3(point.x, 30, point.z),
          ]}
          color="#533a88"
          lineWidth={1}
          transparent
          opacity={0.2}
        />
      ))}
    </group>
  );
}
