"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { Mesh, Group } from "three";

export function DroneModel() {
  const droneRef = useRef<Group>(null);
  const rotorRefs = [
    useRef<Mesh>(null),
    useRef<Mesh>(null),
    useRef<Mesh>(null),
    useRef<Mesh>(null),
  ];

  const scroll = useScroll();

  useFrame((state) => {
    if (!droneRef.current) return;
    
    // Scroll-synced position (0-1 normalized)
    const scrollOffset = scroll.offset;
    
    // Orbit drone around center with scroll influence
    const t = state.clock.elapsedTime * 0.3 + scrollOffset * 2;
    const radius = 3 + scrollOffset * 2; // Expand radius on scroll
    
    droneRef.current.position.x = Math.sin(t) * radius;
    droneRef.current.position.z = Math.cos(t) * radius;
    droneRef.current.position.y = 1 + Math.sin(t * 2) * 0.3 + scrollOffset * 3; // Rise on scroll
    droneRef.current.rotation.y = -t;
    
    // Tilt based on velocity
    droneRef.current.rotation.x = scroll.delta * 10;
    droneRef.current.rotation.z = -scroll.delta * 5;

    // Spin rotors faster on scroll
    const rotorSpeed = 0.5 + scrollOffset * 2;
    rotorRefs.forEach((ref) => {
      if (ref.current) {
        ref.current.rotation.y += rotorSpeed;
      }
    });
  });

  return (
    <group ref={droneRef}>
      {/* Drone body */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.2, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Camera lens */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#2D5A27" emissive="#2D5A27" emissiveIntensity={1} />
      </mesh>

      {/* Rotor arms + props */}
      {[
        [-0.4, 0.1, -0.4],
        [0.4, 0.1, -0.4],
        [-0.4, 0.1, 0.4],
        [0.4, 0.1, 0.4],
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          {/* Arm */}
          <mesh position={[pos[0] > 0 ? -0.2 : 0.2, -0.05, pos[2] > 0 ? -0.2 : 0.2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
          {/* Rotor */}
          <mesh ref={rotorRefs[i]}>
            <boxGeometry args={[0.5, 0.02, 0.08]} />
            <meshStandardMaterial
              color="#4ade80"
              transparent
              opacity={0.6}
              emissive="#2D5A27"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
