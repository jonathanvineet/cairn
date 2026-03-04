"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ScrollControls } from "@react-three/drei";
import { DroneModel } from "./DroneModel";
import { FenceShader } from "./FenceShader";
import { ForestBg } from "./ForestBg";
import { PerformanceOptimizer } from "./PerformanceOptimizer";

// Component to handle WebGL context loss/restoration
function ContextLossHandler() {
  const { gl } = useThree();
  
  useEffect(() => {
    const canvas = gl.domElement;
    
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.log('WebGL context lost - will attempt to restore');
    };
    
    const handleContextRestored = () => {
      console.log('WebGL context restored');
      // Force a re-render
      gl.setPixelRatio(window.devicePixelRatio);
    };
    
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);
  
  return null;
}

export function HeroScene() {
  const [frameloop, setFrameloop] = useState<'always' | 'demand' | 'never'>('always');
  
  useEffect(() => {
    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setFrameloop('never');
      } else {
        setFrameloop('always');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return (
    <Canvas
      shadows
      dpr={[0.8, 1.2]}
      frameloop={frameloop}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        stencil: false,
        depth: true,
      }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      }}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    >
        <Suspense fallback={null}>
          <ContextLossHandler />
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
              shadow-mapSize={[512, 512]}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            <pointLight position={[0, 5, 0]} intensity={0.8} color="#2D5A27" />
            <pointLight position={[-8, 3, -8]} intensity={0.6} color="#A8D5BA" />
            <spotLight
              position={[0, 15, 0]}
              angle={0.4}
              penumbra={1}
              intensity={1.5}
              color="#86efac"
              castShadow={false}
            />

            {/* Environment for reflections */}
            <Environment preset="dawn" />

            {/* Fog for depth */}
            <fog attach="fog" args={["#020d06", 15, 50]} />

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
              makeDefault={false}
            />
          </ScrollControls>
        </Suspense>
      </Canvas>
  );
}
