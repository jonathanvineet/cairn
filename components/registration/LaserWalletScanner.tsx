"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

// 🔒 VISUAL SHELL ONLY - Payment logic stays in YOUR code
interface LaserWalletScannerProps {
  amount: number;
  droneId: string;
  onPaymentComplete: (result?: { success: boolean; transactionId: string }) => void;
}

export function LaserWalletScanner({
  amount,
  droneId,
  onPaymentComplete,
}: LaserWalletScannerProps) {
  const cardRef = useRef<THREE.Mesh>(null!);
  const beamRef = useRef<THREE.Mesh>(null!);
  const stripeRef = useRef<THREE.Mesh>(null!);
  const [scanProgress, setScanProgress] = useState(0);
  const [phase, setPhase] = useState<"scanning" | "complete" | "imploding">("scanning");
  const implodeProgress = useRef(0);
  
  useFrame((state, delta) => {
    // Phase 1: Laser scan (0-1.2s)
    if (phase === "scanning") {
      setScanProgress((p) => Math.min(p + delta / 1.2, 1));
      
      if (beamRef.current) {
        // Move beam across card
        beamRef.current.position.x = -0.8 + scanProgress * 1.6;
      }
      
      if (stripeRef.current) {
        // Grow green stripe
        stripeRef.current.scale.x = scanProgress;
      }
      
      if (scanProgress >= 1) {
        setPhase("complete");
        
        // Mock payment success - in real app, YOUR payment function is called
        setTimeout(() => {
          setPhase("imploding");
        }, 300);
      }
    }
    
    // Phase 2: Card implode
    if (phase === "imploding" && cardRef.current) {
      implodeProgress.current += delta * 3; // 333ms duration
      const scale = THREE.MathUtils.lerp(1, 0, Math.min(implodeProgress.current, 1));
      cardRef.current.scale.setScalar(scale);
      
      if (implodeProgress.current >= 1) {
        // Trigger completion callback
        onPaymentComplete({ success: true, transactionId: `mock-${Date.now()}` });
      }
    }
  });
  
  return (
    <group position={[0, 0, 0.2]}>
      {/* Card */}
      <mesh ref={cardRef}>
        <boxGeometry args={[1.6, 1.0, 0.06]} />
        <meshPhysicalMaterial
          color="#16213e"
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.1}
          transmission={0.9}
          thickness={0.5}
        />
      </mesh>
      
      {/* Card content */}
      <Text
        position={[0, 0.3, 0.04]}
        fontSize={0.08}
        color="#8b5cf6"
        anchorX="center"
        anchorY="middle"
        font="/fonts/JetBrainsMono-Regular.ttf"
      >
        PAYMENT VERIFICATION
      </Text>
      
      <Text
        position={[0, 0.1, 0.04]}
        fontSize={0.15}
        color="#00f5ff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Rajdhani-Bold.ttf"
      >
        ₹{amount}
      </Text>
      
      <Text
        position={[0, -0.1, 0.04]}
        fontSize={0.06}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        DRONE: {droneId}
      </Text>
      
      {/* Laser emitter */}
      <mesh position={[-0.85, 0, 0.05]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 8]} />
        <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={2} />
      </mesh>
      
      {/* Laser beam */}
      {phase === "scanning" && (
        <mesh ref={beamRef} position={[0, 0, 0.05]}>
          <boxGeometry args={[0.05, 1.0, 0.01]} />
          <meshStandardMaterial
            color="#00f5ff"
            transparent
            opacity={0.8}
            emissive="#00f5ff"
            emissiveIntensity={12}
          />
        </mesh>
      )}
      
      {/* Green approval stripe */}
      <mesh ref={stripeRef} position={[0, -0.3, 0.04]} scale={[0, 1, 1]}>
        <boxGeometry args={[1.4, 0.15, 0.01]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}
