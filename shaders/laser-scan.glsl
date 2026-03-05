// Laser scan beam shader
uniform float time;
uniform float scanProgress;
uniform vec3 laserColor;

varying vec2 vUv;

void main() {
  // Moving scan line
  float scanPos = scanProgress;
  float scanWidth = 0.2;
  
  // Distance from scan position
  float dist = abs(vUv.x - scanPos);
  float intensity = 1.0 - smoothstep(0.0, scanWidth, dist);
  
  // Core beam with glow
  float core = step(dist, 0.02);
  float glow = smoothstep(scanWidth, 0.0, dist) * 0.6;
  
  // Combine
  float alpha = core + glow;
  vec3 color = laserColor * (core + glow * 0.5);
  
  // Add UV scroll for energy effect
  float uvScroll = fract(vUv.x * 10.0 - time * 8.0);
  color += laserColor * uvScroll * 0.2 * alpha;
  
  gl_FragColor = vec4(color, alpha);
}
