precision mediump float;
varying vec3 vNormal;

void main() {
  // Visualize the surface normal as RGB color.
  // Each face of the cube points a different direction → different color.
  vec3 col = vNormal * 0.5 + 0.5;
  gl_FragColor = vec4(col, 1.0);
}
