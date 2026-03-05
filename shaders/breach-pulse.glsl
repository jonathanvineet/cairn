// Breach sphere pulsing shader
uniform float time;
uniform vec3 breachColor;
uniform vec3 glowColor;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vPosition;

void main() {
  // Fresnel for corona effect
  float fresnel = pow(1.0 - dot(normalize(vNormal), normalize(vViewDir)), 3.0);
  
  // Pulsing intensity
  float pulse = sin(time * 3.0) * 0.4 + 0.6;
  
  // Radial gradient from center
  float dist = length(vPosition);
  float radialGlow = 1.0 - smoothstep(0.8, 1.2, dist);
  
  // Combine effects
  vec3 color = mix(breachColor, glowColor, fresnel * pulse);
  color += glowColor * radialGlow * pulse;
  
  gl_FragColor = vec4(color, 1.0);
}
