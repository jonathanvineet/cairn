"use client";

import { useMemo } from "react";
import * as THREE from "three";

export function GroundMesh() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1000, 1000, 200, 200);
    geo.rotateX(-Math.PI / 2);
    
    // Add procedural height variation
    const positions = geo.attributes.position.array as Float32Array;
    const seed = 12345;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      
      // Simple noise approximation
      const noise = Math.sin(x * 0.02 + seed) * Math.cos(z * 0.02 + seed) * 2;
      positions[i + 1] = noise - 1; // Y position, slightly below 0
    }
    
    geo.computeVertexNormals();
    return geo;
  }, []);
  
  return (
    <mesh geometry={geometry} receiveShadow position={[0, -1, 0]}>
      <meshStandardMaterial
        color="#0d2210"
        roughness={0.95}
        metalness={0.1}
      />
    </mesh>
  );
}
