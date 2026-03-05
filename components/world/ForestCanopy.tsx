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

  // No more CPU-side animations in useFrame!
  // We'll use a custom shader for the sway to keep it at 60fps with 0 CPU cost
  const shaderArgs = useMemo(() => ({
    uniforms: {
      time: { value: 0 },
      forestDark: { value: new THREE.Color(0x0d2210) },
      forestGlow: { value: new THREE.Color(0x2d5a22) },
    },
    vertexShader: `
      attribute vec3 instanceColor;
      varying vec3 vColor;
      uniform float time;
      
      void main() {
        vColor = instanceColor;
        
        // Use instance position for unique seeding
        vec4 instancePos = instanceMatrix * vec4(0, 0, 0, 1);
        float seed = instancePos.x + instancePos.z;
        
        // Subtle sway based on height and time
        float sway = sin(time * 0.4 + seed * 0.1) * 0.05;
        float heightFactor = clamp(position.y / 18.0, 0.0, 1.0);
        
        vec3 displacedPosition = position;
        displacedPosition.x += sway * heightFactor;
        displacedPosition.z += sway * heightFactor;
        
        vec4 worldPosition = instanceMatrix * vec4(displacedPosition, 1.0);
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        gl_FragColor = vec4(vColor, 1.0);
      }
    `
  }), []);

  useFrame(({ clock }) => {
    if (instancedMeshRef.current) {
      (instancedMeshRef.current.material as THREE.ShaderMaterial).uniforms.time.value = clock.getElapsedTime();
    }
  });

  return (
    <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, count]} castShadow={false} receiveShadow={false}>
      <coneGeometry args={[2.5, 18, 4]} />
      <shaderMaterial attach="material" {...shaderArgs} />
    </instancedMesh>
  );
}
