"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Sphere, useScroll } from "@react-three/drei";
import { Group } from "three";
import * as THREE from "three";

const checkpoints = [
  [-4, 0, -3],
  [-2, 0, -3],
  [0, 0, -3],
  [2, 0, -3],
  [4, 0, -3],
  [4, 0, -1],
  [4, 0, 1],
  [4, 0, 3],
  [2, 0, 3],
  [0, 0, 3],
  [-2, 0, 3],
  [-4, 0, 3],
  [-4, 0, 1],
  [-4, 0, -1],
];

export function FenceShader() {
  const groupRef = useRef<Group>(null);
  const scroll = useScroll();

  useFrame((state) => {
    const scrollOffset = scroll.offset;
    
    if (groupRef.current) {
      // Subtle rotation with scroll
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1 + scrollOffset * 0.5;
      
      // Scale effect on scroll (breach simulation at 25-50%)
      const breachPhase = Math.max(0, Math.min(1, (scrollOffset - 0.25) * 4));
      const scale = 1 + breachPhase * 0.3;
      groupRef.current.scale.set(scale, 1, scale);
    }
  });

  // Create fence path
  const fencePath = checkpoints.map((cp) => new THREE.Vector3(cp[0], cp[1], cp[2]));
  fencePath.push(fencePath[0]); // Close the loop

  return (
    <group ref={groupRef}>
      {/* Wireframe fence line */}
      <Line
        points={fencePath}
        color="#2D5A27"
        lineWidth={2}
        transparent
        opacity={0.8}
      />

      {/* Glowing fence line */}
      <Line
        points={fencePath}
        color="#4ade80"
        lineWidth={4}
        transparent
        opacity={0.3}
      />

      {/* Checkpoint nodes */}
      {checkpoints.map((cp, i) => {
        const scrollOffset = scroll.offset;
        const breachPhase = Math.max(0, Math.min(1, (scrollOffset - 0.25) * 4));
        const color = breachPhase > 0.5 ? "#ef4444" : "#2D5A27";
        const emissive = breachPhase > 0.5 ? "#dc2626" : "#4ade80";
        
        return (
          <group key={i} position={cp as [number, number, number]}>
            {/* Core sphere */}
            <Sphere args={[0.12, 16, 16]} castShadow>
              <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={1 + Math.sin(i * 0.5) * 0.3 + breachPhase * 2}
                metalness={0.5}
                roughness={0.2}
              />
            </Sphere>

            {/* Outer glow */}
            <Sphere args={[0.18, 16, 16]}>
              <meshStandardMaterial
                color={emissive}
                transparent
                opacity={0.2 + breachPhase * 0.3}
                emissive={emissive}
                emissiveIntensity={0.5 + breachPhase}
              />
            </Sphere>

            {/* Vertical post */}
            <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.04, 0.04, 1]} />
              <meshStandardMaterial color="#8B4513" metalness={0.3} roughness={0.7} />
            </mesh>
          </group>
        );
      })}

      {/* Ground grid */}
      <gridHelper args={[20, 40, "#2D5A27", "#1a3a1f"]} position={[0, -1, 0]} />
    </group>
  );
}
