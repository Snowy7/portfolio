<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { EditorView, lineNumbers, highlightActiveLine, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import {
  syntaxHighlighting,
  HighlightStyle,
  bracketMatching,
  indentOnInput,
  indentUnit,
} from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { getPyodide, isPyodideReady } from "../lib/pyodide";

const props = withDefaults(
  defineProps<{
    title?: string;
    code: string;
    height?: number;            // editor height in px
    outputHeight?: number;      // output panel height in px
  }>(),
  {
    height: 220,
    outputHeight: 140,
  }
);

const initialCode = props.code.replace(/\s+$/, "");

const editorHost = ref<HTMLDivElement | null>(null);
const status = ref<"idle" | "loading" | "running" | "ok" | "error">("idle");
const stageMsg = ref<string>("");
const stdoutLines = ref<string[]>([]);
const stderrLines = ref<string[]>([]);
const runtimeMs = ref<number>(0);
const copied = ref(false);

let editorView: EditorView | null = null;

// ── CodeMirror theme — same palette as the rest of the playgrounds ──
const editorTheme = EditorView.theme(
  {
    "&": { color: "#c5c5c5", backgroundColor: "transparent", fontSize: "12px", height: "100%" },
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
    ".cm-matchingBracket": {
      backgroundColor: "rgba(34, 197, 94, 0.15)",
      outline: "1px solid rgba(34,197,94,0.4)",
    },
    ".cm-selectionBackground": { backgroundColor: "rgba(34, 197, 94, 0.18) !important" },
  },
  { dark: true }
);

const pyHighlight = HighlightStyle.define([
  { tag: t.keyword, color: "#22c55e" },
  { tag: t.controlKeyword, color: "#22c55e" },
  { tag: t.typeName, color: "#7dd3fc" },
  { tag: t.number, color: "#fbbf24" },
  { tag: t.string, color: "#fbbf24" },
  { tag: t.bool, color: "#60a5fa" },
  { tag: t.null, color: "#888" },
  { tag: t.propertyName, color: "#7dd3fc" },
  { tag: t.comment, color: "#555", fontStyle: "italic" },
  { tag: t.function(t.variableName), color: "#e879f9" },
  { tag: t.variableName, color: "#c5c5c5" },
  { tag: t.operator, color: "#999" },
  { tag: t.bracket, color: "#666" },
  { tag: t.punctuation, color: "#666" },
]);

function buildEditor(host: HTMLDivElement, initial: string): EditorView {
  return new EditorView({
    parent: host,
    state: EditorState.create({
      doc: initial,
      extensions: [
        lineNumbers(),
        history(),
        bracketMatching(),
        indentOnInput(),
        indentUnit.of("    "),  // Python convention: 4-space indent
        highlightActiveLine(),
        python(),
        syntaxHighlighting(pyHighlight),
        keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
        editorTheme,
      ],
    }),
  });
}

async function run() {
  if (status.value === "loading" || status.value === "running") return;
  stdoutLines.value = [];
  stderrLines.value = [];
  runtimeMs.value = 0;

  // First-run UX: announce we're downloading the runtime
  if (!isPyodideReady()) {
    status.value = "loading";
    stageMsg.value = "Loading Python…";
  }

  try {
    const py = await getPyodide((stage) => {
      stageMsg.value = stage;
    });

    status.value = "running";
    stageMsg.value = "Running…";

    const code = editorView?.state.doc.toString() ?? initialCode;

    // Hook stdout / stderr into reactive arrays for live-streamed output.
    py.setStdout({ batched: (s: string) => stdoutLines.value.push(s) });
    py.setStderr({ batched: (s: string) => stderrLines.value.push(s) });

    const start = performance.now();
    try {
      await py.runPythonAsync(code);
      status.value = "ok";
      stageMsg.value = "";
    } catch (e: any) {
      // Pyodide wraps Python exceptions; e.message contains the full traceback
      stderrLines.value.push((e?.message ?? String(e)).trimEnd() + "\n");
      status.value = "error";
      stageMsg.value = "";
    }
    runtimeMs.value = performance.now() - start;
  } catch (e: any) {
    status.value = "error";
    stderrLines.value.push("Runtime load failed: " + (e?.message ?? String(e)));
    stageMsg.value = "";
  }
}

function reset() {
  editorView?.dispatch({
    changes: {
      from: 0,
      to: editorView.state.doc.length,
      insert: initialCode,
    },
  });
  stdoutLines.value = [];
  stderrLines.value = [];
  runtimeMs.value = 0;
  status.value = "idle";
  stageMsg.value = "";
}

async function copyCode() {
  const code = editorView?.state.doc.toString() ?? initialCode;
  try {
    await navigator.clipboard.writeText(code);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1200);
  } catch {
    /* clipboard unavailable */
  }
}

function clearOutput() {
  stdoutLines.value = [];
  stderrLines.value = [];
  runtimeMs.value = 0;
  if (status.value !== "loading" && status.value !== "running") {
    status.value = "idle";
    stageMsg.value = "";
  }
}

onMounted(() => {
  if (editorHost.value) {
    editorView = buildEditor(editorHost.value, initialCode);
  }
});

