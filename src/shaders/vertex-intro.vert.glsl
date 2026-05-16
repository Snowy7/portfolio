varying vec2 vUv;
varying vec3 vNormal;

uniform float uTime;
uniform float uAmp;
uniform float uFreq;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);

  // Push each vertex outward along its normal by a sine wave that varies
  // across the sphere — gives a flowing, organic pulse rather than a
  // uniform inflate. Try: replace position.y with position.x + position.z.
  float wave = sin(position.y * uFreq + uTime * 1.5);
  vec3 displaced = position + normal * wave * uAmp;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
