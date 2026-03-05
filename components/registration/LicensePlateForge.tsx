"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface LicensePlateForgeProps {
  plateName: string;
}

export function LicensePlateForge({ plateName }: LicensePlateForgeProps) {
  const plateRef = useRef<THREE.Mesh>(null!);
  const textRef = useRef<THREE.Mesh>(null);
  const forgeProgress = useRef(0);
  const [phase, setPhase] = useState<"materialize" | "stamp" | "flash" | "settle">("materialize");
  
  useFrame((state, delta) => {
    forgeProgress.current += delta;
    
    if (!plateRef.current) return;
    
    // Phase 1: Materialize (0-200ms)
    if (forgeProgress.current < 0.2) {
      const progress = forgeProgress.current / 0.2;
      plateRef.current.scale.set(progress * 1.8, progress * 0.5, 1);
      if (Array.isArray(plateRef.current.material)) {
        plateRef.current.material[0].opacity = progress;
      } else {
        plateRef.current.material.opacity = progress;
      }
    }
    // Phase 2: Stamp (200-600ms)
    else if (forgeProgress.current < 0.6) {
      if (phase !== "stamp") setPhase("stamp");
      // Characters visible with scale animation handled in render
    }
    // Phase 3: Flash (600-900ms)
    else if (forgeProgress.current < 0.9) {
      if (phase !== "flash") setPhase("flash");
      const flashIntensity = Math.sin((forgeProgress.current - 0.6) * Math.PI * 10) * 0.5 + 0.5;
      if (plateRef.current.material instanceof THREE.MeshBasicMaterial) {
        const material = (Array.isArray(plateRef.current.material)
          ? plateRef.current.material[0]
          : plateRef.current.material) as unknown as THREE.MeshStandardMaterial;
        material.emissiveIntensity = flashIntensity * 2;
      }
    }
    // Phase 4: Settle
    else {
      if (phase !== "settle") setPhase("settle");
    }
  });
  
  return (
    <group position={[0, -0.8, 0.1]}>
      {/* Plate geometry */}
      <mesh ref={plateRef} castShadow>
        <planeGeometry args={[1.8, 0.5]} />
        <meshStandardMaterial
          color="#1a1a2e"
          transparent
          opacity={0}
          emissive="#00f5ff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Plate text */}
      {phase !== "materialize" && (
        <Text
          ref={textRef}
          position={[0, 0, 0.01]}
          fontSize={0.12}
          color="#00f5ff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Rajdhani-Bold.ttf"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {plateName}
        </Text>
      )}
      
      {/* Edge glow */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(1.8, 0.5)]} />
        <lineBasicMaterial color="#00f5ff" />
      </lineSegments>
    </group>
  );
}
