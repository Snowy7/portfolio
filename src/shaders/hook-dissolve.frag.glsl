precision mediump float;

varying vec2 vUv;
varying vec3 vNormal;

uniform float uTime;

// ── Value noise + FBM ────────────────────────────────────────────────
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  // Layered noise gives a soft, organic dissolve pattern
  float n = fbm(vUv * 4.5);

  // Threshold sweeps slowly so the object reforms and dissolves on a loop
  float t = sin(uTime * 0.7) * 0.45 + 0.5;

  if (n < t - 0.08) discard;

  // Bright glowing edge between solid and discarded
  float edge = smoothstep(t + 0.08, t - 0.04, n);

  // Rich purple→blue body, white-hot edge
  vec3 body = mix(vec3(0.55, 0.10, 0.50), vec3(0.10, 0.32, 0.85), vUv.y);
  vec3 glow = vec3(1.0, 0.85, 0.4);
  vec3 col  = mix(body, glow, edge);

  gl_FragColor = vec4(col, 1.0);
}
