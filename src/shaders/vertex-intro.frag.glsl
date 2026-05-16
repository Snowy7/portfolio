precision mediump float;
varying vec3 vNormal;

uniform vec3 uColor;

void main() {
  // Cheap directional lighting — brighter where the surface faces the light
  vec3 light = normalize(vec3(0.4, 0.8, 0.5));
  float d = max(0.0, dot(vNormal, light)) * 0.75 + 0.25;
  gl_FragColor = vec4(uColor * d, 1.0);
}
