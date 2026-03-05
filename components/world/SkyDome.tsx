"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function SkyDome() {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  // Rotate slowly for aurora effect
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.01;
    }
  });
  
  return (
    <mesh ref={meshRef} scale={[800, 800, 800]}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        side={THREE.BackSide}
        transparent
        vertexShader={`
          varying vec3 vPosition;
          varying vec2 vUv;
          
          void main() {
            vPosition = position;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          varying vec3 vPosition;
          varying vec2 vUv;
          
          // Starfield
          float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
          }
          
          void main() {
            vec3 voidColor = vec3(0.02, 0.03, 0.06); // #050810
            vec3 auroraColor = vec3(0.45, 0.35, 0.53); // Purple aurora
            
            // Starfield
            float stars = step(0.998, random(vUv * 500.0));
            vec3 starColor = vec3(1.0) * stars * 0.8;
            
            // Aurora gradient
            float auroraStrength = smoothstep(0.3, 0.7, vUv.y) * 0.15;
            vec3 aurora = auroraColor * auroraStrength;
            
            vec3 color = voidColor + aurora + starColor;
            
            gl_FragColor = vec4(color, 1.0);
          }
        `}
        uniforms={{
          time: { value: 0 },
        }}
      />
    </mesh>
  );
}
