precision mediump float;
varying vec2 vUv;
varying vec3 vNormal;

uniform vec3 uColor;

void main() {
  // Fake lighting: brighter where the normal faces "up"
  float light = dot(normalize(vNormal), normalize(vec3(0.4, 0.8, 0.5))) * 0.5 + 0.5;
  gl_FragColor = vec4(uColor * light, 1.0);
}
