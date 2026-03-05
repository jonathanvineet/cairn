"use client";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function RotatingStars() {
  const ref = useRef<any>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });
  return (
    <Stars
      ref={ref}
      radius={300}
      depth={60}
      count={3000}
      factor={4}
      fade
      speed={0.5}
    />
  );
}

function ForestSilhouette() {
  return (
    <mesh position={[0, -8, -30]}>
      <boxGeometry args={[200, 12, 1]} />
      <meshBasicMaterial color="#0d2210" />
    </mesh>
  );
}

export default function SceneBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        background:
          "linear-gradient(180deg, #050810 0%, #0a1628 40%, #16213e 70%, #0d2210 100%)",
      }}
    >
      <Canvas camera={{ position: [0, 0, 50], fov: 60 }}>
        <RotatingStars />
        <ForestSilhouette />
        <ambientLight intensity={0.1} />
      </Canvas>
    </div>
  );
}
