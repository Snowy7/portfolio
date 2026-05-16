<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from "vue";
import * as THREE from "three";
import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { cpp } from "@codemirror/lang-cpp";
import { syntaxHighlighting, HighlightStyle, bracketMatching, indentOnInput, indentUnit } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

type UniformType = "float" | "color" | "vec2";
interface UniformSpec {
  name: string;
  type: UniformType;
  value: number | string | [number, number];
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

const props = withDefaults(
  defineProps<{
    title?: string;
    mode?: "fullscreen" | "sphere" | "plane" | "cube" | "water";
    fragment: string;
    vertex?: string;
    uniforms?: UniformSpec[];
    height?: number;
    showVertex?: boolean;
    canvasOnly?: boolean;  // showcase mode: hide editor + chrome buttons, just canvas
    autoRotate?: boolean;  // auto-rotate 3D meshes (cube/sphere). Defaults true.
  }>(),
  {
    mode: "fullscreen",
    height: 320,
    showVertex: false,
    canvasOnly: false,
    autoRotate: true,
    uniforms: () => [],
  }
);

const DEFAULT_VERTEX_FULLSCREEN = `varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}`;

const DEFAULT_VERTEX_MESH = `varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vUv = uv;
  // view-space normal so lighting in the fragment shader is consistent
  // with the rotating mesh
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const initialFragment = props.fragment.replace(/\s+$/, "");
const initialVertex = (props.vertex ?? (props.mode === "fullscreen" ? DEFAULT_VERTEX_FULLSCREEN : DEFAULT_VERTEX_MESH)).replace(/\s+$/, "");

const rootEl = ref<HTMLDivElement | null>(null);
const canvasEl = ref<HTMLCanvasElement | null>(null);
const fragEditorEl = ref<HTMLDivElement | null>(null);
const vertEditorEl = ref<HTMLDivElement | null>(null);
const activeTab = ref<"fragment" | "vertex">("fragment");
const errorMsg = ref<string>("");
const isPaused = ref(false);
const isFullscreen = ref(false);
const copied = ref(false);
const fps = ref(0);
const canvasW = ref(0);
const canvasH = ref(0);
const status = ref<"ok" | "compiling" | "error">("ok");
const justCompiled = ref(false);

const uniformValues = ref<Record<string, number | string | [number, number]>>(
  Object.fromEntries(props.uniforms.map((u) => [u.name, structuredClone(u.value)]))
);

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.Camera | null = null;
let mesh: THREE.Mesh | null = null;
let material: THREE.ShaderMaterial | null = null;
let rafId = 0;
let startTime = performance.now();
let fragView: EditorView | null = null;
let vertView: EditorView | null = null;
let compileTimer: ReturnType<typeof setTimeout> | null = null;

const editorTheme = EditorView.theme(
  {
    "&": {
      color: "#c5c5c5",
      backgroundColor: "transparent",
      fontSize: "12px",
      height: "100%",
    },
    ".cm-scroller": {
      fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
      lineHeight: "1.55",
      overflow: "auto",
    },
    ".cm-content": { caretColor: "#22c55e", padding: "10px 0" },
    ".cm-gutters": {
      backgroundColor: "#070707",
      color: "#333",
      border: "none",
      borderRight: "1px solid #1a1a1a",
    },
    ".cm-lineNumbers .cm-gutterElement": { padding: "0 10px 0 8px", minWidth: "28px" },
    ".cm-activeLine": { backgroundColor: "rgba(34, 197, 94, 0.04)" },
    ".cm-activeLineGutter": { backgroundColor: "rgba(34, 197, 94, 0.06)", color: "#22c55e" },
    "&.cm-focused": { outline: "none" },
    ".cm-cursor": { borderLeftColor: "#22c55e", borderLeftWidth: "2px" },
    ".cm-matchingBracket": { backgroundColor: "rgba(34, 197, 94, 0.15)", outline: "1px solid rgba(34,197,94,0.4)" },
    ".cm-selectionBackground": { backgroundColor: "rgba(34, 197, 94, 0.18) !important" },
  },
  { dark: true }
);

const glslHighlight = HighlightStyle.define([
  { tag: t.keyword, color: "#22c55e" },
  { tag: t.controlKeyword, color: "#22c55e" },
  { tag: t.typeName, color: "#7dd3fc" },
  { tag: t.number, color: "#fbbf24" },
  { tag: t.string, color: "#fbbf24" },
  { tag: t.comment, color: "#555", fontStyle: "italic" },
  { tag: t.function(t.variableName), color: "#e879f9" },
  { tag: t.variableName, color: "#c5c5c5" },
  { tag: t.operator, color: "#999" },
  { tag: t.bracket, color: "#666" },
  { tag: t.punctuation, color: "#666" },
]);

function buildEditor(host: HTMLDivElement, initial: string, onChange: (v: string) => void): EditorView {
  return new EditorView({
    parent: host,
    state: EditorState.create({
      doc: initial,
      extensions: [
        lineNumbers(),
        history(),
        bracketMatching(),
        indentOnInput(),
        indentUnit.of("  "),
        highlightActiveLine(),
        cpp(),
        syntaxHighlighting(glslHighlight),
        keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
        editorTheme,
        EditorView.updateListener.of((v) => {
          if (v.docChanged) onChange(v.state.doc.toString());
        }),
      ],
    }),
  });
}

function buildUniformsObject() {
  const obj: Record<string, { value: any }> = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
  };
  for (const spec of props.uniforms) {
    const raw = uniformValues.value[spec.name];
    if (spec.type === "color") {
      obj[spec.name] = { value: new THREE.Color(raw as string) };
    } else if (spec.type === "vec2") {
      const v = raw as [number, number];
      obj[spec.name] = { value: new THREE.Vector2(v[0], v[1]) };
    } else {
      obj[spec.name] = { value: raw as number };
    }
  }
  return obj;
}

function applyUniformValue(spec: UniformSpec) {
  if (!material) return;
  const u = material.uniforms[spec.name];
  if (!u) return;
  const raw = uniformValues.value[spec.name];
  if (spec.type === "color") {
    (u.value as THREE.Color).set(raw as string);
  } else if (spec.type === "vec2") {
    const v = raw as [number, number];
    (u.value as THREE.Vector2).set(v[0], v[1]);
  } else {
    u.value = raw as number;
  }
}

function makeMaterial(fragSrc: string, vertSrc: string): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: buildUniformsObject(),
    vertexShader: vertSrc,
    fragmentShader: fragSrc,
    transparent: true,
  });
}

function buildMesh(): THREE.Mesh {
  if (props.mode === "sphere") {
    const geo = new THREE.SphereGeometry(1, 96, 96);
    return new THREE.Mesh(geo, material!);
  }
  if (props.mode === "cube") {
    const geo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    return new THREE.Mesh(geo, material!);
  }
  if (props.mode === "water") {
    // Subdivided plane so vertex shaders can displace the surface smoothly.
    // Rotate it flat (XZ plane) so the camera looks down on it like a sea.
    const geo = new THREE.PlaneGeometry(4, 4, 128, 128);
    const m = new THREE.Mesh(geo, material!);
    m.rotation.x = -Math.PI / 2;
    return m;
  }
  const geo = new THREE.PlaneGeometry(2, 2);
  return new THREE.Mesh(geo, material!);
}

function setupCamera(): THREE.Camera {
  if (props.mode === "cube") {
    const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    cam.position.set(2.4, 1.8, 2.8);
    cam.lookAt(0, 0, 0);
    return cam;
  }
  if (props.mode === "water") {
    const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    cam.position.set(0, 1.3, 2.0);
    cam.lookAt(0, -0.2, 0);
    return cam;
  }
  if (props.mode === "sphere" || props.mode === "plane") {
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    cam.position.set(0, 0, 3);
    return cam;
  }
  return new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
}

function recompile() {
  if (!renderer || !scene || !mesh) return;
  const fragSrc = fragView?.state.doc.toString() ?? initialFragment;
  const vertSrc = vertView?.state.doc.toString() ?? initialVertex;
  errorMsg.value = "";

  const next = makeMaterial(fragSrc, vertSrc);
  const prevMat = material;
  material = next;
  mesh.material = next;
  renderer.compile(scene, camera!);
  if (prevMat) prevMat.dispose();

  if (errorMsg.value) {
    status.value = "error";
  } else {
    status.value = "ok";
    justCompiled.value = true;
    setTimeout(() => (justCompiled.value = false), 400);
  }
}

function scheduleRecompile() {
  if (compileTimer) clearTimeout(compileTimer);
  status.value = "compiling";
  compileTimer = setTimeout(recompile, 220);
}

function reset() {
  if (fragView) {
    fragView.dispatch({
      changes: { from: 0, to: fragView.state.doc.length, insert: initialFragment },
    });
  }
  if (vertView) {
    vertView.dispatch({
      changes: { from: 0, to: vertView.state.doc.length, insert: initialVertex },
    });
  }
  for (const spec of props.uniforms) {
    uniformValues.value[spec.name] = structuredClone(spec.value);
  }
  // Water plane is rotated -π/2 around X to lie flat; preserve that.
  if (mesh && (props.mode === "cube" || props.mode === "sphere")) {
    mesh.rotation.set(0, 0, 0);
  }
  startTime = performance.now();
  recompile();
}

async function copyCode() {
  const src = activeTab.value === "vertex" && vertView
    ? vertView.state.doc.toString()
    : fragView?.state.doc.toString() ?? "";
  try {
    await navigator.clipboard.writeText(src);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1200);
  } catch (e) {
    // Older browsers — silently fail
  }
}

function toggleFullscreen() {
  if (!rootEl.value) return;
  if (!document.fullscreenElement) {
    rootEl.value.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

function onFullscreenChange() {
  isFullscreen.value = document.fullscreenElement === rootEl.value;
  nextTick(resize);
}

function resize() {
  if (!renderer || !canvasEl.value) return;
  const w = canvasEl.value.clientWidth;
  const h = canvasEl.value.clientHeight;
  if (w === 0 || h === 0) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h, false);
  canvasW.value = Math.round(w * dpr);
  canvasH.value = Math.round(h * dpr);
  if (camera && (camera as any).isPerspectiveCamera) {
    (camera as THREE.PerspectiveCamera).aspect = w / h;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }
  if (material?.uniforms.uResolution) {
    (material.uniforms.uResolution.value as THREE.Vector2).set(w * dpr, h * dpr);
  }
}

let fpsAccum = 0;
let fpsFrames = 0;
let fpsLast = performance.now();
let prevTime = performance.now();

function tick() {
  if (!renderer || !scene || !camera) return;
  const now = performance.now();
  const dt = (now - prevTime) / 1000;
  prevTime = now;

  if (!isPaused.value && material?.uniforms.uTime) {
    material.uniforms.uTime.value = (now - startTime) / 1000;
  }

  // Auto-rotate 3D meshes so all faces of the cube/sphere are visible
  if (props.autoRotate && !isPaused.value && mesh && (props.mode === "cube" || props.mode === "sphere")) {
    mesh.rotation.y += dt * 0.35;
    mesh.rotation.x += dt * 0.12;
  }

  renderer.render(scene, camera);

  fpsAccum += now - fpsLast;
  fpsLast = now;
  fpsFrames++;
  if (fpsAccum >= 500) {
    fps.value = Math.round((fpsFrames * 1000) / fpsAccum);
    fpsAccum = 0;
    fpsFrames = 0;
  }
  rafId = requestAnimationFrame(tick);
}

let ro: ResizeObserver | null = null;

onMounted(() => {
  // Only the canvas is mandatory. In canvasOnly showcase mode there's no
  // editor at all, so we must not bail if fragEditorEl is missing.
  if (!canvasEl.value) return;

  renderer = new THREE.WebGLRenderer({ canvas: canvasEl.value, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.debug.onShaderError = (_gl, _program, _vs, _fs) => {
    const vsLog = _gl.getShaderInfoLog(_vs as WebGLShader) || "";
    const fsLog = _gl.getShaderInfoLog(_fs as WebGLShader) || "";
    const log = (fsLog || vsLog).trim();
    errorMsg.value = log
      .split("\n")
      .filter(Boolean)
      .slice(0, 3)
      .join("\n");
  };

  scene = new THREE.Scene();
  camera = setupCamera();
  material = makeMaterial(initialFragment, initialVertex);
  mesh = buildMesh();
  scene.add(mesh);

  if (fragEditorEl.value) {
    fragView = buildEditor(fragEditorEl.value, initialFragment, () => scheduleRecompile());
  }
  if (props.showVertex && vertEditorEl.value) {
    vertView = buildEditor(vertEditorEl.value, initialVertex, () => scheduleRecompile());
  }

  ro = new ResizeObserver(() => resize());
  ro.observe(canvasEl.value);

  document.addEventListener("fullscreenchange", onFullscreenChange);

  resize();
  // ResizeObserver sometimes misses the first frame when the parent isn't
  // laid out yet (especially inside grid cells); a couple of follow-up
  // resizes guarantee we pick up the real dimensions.
  requestAnimationFrame(() => resize());
  setTimeout(() => resize(), 120);

  startTime = performance.now();
  rafId = requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId);
  ro?.disconnect();
  document.removeEventListener("fullscreenchange", onFullscreenChange);
  if (compileTimer) clearTimeout(compileTimer);
  fragView?.destroy();
  vertView?.destroy();
  material?.dispose();
  (mesh?.geometry as THREE.BufferGeometry | undefined)?.dispose();
  renderer?.dispose();
});

watch(
  () => JSON.stringify(uniformValues.value),
  () => {
    for (const spec of props.uniforms) applyUniformValue(spec);
  }
);

const sliderUniforms = computed(() => props.uniforms.filter((u) => u.type === "float"));
const colorUniforms = computed(() => props.uniforms.filter((u) => u.type === "color"));

// Slider fill-to-thumb percentage. Used as an inline CSS variable.
function sliderPct(u: UniformSpec): number {
  const min = u.min ?? 0;
  const max = u.max ?? 1;
  const v = Number(uniformValues.value[u.name]);
  if (max === min) return 0;
  return Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
}
</script>

<template>
  <div
    ref="rootEl"
    class="shader-playground bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl overflow-hidden"
    :class="{
      'is-fullscreen': isFullscreen,
      'my-10 shadow-2xl shadow-black/40': !canvasOnly,
      'my-0 shadow-lg shadow-black/30': canvasOnly,
    }"
  >
    <!-- Title bar (compact in canvasOnly showcase mode) -->
    <div
      class="flex items-center justify-between bg-[#0f0f0f] border-b border-[#1a1a1a] select-none shrink-0"
      :class="canvasOnly ? 'px-2 py-1' : 'px-3 sm:px-4 py-2.5'"
    >
      <div class="flex items-center gap-2 min-w-0">
        <div class="flex shrink-0" :class="canvasOnly ? 'gap-1' : 'gap-1.5'">
          <span class="rounded-full bg-[#ff5f57]" :class="canvasOnly ? 'w-2 h-2' : 'w-3 h-3'"></span>
          <span class="rounded-full bg-[#febc2e]" :class="canvasOnly ? 'w-2 h-2' : 'w-3 h-3'"></span>
          <span class="rounded-full bg-[#28c840]" :class="canvasOnly ? 'w-2 h-2' : 'w-3 h-3'"></span>
        </div>
        <span
          class="text-[#666] tracking-wider font-plex truncate"
          :class="canvasOnly ? 'text-[10px] ml-0.5' : 'text-[10px] ml-2 text-[#444]'"
        >
          <template v-if="canvasOnly">{{ title || 'shader' }}</template>
          <template v-else>
            islam@portfolio ~ <span class="text-[#666]">shader</span><span v-if="title">: <span class="text-[#888]">{{ title }}</span></span>
          </template>
        </span>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <!-- Icon button: play/pause -->
        <button
          @click="isPaused = !isPaused"
          class="icon-btn"
          :title="isPaused ? 'Resume' : 'Pause'"
          :aria-label="isPaused ? 'Resume animation' : 'Pause animation'"
        >
          <svg v-if="isPaused" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M5.25 5.65a1 1 0 0 1 1.51-.86l12.04 6.96a1 1 0 0 1 0 1.73L6.76 20.45a1 1 0 0 1-1.5-.87V5.65Z"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M6 5.5a1.5 1.5 0 0 1 3 0v13a1.5 1.5 0 0 1-3 0v-13ZM15 5.5a1.5 1.5 0 0 1 3 0v13a1.5 1.5 0 0 1-3 0v-13Z"/></svg>
        </button>
        <!-- Icon button: copy (hidden in canvasOnly showcase mode) -->
        <button
          v-if="!canvasOnly"
          @click="copyCode"
          class="icon-btn relative"
          :title="copied ? 'Copied!' : 'Copy current shader'"
          aria-label="Copy current shader"
        >
          <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
            <rect x="9" y="9" width="11" height="11" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 text-green-400"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
        <!-- Icon button: reset (hidden in canvasOnly showcase mode) -->
        <button
          v-if="!canvasOnly"
          @click="reset"
          class="icon-btn"
          title="Reset to initial code"
          aria-label="Reset shader"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
            <path d="M3 12a9 9 0 1 0 3-6.7"/>
            <polyline points="3 4 3 10 9 10"/>
          </svg>
        </button>
        <!-- Icon button: fullscreen -->
        <button
          @click="toggleFullscreen"
          class="icon-btn"
          :title="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
          aria-label="Toggle fullscreen"
        >
          <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
            <path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
            <path d="M9 4v4a1 1 0 0 1-1 1H4M15 4v4a1 1 0 0 0 1 1h4M9 20v-4a1 1 0 0 0-1-1H4M15 20v-4a1 1 0 0 1 1-1h4"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Body: editor + canvas (single column in canvasOnly showcase mode) -->
    <div class="body-grid grid flex-1 min-h-0" :class="canvasOnly ? 'grid-cols-1' : 'md:grid-cols-2'">
      <!-- Editor side (hidden in canvasOnly showcase mode) -->
      <div v-if="!canvasOnly" class="border-b md:border-b-0 md:border-r border-[#1a1a1a] flex flex-col min-h-0 min-w-0">
        <!-- File tab bar -->
        <div class="flex items-center justify-between border-b border-[#1a1a1a] bg-[#0c0c0c] shrink-0">
          <div class="flex items-stretch">
            <template v-if="showVertex">
              <button
                v-for="tab in (['fragment','vertex'] as const)"
                :key="tab"
                @click="activeTab = tab"
                :class="[
                  'group relative flex items-center gap-1.5 px-3 py-2 text-[10px] tracking-wider uppercase font-plex transition-colors border-r border-[#1a1a1a]',
                  activeTab === tab
                    ? 'text-green-400 bg-[#070707]'
                    : 'text-[#555] hover:text-[#999] hover:bg-[#0f0f0f]'
                ]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 opacity-70">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
                {{ tab }}.glsl
                <span
                  v-if="activeTab === tab"
                  class="absolute left-0 right-0 -top-px h-px bg-green-400"
                ></span>
              </button>
            </template>
            <span
              v-else
              class="relative flex items-center gap-1.5 px-3 py-2 text-[10px] tracking-wider uppercase font-plex text-green-400 bg-[#070707] border-r border-[#1a1a1a]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 opacity-70">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
              fragment.glsl
              <span class="absolute left-0 right-0 -top-px h-px bg-green-400"></span>
            </span>
          </div>
          <div class="flex items-center gap-1.5 px-3 text-[9px] tracking-wider uppercase font-plex">
            <span
              class="w-1.5 h-1.5 rounded-full transition-shadow"
              :class="{
                'bg-green-400': status === 'ok',
                'bg-yellow-400': status === 'compiling',
                'bg-red-400': status === 'error',
                'shadow-[0_0_8px_rgba(34,197,94,0.8)]': justCompiled,
              }"
            ></span>
            <span class="text-[#555] hidden md:inline">
              {{ status === 'compiling' ? 'compiling' : status === 'error' ? 'error' : 'ready' }}
            </span>
          </div>
        </div>

        <!-- Editor host: explicit height in normal mode; flex-fills in fullscreen -->
        <div
          class="editor-host bg-[#070707] overflow-hidden"
          :style="!isFullscreen ? { height: height + 'px' } : undefined"
        >
          <div
            ref="fragEditorEl"
            v-show="!showVertex || activeTab === 'fragment'"
            class="h-full"
          ></div>
          <div
            v-if="showVertex"
            ref="vertEditorEl"
            v-show="activeTab === 'vertex'"
            class="h-full"
          ></div>
        </div>
      </div>

      <!-- Canvas side -->
      <div class="bg-black flex flex-col min-w-0">
        <!-- "Output" header only in full (non-canvasOnly) mode -->
        <div
          v-if="!canvasOnly"
          class="flex items-center justify-between px-3 py-2 border-b border-[#1a1a1a] bg-[#0c0c0c] shrink-0"
        >
          <span class="text-[10px] tracking-wider uppercase font-plex text-[#555] flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-green-400/40"></span>
            output
          </span>
          <span class="text-[9px] tracking-wider font-plex text-[#444] tabular-nums">
            {{ canvasW }}×{{ canvasH }}
            <span class="text-[#333] mx-1">·</span>
            <span :class="isPaused ? 'text-[#444]' : (fps < 30 ? 'text-yellow-400/60' : 'text-[#555]')">
              {{ isPaused ? 'paused' : fps + 'fps' }}
            </span>
          </span>
        </div>
        <div
          class="relative bg-black"
          :style="!isFullscreen ? { height: height + 'px' } : { flex: '1 1 0', minHeight: '0' }"
        >
          <canvas
            ref="canvasEl"
            class="block w-full h-full"
          ></canvas>
          <div class="pointer-events-none absolute inset-0 shader-scanlines"></div>
          <Transition name="err">
            <div
              v-if="errorMsg && !canvasOnly"
              class="absolute inset-x-2 bottom-2 text-[10px] font-plex bg-[#1a0a0a]/95 border border-red-900/50 rounded px-2.5 py-1.5 max-h-28 overflow-auto"
            >
              <div class="text-red-400/70 tracking-wider uppercase text-[9px] mb-1 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-2.5 h-2.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/>
                </svg>
                compile error
              </div>
              <pre class="text-red-300/90 whitespace-pre-wrap break-words m-0">{{ errorMsg }}</pre>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Uniforms panel (hidden in canvasOnly showcase mode) -->
    <div
      v-if="uniforms.length > 0 && !canvasOnly"
      class="border-t border-[#1a1a1a] bg-[#0c0c0c] shrink-0"
    >
      <div class="px-3 sm:px-4 pt-2.5 pb-1.5 flex items-center gap-2 text-[9px] tracking-[0.15em] uppercase font-plex text-[#444]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 text-green-400/40">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        uniforms
      </div>
      <div class="px-3 sm:px-4 pb-3 pt-1 grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-2.5">
        <label
          v-for="u in sliderUniforms"
          :key="u.name"
          class="flex items-center gap-3 group cursor-pointer"
        >
          <span class="text-[10px] tracking-wider font-plex text-[#666] w-20 shrink-0 group-hover:text-green-400/80 transition-colors truncate">
            {{ u.label || u.name }}
          </span>
          <input
            type="range"
            :min="u.min ?? 0"
            :max="u.max ?? 1"
            :step="u.step ?? 0.01"
            v-model.number="uniformValues[u.name] as number"
            :style="{ '--p': sliderPct(u) + '%' }"
            class="flex-1 min-w-0"
          />
          <span class="text-[10px] font-plex text-green-400/70 w-12 text-right tabular-nums shrink-0">
            {{ Number(uniformValues[u.name]).toFixed(2) }}
          </span>
        </label>
        <label
          v-for="u in colorUniforms"
          :key="u.name"
          class="flex items-center gap-3 group cursor-pointer"
        >
          <span class="text-[10px] tracking-wider font-plex text-[#666] w-20 shrink-0 group-hover:text-green-400/80 transition-colors truncate">
            {{ u.label || u.name }}
          </span>
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <div class="relative w-7 h-7 shrink-0 rounded border border-[#2a2a2a] overflow-hidden group-hover:border-green-400/40 transition-colors">
              <input
                type="color"
                v-model="uniformValues[u.name] as string"
                class="absolute inset-0 w-full h-full cursor-pointer opacity-0"
              />
              <div
                class="w-full h-full pointer-events-none"
                :style="{ background: uniformValues[u.name] as string }"
              ></div>
            </div>
            <span class="text-[10px] font-plex text-green-400/70 tabular-nums">
              {{ (uniformValues[u.name] as string).toUpperCase() }}
            </span>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ─── Icon buttons in header ─── */
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  color: #666;
  border-radius: 6px;
  border: 1px solid transparent;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}
.icon-btn:hover {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.2);
}
.icon-btn:active {
  background: rgba(34, 197, 94, 0.14);
}

/* ─── Sliders ─── */
.shader-playground input[type="range"] {
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  height: 18px;
  cursor: pointer;
  --p: 0%;
}
.shader-playground input[type="range"]::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    rgba(34, 197, 94, 0.7) 0%,
    rgba(34, 197, 94, 0.7) var(--p),
    #1a1a1a var(--p),
    #1a1a1a 100%
  );
}
.shader-playground input[type="range"]::-moz-range-track {
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    rgba(34, 197, 94, 0.7) 0%,
    rgba(34, 197, 94, 0.7) var(--p),
    #1a1a1a var(--p),
    #1a1a1a 100%
  );
}
.shader-playground input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: #22c55e;
  border: 2px solid #0a0a0a;
  margin-top: -5px;
  cursor: pointer;
  box-shadow: 0 0 0 1px #2a2a2a;
  transition: box-shadow 0.15s, transform 0.15s;
}
.shader-playground input[type="range"]::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: #22c55e;
  border: 2px solid #0a0a0a;
  cursor: pointer;
  box-shadow: 0 0 0 1px #2a2a2a;
  transition: box-shadow 0.15s, transform 0.15s;
}
.shader-playground input[type="range"]:hover::-webkit-slider-thumb,
.shader-playground input[type="range"]:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 1px #22c55e, 0 0 10px rgba(34, 197, 94, 0.5);
  transform: scale(1.1);
}
.shader-playground input[type="range"]:hover::-moz-range-thumb,
.shader-playground input[type="range"]:focus-visible::-moz-range-thumb {
  box-shadow: 0 0 0 1px #22c55e, 0 0 10px rgba(34, 197, 94, 0.5);
  transform: scale(1.1);
}
.shader-playground input[type="range"]:focus {
  outline: none;
}

/* ─── Color picker (hide native, show our swatch) ─── */
.shader-playground input[type="color"] {
  -webkit-appearance: none;
  appearance: none;
  border: none;
  padding: 0;
  background: transparent;
}
.shader-playground input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
.shader-playground input[type="color"]::-webkit-color-swatch { border: none; }
.shader-playground input[type="color"]::-moz-color-swatch { border: none; }

/* ─── Canvas scanlines ─── */
.shader-scanlines {
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.1) 2px,
    rgba(0, 0, 0, 0.1) 3px
  );
  mix-blend-mode: multiply;
}

/* ─── Error overlay transition ─── */
.err-enter-active, .err-leave-active {
  transition: opacity 0.18s, transform 0.18s;
}
.err-enter-from, .err-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

/* ─── Fullscreen layout ─── */
.shader-playground.is-fullscreen {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  margin: 0;
  border-radius: 0;
  border: none;
}
.shader-playground.is-fullscreen .body-grid {
  flex: 1 1 0;
  min-height: 0;
}
.shader-playground.is-fullscreen .editor-host {
  height: 100% !important;
}
</style>
