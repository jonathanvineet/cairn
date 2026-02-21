"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ScrollControls } from "@react-three/drei";
import { DroneModel } from "./DroneModel";
import { FenceShader } from "./FenceShader";
import { ForestBg } from "./ForestBg";
import { PerformanceOptimizer } from "./PerformanceOptimizer";

export function HeroScene() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          <ScrollControls pages={4} damping={0.2}>
            <PerformanceOptimizer />
            
            <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={50} />
            
            {/* Lighting setup */}
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1.2}
              color="#4ade80"
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            <pointLight position={[0, 5, 0]} intensity={0.8} color="#2D5A27" />
            <pointLight position={[-8, 3, -8]} intensity={0.6} color="#A8D5BA" />
            <spotLight
              position={[0, 15, 0]}
              angle={0.4}
              penumbra={1}
              intensity={1.5}
              color="#86efac"
              castShadow
            />

            {/* Environment for reflections */}
            <Environment preset="forest" />

            {/* Fog for depth */}
            <fog attach="fog" args={["#0a1a0f", 15, 50]} />

            {/* 3D Elements */}
            <ForestBg />
            <FenceShader />
            <DroneModel />

            {/* Subtle orbit controls */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              maxPolarAngle={Math.PI / 2.2}
              minPolarAngle={Math.PI / 3.5}
              autoRotate
              autoRotateSpeed={0.3}
              dampingFactor={0.05}
              enableDamping
            />
          </ScrollControls>
        </Suspense>
      </Canvas>
    </div>
  );
}
