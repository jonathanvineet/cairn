"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

// ThermalPostProcess — Stripped down: removed ChromaticAberration, reduced Bloom levels 8→4,
// raised luminance threshold. Much cheaper on GPU per frame.
export function ThermalPostProcess() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.4}
        intensity={1.2}
        levels={4}
        mipmapBlur
      />
      <Vignette darkness={0.35} />
    </EffectComposer>
  );
}
