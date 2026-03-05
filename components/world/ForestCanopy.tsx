"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ForestCanopyProps {
  count?: number;
}

export function ForestCanopy({ count = 8000 }: ForestCanopyProps) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);
  const treeDataRef = useRef<{ seed: number; scale: number; rotY: number; color: THREE.Color }[]>([]);
  
  // Generate tree positions and properties
  const { positions } = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const colors: Float32Array = new Float32Array(count * 3);
    const treeData: { seed: number; scale: number; rotY: number; color: THREE.Color }[] = [];
    
    // Color palette
    const forestDark = new THREE.Color(0x0d2210);
    const forestGlow = new THREE.Color(0x2d5a22);
    
    for (let i = 0; i < count; i++) {
      // Distribute across 800x800 grid, avoid center 80x80 clearing
      let x, z;
      do {
        x = (Math.random() - 0.5) * 800;
        z = (Math.random() - 0.5) * 800;
      } while (Math.abs(x) < 40 && Math.abs(z) < 40);
      
      const y = 0;
      positions.push(new THREE.Vector3(x, y, z));
      
      // Random tree properties
      const scale = 0.6 + Math.random() * 1.2; // 0.6 - 1.8
      const rotY = Math.random() * Math.PI * 2;
      const color = new THREE.Color().lerpColors(forestDark, forestGlow, Math.random());
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      treeData.push({ seed: i, scale, rotY, color });
    }
    
    treeDataRef.current = treeData;
    
    return { positions, colors };
  }, [count]);
  
  // Set up instances
  useMemo(() => {
    if (!instancedMeshRef.current) return;
    
    const dummy = new THREE.Object3D();
    positions.forEach((pos, i) => {
      const data = treeDataRef.current[i];
      dummy.position.copy(pos);
      dummy.scale.set(data.scale, data.scale, data.scale);
      dummy.rotation.y = data.rotY;
      dummy.updateMatrix();
      instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
      instancedMeshRef.current.setColorAt(i, data.color);
    });
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    if (instancedMeshRef.current.instanceColor) {
      instancedMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [positions]);
  
  // Sway animation
  useFrame(({ clock }) => {
    if (!instancedMeshRef.current) return;
    
    const time = clock.getElapsedTime();
    const dummy = new THREE.Object3D();
    
    positions.forEach((pos, i) => {
      const data = treeDataRef.current[i];
      const sway = Math.sin(time * 0.4 + data.seed * 0.1) * 0.015;
      
      dummy.position.copy(pos);
      dummy.scale.set(data.scale, data.scale, data.scale);
      dummy.rotation.set(0, data.rotY, sway);
      dummy.updateMatrix();
      
      instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
    });
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      {/* Cone tree - simplified geometry */}
      <coneGeometry args={[2.5, 18, 6]} />
      <meshStandardMaterial vertexColors />
    </instancedMesh>
  );
}
