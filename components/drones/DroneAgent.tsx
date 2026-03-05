"use client";

import { useRef, memo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import type { Boid } from "@/hooks/useFlocking";
import type { DroneRecord } from "../world/WorldOrchestrator";
import { BatteryRingShader } from "./BatteryRingShader";
import { DroneTrail } from "./DroneTrail";

interface DroneAgentProps {
  drone: DroneRecord;
  boid: Boid;
  index: number;
  spawnProgress: number;
}

export const DroneAgent = memo(function DroneAgent({ drone, boid, index, spawnProgress }: DroneAgentProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const propRefs = useRef<THREE.Mesh[]>([]);
  const navLightsRef = useRef<THREE.PointLight[]>([]);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Position from boid
    groupRef.current.position.copy(boid.position);
    
    // Hover bob
    const bob = Math.sin(time * 2.2 + index * 0.5) * 0.08;
    groupRef.current.position.y += bob;
    
    // Bank on turn
    const bankAngle = boid.velocity.x * 2;
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, bankAngle, 0.1);
    
    // Face movement direction
    if (boid.velocity.length() > 0.01) {
      const targetRotation = Math.atan2(boid.velocity.x, boid.velocity.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation, 0.05);
    }
    
    // Propeller spin
    propRefs.current.forEach((prop) => {
      if (prop) {
        prop.rotation.y += 8 * state.clock.getDelta() * Math.min(spawnProgress * 2, 1);
      }
    });
    
    // Nav lights pulse
    navLightsRef.current.forEach((light, i) => {
      if (light) {
        const pulse = Math.sin(time * 2 + i * Math.PI) * 0.5 + 0.5;
        light.intensity = pulse * 2;
      }
    });
    
    // Spawn animation
    if (spawnProgress < 1) {
      groupRef.current.scale.setScalar(spawnProgress);
    } else {
      groupRef.current.scale.setScalar(1);
    }
  });
  
  // Extract battery level from drone data (mock for now)
  const batteryLevel = 75 + Math.random() * 25; // 75-100%
  
  return (
    <group ref={groupRef}>
      {/* Drone body - octagonal chassis */}
      <mesh castShadow>
        <cylinderGeometry args={[0.6, 0.5, 0.25, 8]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.7}
          roughness={0.3}
          emissive="#8b5cf6"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Arms - 4 arms at 90 degree intervals */}
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 0.4;
        const z = Math.sin(rad) * 0.4;
        
        return (
          <group key={angle} position={[x, 0, z]} rotation={[0, rad, 0]}>
            {/* Arm */}
            <mesh castShadow>
              <boxGeometry args={[0.8, 0.06, 0.06]} />
              <meshStandardMaterial color="#0d0d1a" metalness={0.9} roughness={0.1} />
            </mesh>
            
            {/* Motor */}
            <mesh position={[0.4, 0, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.12, 12]} />
              <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* Propeller */}
            <mesh
              ref={(el) => {
                if (el && !propRefs.current.includes(el)) {
                  propRefs.current[i] = el;
                }
              }}
              position={[0.4, 0.08, 0]}
            >
              <planeGeometry args={[0.6, 0.08]} />
              <meshBasicMaterial color="#16213e" transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>
            
            {/* Nav light */}
            <pointLight
              ref={(el) => {
                if (el && !navLightsRef.current.includes(el)) {
                  navLightsRef.current[i] = el;
                }
              }}
              position={[0.4, 0, 0]}
              color={i % 2 === 0 ? "#ff0000" : "#00ff00"}
              intensity={2}
              distance={3}
            />
          </group>
        );
      })}
      
      {/* Camera gimbal */}
      <mesh position={[0, -0.2, 0]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#0d0d1a" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* License plate text */}
      <Text
        position={[0, -0.3, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.12}
        color="#00f5ff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Rajdhani-Bold.ttf"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {drone.cairnDroneId}
      </Text>
      
      {/* Battery rings */}
      <BatteryRingShader batteryLevel={batteryLevel} />
      
      {/* Motion trail */}
      {spawnProgress >= 1 && <DroneTrail position={boid.position} />}
    </group>
  );
});
