"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useScrollVelocity } from "@/hooks/useScrollVelocity";
import { useWorldStore } from "@/stores/worldStore";

export function ForwardFlightCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const { set } = useThree();
  const scrollSpeed = useScrollVelocity();
  const updateCamera = useWorldStore((state) => state.updateCamera);
  const hasDropped = useRef(false);
  
  // Initial orbital drop animation
  useEffect(() => {
    if (!cameraRef.current || hasDropped.current) return;
    
    hasDropped.current = true;
    
    // Set initial position
    cameraRef.current.position.set(0, 85, 0);
    cameraRef.current.lookAt(0, 0, 0);
    
    // GSAP drop animation
    gsap.to(cameraRef.current.position, {
      y: 22,
      z: 50,
      duration: 3,
      ease: "expo.out",
      onUpdate: () => {
        if (cameraRef.current) {
          cameraRef.current.lookAt(0, 15, 0);
        }
      },
    });
  }, []);
  
  // Make this camera the active camera
  useEffect(() => {
    if (cameraRef.current) {
      set({ camera: cameraRef.current });
      cameraRef.current.lookAt(0, 15, 0);
    }
  }, [set]);
  
  useFrame((state, delta) => {
    if (!cameraRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Forward flight based on scroll
    if (scrollSpeed > 0.01) {
      cameraRef.current.position.z -= scrollSpeed * 0.8 * delta * 60;
      
      // Dive at speed
      const targetY = 22 - scrollSpeed * 8;
      cameraRef.current.position.y = THREE.MathUtils.lerp(
        cameraRef.current.position.y,
        targetY,
        0.05
      );
      
      // Fast scroll turbulence
      if (scrollSpeed > 0.7) {
        const turbulence = Math.sin(time * 40) * 0.3 * scrollSpeed;
        cameraRef.current.rotation.z = turbulence;
      } else {
        cameraRef.current.rotation.z = THREE.MathUtils.lerp(cameraRef.current.rotation.z, 0, 0.1);
      }
    }
    
    // Height clamp
    cameraRef.current.position.y = THREE.MathUtils.clamp(cameraRef.current.position.y, 8, 120);
    
    // Update store
    updateCamera({
      position: cameraRef.current.position.toArray() as [number, number, number],
      rotation: [cameraRef.current.rotation.x, cameraRef.current.rotation.y, cameraRef.current.rotation.z],
      velocity: scrollSpeed,
      altitude: cameraRef.current.position.y,
      heading: (cameraRef.current.rotation.y * 180) / Math.PI,
    });
  });
  
  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={75}
      near={0.1}
      far={1000}
      position={[0, 85, 0]}
    />
  );
}
