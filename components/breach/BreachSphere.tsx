"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BreachSphereProps {
  position: [number, number, number];
  onInteract: () => void;
}

export function BreachSphere({ position, onInteract }: BreachSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const [hovered, setHovered] = useState(false);
  const [imploding, setImploding] = useState(false);
  const implodeProgress = useRef(0);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    if (imploding) {
      // Implode animation
      implodeProgress.current += state.clock.getDelta() * 3.33; // 300ms duration
      const scale = THREE.MathUtils.lerp(1, 0, Math.min(implodeProgress.current, 1));
      meshRef.current.scale.setScalar(scale);
      
      if (implodeProgress.current >= 1) {
        // Animation complete - trigger form explosion
        onInteract();
      }
    } else {
      // Pulse animation
      const pulse = Math.sin(time * 3) * 0.4 + 0.6;
      meshRef.current.scale.setScalar(hovered ? 1.4 : 1.0);
      
      // Update material emissive
      if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
        meshRef.current.material.emissiveIntensity = pulse;
      }
      
      // Update light
      if (lightRef.current) {
        lightRef.current.intensity = 8 * pulse;
      }
    }
  });
  
  const handleClick = () => {
    if (!imploding) {
      setImploding(true);
      document.body.style.cursor = "default";
    }
  };
  
  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = "crosshair";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "none";
        }}
        onClick={handleClick}
      >
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial
          color="#e94560"
          emissive="#ff1744"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      
      <pointLight
        ref={lightRef}
        color="#ff1744"
        intensity={8}
        distance={30}
      />
    </group>
  );
}
