"use client";

export function AtmosphereVolume() {
  return (
    <>
      {/* Fog - bring it closer to reduce fill rate */}
      <fog attach="fog" args={["#050810", 50, 400]} />

      {/* Ambient light only */}
      <ambientLight intensity={0.2} color="#16213e" />

      {/* Single directional light, no shadows */}
      <directionalLight
        position={[100, 200, 100]}
        intensity={0.6}
        color="#2d5a22"
        castShadow={false}
      />
    </>
  );
}
