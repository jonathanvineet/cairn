// Thermal vision post-processing shader
uniform sampler2D tDiffuse;
uniform float uThermalMix;
uniform vec2 resolution;
uniform float time;

varying vec2 vUv;

// Heat map color gradient
vec3 heatMap(float t) {
  // Black -> Purple -> Red -> Orange -> Yellow -> White
  vec3 c1 = vec3(0.0, 0.0, 0.0);       // Black
  vec3 c2 = vec3(0.45, 0.11, 0.69);    // Purple
  vec3 c3 = vec3(0.91, 0.27, 0.38);    // Red
  vec3 c4 = vec3(1.0, 0.49, 0.0);      // Orange
  vec3 c5 = vec3(1.0, 0.96, 0.0);      // Yellow
  vec3 c6 = vec3(1.0, 1.0, 1.0);       // White
  
  if (t < 0.2) return mix(c1, c2, t / 0.2);
  if (t < 0.4) return mix(c2, c3, (t - 0.2) / 0.2);
  if (t < 0.6) return mix(c3, c4, (t - 0.4) / 0.2);
  if (t < 0.8) return mix(c4, c5, (t - 0.6) / 0.2);
  return mix(c5, c6, (t - 0.8) / 0.2);
}

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  
  // Calculate luminance
  float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  
  // Apply heat map
  vec3 thermal = heatMap(luma);
  
  // Scanlines
  float scanline = sin(vUv.y * resolution.y * 2.0) * 0.5 + 0.5;
  scanline = scanline * 0.05 + 0.95;
  thermal *= scanline;
  
  // Horizontal sweep
  float sweep = fract(time * 0.3);
  float sweepLine = smoothstep(0.98, 1.0, 1.0 - abs(vUv.y - sweep));
  thermal += vec3(0.0, 1.0, 1.0) * sweepLine * 0.3;
  
  // Mix with original
  vec3 finalColor = mix(color.rgb, thermal, uThermalMix);
  
  gl_FragColor = vec4(finalColor, color.a);
}
