"use client";

import { useEffect, useRef } from "react";
import { useFrame, extend } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import * as THREE from "three";
import { useWorldStore } from "@/stores/worldStore";

// Extend to register ShaderPass
extend({ ShaderPass });

export function ThermalPostProcess() {
  const thermalMode = useWorldStore((state) => state.thermalMode);
  const setThermalMode = useWorldStore((state) => state.setThermalMode);
  const thermalMixRef = useRef(0);
  
  // Spacebar toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setThermalMode(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setThermalMode(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [setThermalMode]);
  
  useFrame((state, delta) => {
    // Lerp thermal mix
    const target = thermalMode ? 1 : 0;
    thermalMixRef.current = THREE.MathUtils.lerp(thermalMixRef.current, target, delta * 2.5);
  });
  
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.2}
        intensity={1.8}
        levels={8}
        mipmapBlur
      />
      <ChromaticAberration offset={[0.0005, 0.0005] as [number, number]} />
      <Vignette darkness={0.4} />
      
      {/* Custom thermal shader would go here as a custom effect */}
      {/* For now, we'll use post-processing effects to approximate thermal vision */}
    </EffectComposer>
  );
}
