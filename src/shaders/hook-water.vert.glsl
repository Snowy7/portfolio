varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vWave;

uniform float uTime;

float wave(vec2 p, float t) {
  float w = sin(p.x * 3.2 + t * 1.1) * 0.07;
  w += sin(p.y * 2.6 - t * 0.9) * 0.05;
  w += sin((p.x + p.y) * 4.4 + t * 1.5) * 0.03;
  return w;
}

void main() {
  vUv = uv;

  // Sample the wave at this vertex and two nearby points so we can derive
  // a proper surface normal from finite differences.
  float h  = wave(position.xy, uTime);
  float hx = wave(position.xy + vec2(0.02, 0.0), uTime);
  float hy = wave(position.xy + vec2(0.0, 0.02), uTime);

  vWave = h;
  vec3 displaced = position + vec3(0.0, 0.0, h);

  // Normal from gradient of the height field
  vec3 ddx = vec3(0.02, 0.0, hx - h);
  vec3 ddy = vec3(0.0, 0.02, hy - h);
  vec3 n   = normalize(cross(ddx, ddy));
  vNormal  = normalize(normalMatrix * n);

  vec4 mvPos = modelViewMatrix * vec4(displaced, 1.0);
  vViewDir   = normalize(-mvPos.xyz);

  gl_Position = projectionMatrix * mvPos;
}
