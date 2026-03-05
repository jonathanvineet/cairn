"use client";

import * as THREE from "three";

// SkyDome — Optimized: static (no rotation), 16×16 sphere (was 32×32), shader unchanged
export function SkyDome() {
  return (
    <mesh scale={[800, 800, 800]}>
      <sphereGeometry args={[1, 16, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          float rand(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
          }
          void main() {
            vec3 bg = vec3(0.02, 0.03, 0.06);
            float stars = step(0.998, rand(vUv * 500.0));
            float aurora = smoothstep(0.3, 0.7, vUv.y) * 0.1;
            vec3 color = bg + vec3(0.45, 0.35, 0.53) * aurora + vec3(1.0) * stars * 0.8;
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}