onBeforeUnmount(() => {
  editorView?.destroy();
});

// Computed styles
function statusDotClass() {
  switch (status.value) {
    case "loading": return "bg-yellow-400 animate-pulse";
    case "running": return "bg-yellow-400 animate-pulse";
    case "ok":      return "bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]";
    case "error":   return "bg-red-400";
    default:        return "bg-[#333]";
  }
}

function statusText(): string {
  switch (status.value) {
    case "loading": return stageMsg.value || "loading";
    case "running": return "running";
    case "ok":      return runtimeMs.value > 0 ? `done in ${formatMs(runtimeMs.value)}` : "ready";
    case "error":   return "failed";
    default:        return "idle";
  }
}

function formatMs(ms: number): string {
  if (ms < 1000) return Math.round(ms) + "ms";
  return (ms / 1000).toFixed(2) + "s";
}
</script>

<template>
  <div class="py-playground my-10 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-2xl shadow-black/40">
    <!-- ─── Title bar ─── -->
    <div class="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-[#0f0f0f] border-b border-[#1a1a1a] select-none">
      <div class="flex items-center gap-2 min-w-0">
        <div class="flex gap-1.5 shrink-0">
          <span class="w-3 h-3 rounded-full bg-[#ff5f57]"></span>
          <span class="w-3 h-3 rounded-full bg-[#febc2e]"></span>
          <span class="w-3 h-3 rounded-full bg-[#28c840]"></span>
        </div>
        <span class="text-[10px] text-[#444] ml-2 tracking-wider font-plex truncate">
          islam@portfolio ~ <span class="text-[#666]">python</span><span v-if="title">: <span class="text-[#888]">{{ title }}</span></span>
        </span>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button
          @click="copyCode"
          class="icon-btn"
          :title="copied ? 'Copied!' : 'Copy code'"
          aria-label="Copy code"
        >
          <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
            <rect x="9" y="9" width="11" height="11" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 text-green-400"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
        <button
          @click="reset"
          class="icon-btn"
          title="Reset code"
          aria-label="Reset code"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
            <path d="M3 12a9 9 0 1 0 3-6.7"/>
            <polyline points="3 4 3 10 9 10"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- ─── Run bar ─── -->
    <div class="flex items-center justify-between gap-3 px-3 py-2 bg-[#0c0c0c] border-b border-[#1a1a1a]">
      <button
        @click="run"
        :disabled="status === 'loading' || status === 'running'"
        class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-plex font-semibold tracking-wider border transition-colors bg-green-400/15 border-green-400/30 text-green-400 hover:bg-green-400/25 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3"><path d="M5.25 5.65a1 1 0 0 1 1.51-.86l12.04 6.96a1 1 0 0 1 0 1.73L6.76 20.45a1 1 0 0 1-1.5-.87V5.65Z"/></svg>
        RUN
      </button>

      <div class="flex items-center gap-2 min-w-0 flex-1 justify-end text-[9px] tracking-wider uppercase font-plex">
        <span class="w-1.5 h-1.5 rounded-full transition-shadow" :class="statusDotClass()"></span>
        <span
          :class="{
            'text-yellow-400': status === 'loading' || status === 'running',
            'text-green-400/80': status === 'ok',
            'text-red-400': status === 'error',
            'text-[#555]': status === 'idle',
          }"
          class="truncate"
        >
          {{ statusText() }}
        </span>
      </div>
    </div>

    <!-- ─── Editor ─── -->
    <div
      class="bg-[#070707] overflow-hidden border-b border-[#1a1a1a]"
      :style="{ height: height + 'px' }"
    >
      <div ref="editorHost" class="h-full"></div>
    </div>

    <!-- ─── Output ─── -->
    <div
      class="bg-black flex flex-col"
      :style="{ height: outputHeight + 'px' }"
    >
      <div class="flex items-center justify-between px-3 py-1.5 border-b border-[#1a1a1a] bg-[#0c0c0c]">
        <span class="flex items-center gap-1.5 text-[10px] tracking-wider uppercase font-plex text-[#555]">
          <span class="w-1.5 h-1.5 rounded-full bg-green-400/40"></span>
          stdout
        </span>
        <button
          v-if="stdoutLines.length > 0 || stderrLines.length > 0"
          @click="clearOutput"
          class="text-[9px] tracking-wider uppercase font-plex text-[#666] hover:text-green-400 transition-colors"
        >
          clear
        </button>
      </div>
      <pre
        class="flex-1 overflow-auto px-3 py-2 m-0 text-[11px] font-plex leading-relaxed bg-black"
      ><template v-if="stdoutLines.length === 0 && stderrLines.length === 0 && status === 'idle'"><span class="text-[#444]">↗ click RUN to execute</span></template><span v-else class="text-[#cfcfcf] whitespace-pre-wrap break-words">{{ stdoutLines.join('') }}</span><span v-if="stderrLines.length > 0" class="text-red-400/85 whitespace-pre-wrap break-words">{{ stderrLines.join('') }}</span><span v-if="status === 'loading'" class="text-yellow-400/80 animate-pulse">{{ stageMsg }}</span></pre>
    </div>
  </div>
</template>

<style scoped>
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
</style>
