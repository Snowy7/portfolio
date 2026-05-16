precision mediump float;

void main() {
  // Try changing these numbers between 0.0 and 1.0
  vec3 color = vec3(0.1, 0.9, 0.5);
  gl_FragColor = vec4(color, 1.0);
}
