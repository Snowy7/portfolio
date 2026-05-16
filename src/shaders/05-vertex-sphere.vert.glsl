varying vec2 vUv;
varying vec3 vNormal;

uniform float uTime;
uniform float uAmp;
uniform float uFreq;
uniform float uSpeed;

void main() {
  vUv = uv;
  vNormal = normal;

  // Push every vertex along its normal by a sine wave.
  // Result: a sphere that breathes.
  float wave = sin(position.y * uFreq + uTime * uSpeed)
             + sin(position.x * uFreq + uTime * uSpeed * 0.7);
  vec3 displaced = position + normal * wave * uAmp;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
