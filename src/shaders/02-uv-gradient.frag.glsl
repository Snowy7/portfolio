precision mediump float;
varying vec2 vUv;

void main() {
  // vUv.x grows left -> right, vUv.y grows bottom -> top
  gl_FragColor = vec4(vUv.x, vUv.y, 0.5, 1.0);
}
