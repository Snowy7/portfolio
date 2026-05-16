precision mediump float;
varying vec2 vUv;

uniform float uThreshold;
uniform float uScale;
uniform vec3  uEdge;
uniform vec3  uBase;

// ── Value noise + FBM ────────────────────────────────────────────────
// hash() turns a 2D coord into a deterministic pseudo-random number.
// noise() smoothly interpolates between four hash samples.
// fbm() sums multiple octaves of noise — this is the "trick" that makes
// noise look organic rather than blocky. Try changing the iteration count.
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
  float n = fbm(vUv * uScale);

  // Below threshold → kill the pixel. Just above → glowing edge.
  if (n < uThreshold - 0.05) discard;

  float edge = smoothstep(uThreshold + 0.06, uThreshold - 0.04, n);
  vec3  color = mix(uBase, uEdge, edge);

  gl_FragColor = vec4(color, 1.0);
}
