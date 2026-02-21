"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial, useScroll } from "@react-three/drei";
import * as THREE from "three";

export function ForestBg() {
  const pointsRef = useRef<THREE.Points>(null);
  const scroll = useScroll();

  const particleCount = 800;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 10 - 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.elapsedTime;
    const scrollOffset = scroll.offset;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const y = positions[i3 + 1];
      
      // Gentle float animation with scroll influence
      positions[i3 + 1] = y + Math.sin(time + i * 0.1) * 0.01 * (1 + scrollOffset * 2);
      
      // Burst effect during breach phase (25-50% scroll)
      const breachPhase = Math.max(0, Math.min(1, (scrollOffset - 0.25) * 4));
      if (breachPhase > 0) {
        const burstSpeed = breachPhase * 0.02;
        positions[i3] += Math.sin(time * 2 + i) * burstSpeed;
        positions[i3 + 2] += Math.cos(time * 2 + i) * burstSpeed;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Pulsing opacity on scroll
    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.opacity = 0.4 + scrollOffset * 0.3;
    material.size = 0.08 + scrollOffset * 0.05;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#A8D5BA"
        size={0.08}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}
