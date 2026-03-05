"use client";

import { useMemo } from "react";
import * as THREE from "three";

export function GroundMesh() {
  const geometry = useMemo(() => {
    // Reduced from 200x200 to 40x40 — 25x fewer vertices
    const geo = new THREE.PlaneGeometry(1000, 1000, 40, 40);
    geo.rotateX(-Math.PI / 2);

    // Simple height variation
    const positions = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      positions[i + 1] = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 2 - 1;
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow={false} position={[0, -1, 0]}>
      <meshBasicMaterial color="#0d2210" />
    </mesh>
  );
}
