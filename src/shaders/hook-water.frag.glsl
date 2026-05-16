precision mediump float;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vWave;

void main() {
  vec3 deep    = vec3(0.01, 0.06, 0.16);
  vec3 shallow = vec3(0.08, 0.42, 0.62);
  vec3 sky     = vec3(0.55, 0.82, 1.00);

  // Deeper troughs are darker, peaks lighter
  vec3 base = mix(deep, shallow, smoothstep(-0.08, 0.10, vWave));

  // Fresnel: more reflective at glancing angles, like real water
  float fresnel = pow(1.0 - max(0.0, dot(normalize(vNormal), normalize(vViewDir))), 3.5);
  base = mix(base, sky, fresnel * 0.65);

  // Specular highlight where the surface faces the "sun"
  vec3 sun = normalize(vec3(0.5, 0.8, 0.4));
  float spec = pow(max(0.0, dot(reflect(-sun, vNormal), vViewDir)), 64.0);
  base += vec3(1.0, 0.95, 0.85) * spec * 0.6;

  // Faint foam at the highest wave crests
  float foam = smoothstep(0.09, 0.13, vWave);
  base += vec3(foam) * 0.25;

  gl_FragColor = vec4(base, 1.0);
}
