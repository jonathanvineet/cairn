"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HologramPanel } from "../registration/HologramPanel";
import type { ZoneRecord, RegistrationFormValues } from "../world/WorldOrchestrator";

interface BreachFormExplosionProps {
  position: [number, number, number];
  zones: ZoneRecord[];
  onRegisterDrone?: (formValues: RegistrationFormValues) => void;
  onClose?: () => void;
}

export function BreachFormExplosion({ position, zones, onRegisterDrone, onClose }: BreachFormExplosionProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const hexagonsRef = useRef<THREE.Mesh[]>([]);
  const [phase, setPhase] = useState<"explode" | "form">("explode");
  const explosionProgress = useRef(0);
  
  // Initial hexagon explosion
  useFrame((state, delta) => {
    if (phase === "explode") {
      explosionProgress.current += delta * 1.67; // 600ms duration
      
      hexagonsRef.current.forEach((hex, i) => {
        if (!hex) return;
        
        const angle = (i / 12) * Math.PI * 2;
        const explosionDist = 8;
        
        // Explode outward
        const progress = Math.min(explosionProgress.current, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        hex.position.x = Math.cos(angle) * explosionDist * easeProgress;
        hex.position.z = Math.sin(angle) * explosionDist * easeProgress;
        hex.rotation.z = easeProgress * Math.PI * 2;
      });
      
      if (explosionProgress.current >= 1) {
        setPhase("form");
      }
    }
  });
  
  // Create 12 wireframe hexagons
  const createHexagons = () => {
    const hexagons: React.ReactElement[] = [];
    
    for (let i = 0; i < 12; i++) {
      hexagons.push(
        <mesh
          key={i}
          ref={(el) => {
            if (el && !hexagonsRef.current.includes(el)) {
              hexagonsRef.current[i] = el;
            }
          }}
        >
          <ringGeometry args={[0.8, 1.0, 6]} />
          <meshBasicMaterial color="#533a88" wireframe transparent opacity={0.8} />
        </mesh>
      );
    }
    
    return hexagons;
  };
  
  return (
    <group ref={groupRef} position={position}>
      {phase === "explode" && createHexagons()}
      
      {phase === "form" && (
        <HologramPanel
          position={[0, 0, 0]}
          zones={zones}
          onRegisterDrone={onRegisterDrone}
        />
      )}
    </group>
  );
}
