// Fresnel shader for drone hull and glowing edges
uniform float time;
uniform vec3 baseColor;
uniform vec3 glowColor;
uniform float glowIntensity;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;

void main() {
  // Fresnel calculation
  float fresnel = pow(1.0 - dot(normalize(vNormal), normalize(vViewDir)), 3.0);
  
  // Pulsing glow
  float pulse = sin(time * 2.0) * 0.2 + 0.8;
  
  // Mix base color with glow based on fresnel
  vec3 color = mix(baseColor, glowColor, fresnel * glowIntensity * pulse);
  
  gl_FragColor = vec4(color, 1.0);
}
