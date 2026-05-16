precision mediump float;
varying vec2 vUv;

uniform float uTiles;
uniform vec3  uColorA;
uniform vec3  uColorB;

void main() {
  // In real shaders this whole function would be one line:
  //   vec3 col = texture2D(uTexture, vUv).rgb;
  //
  // Here we synthesize a procedural checker from vUv so you can see
  // exactly how UVs map to a surface pattern — same idea, no image needed.
  vec2 cell = floor(vUv * uTiles);
  float mask = mod(cell.x + cell.y, 2.0);
  vec3 col = mix(uColorA, uColorB, mask);

  // Highlight cells nearer the corners to give a "UV test pattern" feel
  vec2 f = fract(vUv * uTiles);
  float corner = step(0.85, max(f.x, f.y)) * step(0.85, 1.0 - min(f.x, f.y));
  col = mix(col, vec3(1.0, 0.8, 0.2), corner * 0.7);

  gl_FragColor = vec4(col, 1.0);
}
