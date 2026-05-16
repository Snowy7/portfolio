precision mediump float;
varying vec3 vNormal;
varying vec3 vViewDir;
uniform float uTime;

void main() {
  // Slowly orbiting light
  vec3 lightDir = normalize(vec3(sin(uTime * 0.6) * 0.8, 0.6, cos(uTime * 0.6) * 0.8));

  float d = dot(normalize(vNormal), lightDir);

  // Quantize into discrete bands (the toon shading look)
  float band = step(0.15, d) * 0.30
             + step(0.45, d) * 0.35
             + step(0.78, d) * 0.35;

  vec3 base = vec3(0.13, 0.77, 0.37);

  // Rim light on silhouette
  float rim = pow(1.0 - max(0.0, dot(vNormal, vViewDir)), 3.5);
  vec3 col = base * (0.2 + band) + vec3(0.6, 1.0, 0.7) * rim * 0.55;

  gl_FragColor = vec4(col, 1.0);
}
