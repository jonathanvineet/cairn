"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BatteryRingShaderProps {
  batteryLevel: number;
}

export function BatteryRingShader({ batteryLevel }: BatteryRingShaderProps) {
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const ring3Ref = useRef<THREE.Mesh>(null!);
  
  // Color based on battery level
  const getBatteryColor = (level: number): THREE.Color => {
    if (level > 50) return new THREE.Color(0x00f5ff); // Cyan
    if (level > 20) return new THREE.Color(0xf59e0b); // Gold
    return new THREE.Color(0xe94560); // Red
  };
  
  const color = getBatteryColor(batteryLevel);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Rotate rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += 0.4 * state.clock.getDelta();
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= 0.6 * state.clock.getDelta();
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x += 0.3 * state.clock.getDelta();
      ring3Ref.current.rotation.y += 0.3 * state.clock.getDelta();
    }
    
    // Breathing pulse
    const pulse = Math.sin(time * 4) * 0.08 + 0.15;
    const opacity = pulse + 0.15;
    
    [ring1Ref, ring2Ref, ring3Ref].forEach((ref) => {
      if (ref.current && ref.current.material instanceof THREE.MeshBasicMaterial) {
        ref.current.material.opacity = opacity;
      }
    });
  });
  
  return (
    <group>
      {/* Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.85, 0.02, 16, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      
      {/* Ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.1, 0.02, 16, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      
      {/* Ring 3 */}
      <mesh ref={ring3Ref}>
        <torusGeometry args={[1.35, 0.02, 16, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}
