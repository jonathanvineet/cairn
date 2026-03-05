"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DroneTrailProps {
  position: THREE.Vector3;
}

export function DroneTrail({ position }: DroneTrailProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trailRef = useRef<any>(null!);
  const pointsRef = useRef<THREE.Vector3[]>([]);
  const maxPoints = 20;
  
  useFrame(() => {
    // Add current position
    pointsRef.current.push(position.clone());
    
    // Keep only last N points
    if (pointsRef.current.length > maxPoints) {
      pointsRef.current.shift();
    }
    
    // Update line geometry
    if (trailRef.current && pointsRef.current.length > 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints(pointsRef.current);
      trailRef.current.geometry.dispose();
      trailRef.current.geometry = geometry;
    }
  });
  
  return (
    <line ref={trailRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#8b5cf6" transparent opacity={0.3} linewidth={2} />
    </line>
  );
}
