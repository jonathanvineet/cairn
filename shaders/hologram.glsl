// Hologram panel shader with scanlines and flicker
uniform float time;
uniform vec3 baseColor;
uniform float opacity;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;

// Noise function for flicker
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  // Scanlines
  float scanline = step(0.05, fract(vUv.y * 40.0 - time * 2.0));
  
  // Fresnel edge glow
  float fresnel = pow(1.0 - dot(normalize(vNormal), normalize(vViewDir)), 2.5);
  
  // Flicker noise
  float flicker = random(vec2(time * 0.1, vUv.y)) * 0.15 + 0.85;
  
  // Combine effects
  vec3 color = baseColor * scanline * flicker;
  color += fresnel * vec3(0.0, 0.96, 1.0) * 0.8;
  
  float finalOpacity = opacity * flicker;
  
  gl_FragColor = vec4(color, finalOpacity);
}
