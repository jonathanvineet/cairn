"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface RegistrationCompleteProps {
  droneData: {
    cairnDroneId?: string;
  };
}

export function RegistrationComplete({ droneData }: RegistrationCompleteProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const ringsRef = useRef<THREE.Mesh[]>([]);
  const animationProgress = useRef(0);
  
  useFrame((state, delta) => {
    animationProgress.current += delta;
    
    if (!groupRef.current) return;
    
    // Rings pulse outward
    ringsRef.current.forEach((ring, i) => {
      if (!ring) return;
      
      const delay = i * 0.2;
      const progress = Math.max(0, animationProgress.current - delay);
      
      if (progress < 1) {
        const scale = THREE.MathUtils.lerp(0, 3, progress);
        const opacity = THREE.MathUtils.lerp(0.8, 0, progress);
        
        ring.scale.setScalar(scale);
        
        if (ring.material instanceof THREE.MeshBasicMaterial) {
          ring.material.opacity = opacity;
        }
      }
    });
    
    // Text fade in
    if (animationProgress.current < 0.5) {
      groupRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const material = child.material as THREE.MeshStandardMaterial;
          if (material.opacity !== undefined) {
            material.opacity = animationProgress.current / 0.5;
          }
        }
      });
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 15, 0]}>
      {/* Success rings */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el && !ringsRef.current.includes(el)) {
              ringsRef.current[i] = el;
            }
          }}
        >
          <ringGeometry args={[1, 1.2, 32]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      ))}
      
      {/* Success text */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.3}
        color="#f59e0b"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Rajdhani-Bold.ttf"
      >
        REGISTRATION COMPLETE
      </Text>
      
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.15}
        color="#00f5ff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/JetBrainsMono-Regular.ttf"
      >
        {droneData?.cairnDroneId || "DRONE"}
      </Text>
      
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"

      >
        DEPLOYING TO PATROL...
      </Text>
    </group>
  );
}
