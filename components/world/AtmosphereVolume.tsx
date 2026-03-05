"use client";

export function AtmosphereVolume() {
  return (
    <>
      {/* Fog */}
      <fog attach="fog" args={["#050810", 30, 600]} />
      
      {/* God rays effect - ambient light */}
      <ambientLight intensity={0.15} color="#16213e" />
      
      {/* Directional light for atmosphere */}
      <directionalLight
        position={[100, 200, 100]}
        intensity={0.8}
        color="#2d5a22"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={1000}
        shadow-camera-left={-400}
        shadow-camera-right={400}
        shadow-camera-top={400}
        shadow-camera-bottom={-400}
      />
      
      {/* Atmospheric backlight */}
      <pointLight position={[0, 150, -200]} intensity={2} distance={800} color="#0a1628" />
    </>
  );
}
