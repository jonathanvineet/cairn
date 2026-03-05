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

  // Smooth camera values - initialized to 50 to match end of drop animation
  const targetZ = useRef(50);
  const currentZ = useRef(50);

  // Initial orbital drop animation
  useEffect(() => {
    if (!cameraRef.current || hasDropped.current) return;

    hasDropped.current = true;

    // Set initial position (High above)
    cameraRef.current.position.set(0, 85, 0);
    cameraRef.current.lookAt(0, 0, 0);

    // GSAP drop animation to operational altitude and position
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
      onComplete: () => {
        // Sync our smooth refs with the final position
        targetZ.current = 50;
        currentZ.current = 50;
      }
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

    // Flight logic using signed scroll velocity
    // If scrollSpeed is positive (down), move forward. Negative (up), move backward.
    targetZ.current -= scrollSpeed * 2.5 * delta * 60;

    // Lerp current Z to target Z for buttery smooth movement
    currentZ.current = THREE.MathUtils.lerp(currentZ.current, targetZ.current, 0.08);
    cameraRef.current.position.z = currentZ.current;

    // Dive/Ascend based on speed
    const targetY = 22 - Math.abs(scrollSpeed) * 4;
    cameraRef.current.position.y = THREE.MathUtils.lerp(
      cameraRef.current.position.y,
      targetY,
      0.05
    );

    // Turbulence and banking
    if (Math.abs(scrollSpeed) > 0.01) {
      // Bank relative to velocity
      const targetRoll = -scrollSpeed * 0.05;
      cameraRef.current.rotation.z = THREE.MathUtils.lerp(cameraRef.current.rotation.z, targetRoll, 0.05);

      // High speed turbulence
      if (Math.abs(scrollSpeed) > 0.7) {
        const turbulence = Math.sin(time * 60) * 0.02 * scrollSpeed;
        cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, turbulence, 0.1);
      }
    } else {
      cameraRef.current.rotation.z = THREE.MathUtils.lerp(cameraRef.current.rotation.z, 0, 0.05);
    }

    // Stabilized look ahead - look at a point relative to current Z to avoid jitter
    // We look slightly lower as we speed up
    const lookAtY = THREE.MathUtils.lerp(15, 12, Math.abs(scrollSpeed));
    const lookTarget = new THREE.Vector3(0, lookAtY, cameraRef.current.position.z - 60);
    cameraRef.current.lookAt(lookTarget);

    // Height clamp for safety
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
