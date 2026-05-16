precision mediump float;
varying vec2 vUv;

uniform float uTime;
uniform float uSpeed;
uniform float uFreq;
uniform vec3  uColorA;
uniform vec3  uColorB;

void main() {
  // sin gives -1..1, *0.5+0.5 remaps to 0..1
  float wave = sin(vUv.x * uFreq + uTime * uSpeed) * 0.5 + 0.5;

  vec3 color = mix(uColorA, uColorB, wave);
  gl_FragColor = vec4(color, 1.0);
}
