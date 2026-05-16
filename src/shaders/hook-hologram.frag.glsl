precision mediump float;

varying vec2 vUv;
varying vec3 vNormal;

uniform float uTime;

void main() {
  vec2 uv = vUv;

  // Per-face vertical gradient (teal → cyan)
  vec3 base = mix(vec3(0.0, 0.40, 0.65), vec3(0.0, 0.85, 1.0), uv.y);

  // Scrolling scanlines
  float scan = sin(uv.y * 180.0 - uTime * 5.5) * 0.5 + 0.5;
  scan = mix(0.55, 1.0, scan);

  // Fresnel-like edge glow using view-space normal vs. forward direction
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  float fresnel = pow(1.0 - max(0.0, dot(normalize(vNormal), viewDir)), 2.2);

  vec3 col = base * scan;
  col += vec3(0.45, 0.95, 1.0) * fresnel * 0.85;

  // Occasional horizontal glitch bar
  float bar = step(0.97, sin(uv.y * 28.0 + uTime * 6.0) * 0.5 + 0.5);
  col += vec3(0.1, 0.4, 0.55) * bar;

  // Subtle flicker
  col *= 0.88 + sin(uTime * 30.0) * 0.06;

  gl_FragColor = vec4(col, 1.0);
}
