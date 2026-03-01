"use client";

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";

/**
 * Performance optimizer that adjusts quality based on frame rate
 * Inspired by Fizzi's useGLOptimizer pattern
 */
export function PerformanceOptimizer() {
  const { gl, scene } = useThree();

  useEffect(() => {
    // Set power preference
    if (gl.getContext) {
      const ctx = gl.getContext();
      if (ctx && 'powerPreference' in ctx) {
        // Already set in Canvas config
      }
    }

    // Optimize shadows
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = 1; // PCFShadowMap (PCFSoftShadowMap is deprecated)
    gl.shadowMap.autoUpdate = false; // Manual updates for static shadows
    gl.shadowMap.needsUpdate = true;

    // Set pixel ratio adaptively
    const dpr = Math.min(window.devicePixelRatio, 2);
    gl.setPixelRatio(dpr * 0.8); // 80% of device pixel ratio for performance

    return () => {
      // Cleanup
      scene.traverse((object: any) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat: any) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [gl, scene]);

  return (
    <PerformanceMonitor
      onIncline={() => {
        // Performance is good, can increase quality
        const dpr = Math.min(window.devicePixelRatio, 2);
        gl.setPixelRatio(dpr);
      }}
      onDecline={() => {
        // Performance is bad, reduce quality
        gl.setPixelRatio(0.8);
      }}
    />
  );
}
