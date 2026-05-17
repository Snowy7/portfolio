<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from "vue";
import { EditorView, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { json } from "@codemirror/lang-json";
import { python } from "@codemirror/lang-python";
import { syntaxHighlighting, HighlightStyle, bracketMatching } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

type Method = "GET" | "POST" | "PUT" | "DELETE";

const props = withDefaults(
  defineProps<{
    title?: string;
    url: string;
    method?: Method;
    pythonCode: string;
    body?: string;            // optional JSON body for POST/PUT
    urlEditable?: boolean;
    methodEditable?: boolean;
    height?: number;
    autoSend?: boolean;
  }>(),
  {
    method: "GET",
    urlEditable: true,
    methodEditable: false,
    height: 280,
    autoSend: false,
  }
);

const initialUrl = props.url;
const initialMethod = props.method;

const currentUrl = ref(props.url);
const currentMethod = ref<Method>(props.method);

const status = ref<number | null>(null);
const statusText = ref<string>("");
const responseText = ref<string>("");
const responseHeaders = ref<Record<string, string>>({});
const responseTime = ref<number>(0);
const loading = ref(false);
const error = ref<string>("");
const copied = ref(false);

const rootEl = ref<HTMLDivElement | null>(null);
const pythonHost = ref<HTMLDivElement | null>(null);
const responseHost = ref<HTMLDivElement | null>(null);

let pythonView: EditorView | null = null;
let responseView: EditorView | null = null;

// ── CodeMirror theme — mirrors ShaderPlayground for visual consistency ──
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
    ".cm-activeLine": { backgroundColor: "transparent" },
    "&.cm-focused": { outline: "none" },
  },
  { dark: true }
);

const codeHighlight = HighlightStyle.define([
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

function buildReadOnlyEditor(host: HTMLDivElement, initial: string, lang: any): EditorView {
  return new EditorView({
    parent: host,
    state: EditorState.create({
      doc: initial,
      extensions: [
        lineNumbers(),
        bracketMatching(),
        lang(),
        syntaxHighlighting(codeHighlight),
        editorTheme,
        EditorView.editable.of(false),
        EditorState.readOnly.of(true),
      ],
    }),
  });
}

function setResponseDoc(text: string) {
  if (!responseView) return;
  responseView.dispatch({
    changes: { from: 0, to: responseView.state.doc.length, insert: text },
  });
}

async function send() {
  loading.value = true;
  error.value = "";
  responseText.value = "";
  status.value = null;
  statusText.value = "";
  responseHeaders.value = {};
  setResponseDoc("");

  const start = performance.now();
  try {
    const opts: RequestInit = { method: currentMethod.value };
    if (props.body && (currentMethod.value === "POST" || currentMethod.value === "PUT")) {
      opts.body = props.body;
      opts.headers = { "Content-Type": "application/json" };
    }
    const r = await fetch(currentUrl.value, opts);
    status.value = r.status;
    statusText.value = r.statusText || "";

    const text = await r.text();
    let display = text;
    try {
      const parsed = JSON.parse(text);
      const pretty = JSON.stringify(parsed, null, 2);
      // Cap absurdly long responses so the editor stays snappy
      display = pretty.length > 6000 ? pretty.slice(0, 6000) + "\n\n... [truncated, " + pretty.length + " chars total]" : pretty;
    } catch {
      // Not JSON — display as-is, capped
      display = text.length > 6000 ? text.slice(0, 6000) + "\n\n... [truncated]" : text;
    }
    responseText.value = display;

    const h: Record<string, string> = {};
    r.headers.forEach((v, k) => { h[k] = v; });
    responseHeaders.value = h;
  } catch (e: any) {
    // Likely CORS, network, or invalid URL
    error.value = e?.message || String(e);
  } finally {
    responseTime.value = performance.now() - start;
    loading.value = false;
    setResponseDoc(responseText.value || (error.value ? "// Request failed — see error overlay." : ""));
  }
}

async function copyPython() {
  try {
    await navigator.clipboard.writeText(props.pythonCode);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1200);
  } catch {
    /* clipboard not available */
  }
}

function reset() {
  currentUrl.value = initialUrl;
  currentMethod.value = initialMethod;
  status.value = null;
  statusText.value = "";
  responseText.value = "";
  responseHeaders.value = {};
  responseTime.value = 0;
  error.value = "";
  setResponseDoc("");
}

onMounted(() => {
  if (pythonHost.value) {
    pythonView = buildReadOnlyEditor(pythonHost.value, props.pythonCode, python);
  }
  if (responseHost.value) {
    responseView = buildReadOnlyEditor(responseHost.value, "", json);
  }
  if (props.autoSend) {
    nextTick(() => send());
  }
});

onBeforeUnmount(() => {
  pythonView?.destroy();
  responseView?.destroy();
});

// Color for the status badge
const statusColor = computed(() => {
  const s = status.value;
  if (s === null) return "text-[#555]";
  if (s >= 200 && s < 300) return "text-green-400";
  if (s >= 300 && s < 400) return "text-blue-400";
  if (s >= 400 && s < 500) return "text-yellow-400";
  return "text-red-400";
});

const statusDotClass = computed(() => {
  if (loading.value) return "bg-yellow-400 animate-pulse";
  if (error.value) return "bg-red-400";
  const s = status.value;
  if (s === null) return "bg-[#333]";
  if (s >= 200 && s < 300) return "bg-green-400";
  if (s >= 300 && s < 400) return "bg-blue-400";
  if (s >= 400 && s < 500) return "bg-yellow-400";
  return "bg-red-400";
});

// Color for the method chip (REST/Postman style)
const methodChipClass = computed(() => {
  switch (currentMethod.value) {
    case "GET":    return "bg-green-400/15 text-green-400 border-green-400/30";
    case "POST":   return "bg-orange-400/15 text-orange-400 border-orange-400/30";
    case "PUT":    return "bg-blue-400/15 text-blue-400 border-blue-400/30";
    case "DELETE": return "bg-red-400/15 text-red-400 border-red-400/30";
  }
});

const formattedTime = computed(() => {
  const ms = responseTime.value;
  if (ms === 0) return "";
  if (ms < 1000) return Math.round(ms) + "ms";
  return (ms / 1000).toFixed(2) + "s";
});
</script>

<template>
  <div
    ref="rootEl"
    class="api-playground my-10 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-2xl shadow-black/40"
  >
    <!-- ─── Title bar ─── -->
    <div class="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-[#0f0f0f] border-b border-[#1a1a1a] select-none">
      <div class="flex items-center gap-2 min-w-0">
        <div class="flex gap-1.5 shrink-0">
          <span class="w-3 h-3 rounded-full bg-[#ff5f57]"></span>
          <span class="w-3 h-3 rounded-full bg-[#febc2e]"></span>
          <span class="w-3 h-3 rounded-full bg-[#28c840]"></span>
        </div>
        <span class="text-[10px] text-[#444] ml-2 tracking-wider font-plex truncate">
          islam@portfolio ~ <span class="text-[#666]">api</span><span v-if="title">: <span class="text-[#888]">{{ title }}</span></span>
        </span>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button
          @click="copyPython"
          class="icon-btn"
          :title="copied ? 'Copied!' : 'Copy Python'"
          aria-label="Copy Python code"
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
          title="Reset request"
          aria-label="Reset request"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
            <path d="M3 12a9 9 0 1 0 3-6.7"/>
            <polyline points="3 4 3 10 9 10"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- ─── URL bar ─── -->
    <div class="flex items-stretch gap-2 px-3 py-2 bg-[#0c0c0c] border-b border-[#1a1a1a]">
      <!-- Method chip (selectable if methodEditable) -->
      <div
        v-if="!methodEditable"
        :class="['shrink-0 px-2.5 py-1 rounded text-[10px] font-plex font-semibold tracking-wider border self-center', methodChipClass]"
      >
        {{ currentMethod }}
      </div>
      <select
        v-else
        v-model="currentMethod"
        :class="['shrink-0 px-2 py-1 rounded text-[10px] font-plex font-semibold tracking-wider border self-center bg-transparent cursor-pointer', methodChipClass]"
      >
        <option>GET</option>
        <option>POST</option>
        <option>PUT</option>
        <option>DELETE</option>
      </select>

      <!-- URL input -->
      <input
        v-model="currentUrl"
        :readonly="!urlEditable"
        spellcheck="false"
        autocomplete="off"
        class="flex-1 min-w-0 bg-[#070707] border border-[#1a1a1a] rounded px-3 py-1 text-[11px] font-plex text-[#ccc] focus:outline-none focus:border-green-400/40 transition-colors"
        @keydown.enter="send"
      />

      <!-- Send button -->
      <button
        @click="send"
        :disabled="loading"
        class="shrink-0 px-3 py-1 rounded text-[10px] font-plex tracking-wider border transition-colors flex items-center gap-1.5 bg-green-400/10 border-green-400/30 text-green-400 hover:bg-green-400/20 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ loading ? 'SENDING' : 'SEND' }}
      </button>
    </div>

    <!-- ─── Body: Python | Response ─── -->
    <div class="grid md:grid-cols-2">
      <!-- Python panel (read-only) -->
      <div class="border-b md:border-b-0 md:border-r border-[#1a1a1a] flex flex-col min-h-0 min-w-0">
        <div class="flex items-center justify-between px-3 py-2 border-b border-[#1a1a1a] bg-[#0c0c0c]">
          <span class="flex items-center gap-1.5 text-[10px] tracking-wider uppercase font-plex text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 opacity-70">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
            example.py
          </span>
          <span class="text-[9px] tracking-wider uppercase font-plex text-[#444]">read-only</span>
        </div>
        <div class="bg-[#070707] overflow-hidden" :style="{ height: height + 'px' }">
          <div ref="pythonHost" class="h-full"></div>
        </div>
      </div>

      <!-- Response panel -->
      <div class="flex flex-col min-h-0 min-w-0">
        <div class="flex items-center justify-between px-3 py-2 border-b border-[#1a1a1a] bg-[#0c0c0c]">
          <span class="flex items-center gap-1.5 text-[10px] tracking-wider uppercase font-plex text-[#555]">
            <span class="w-1.5 h-1.5 rounded-full transition-colors" :class="statusDotClass"></span>
            response
          </span>
          <span class="text-[9px] tracking-wider font-plex tabular-nums">
            <template v-if="loading">
              <span class="text-yellow-400">sending…</span>
            </template>
            <template v-else-if="status !== null">
              <span :class="statusColor">{{ status }} {{ statusText }}</span>
              <span v-if="formattedTime" class="text-[#333] mx-1">·</span>
              <span v-if="formattedTime" class="text-[#555]">{{ formattedTime }}</span>
            </template>
            <template v-else-if="error">
              <span class="text-red-400">network error</span>
            </template>
            <template v-else>
              <span class="text-[#444]">idle</span>
            </template>
          </span>
        </div>

        <div class="bg-[#070707] relative overflow-hidden" :style="{ height: height + 'px' }">
          <div ref="responseHost" class="h-full"></div>

          <!-- Empty state -->
          <div
            v-if="!responseText && !loading && !error"
            class="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span class="text-[10px] font-plex tracking-wider uppercase text-[#444]">
              ↗ click <span class="text-green-400/70">SEND</span> to fetch
            </span>
          </div>

          <!-- Loading veil -->
          <div
            v-if="loading"
            class="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/50 backdrop-blur-[1px]"
          >
            <span class="text-[10px] font-plex tracking-wider uppercase text-yellow-400 animate-pulse">→ sending request…</span>
          </div>

          <!-- Error overlay -->
          <Transition name="err">
            <div
              v-if="error"
              class="absolute inset-x-2 bottom-2 text-[10px] font-plex bg-[#1a0a0a]/95 border border-red-900/50 rounded px-2.5 py-1.5 max-h-28 overflow-auto"
            >
              <div class="text-red-400/70 tracking-wider uppercase text-[9px] mb-1 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-2.5 h-2.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/>
                </svg>
                request failed
              </div>
              <pre class="text-red-300/90 whitespace-pre-wrap break-words m-0">{{ error }}</pre>
              <div class="text-[9px] text-red-300/50 mt-1.5">
                Common causes: CORS not allowed, typo in URL, network offline, or endpoint down.
              </div>
            </div>
          </Transition>
        </div>
      </div>
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

.api-playground select {
  appearance: none;
  -webkit-appearance: none;
}

.err-enter-active, .err-leave-active {
  transition: opacity 0.18s, transform 0.18s;
}
.err-enter-from, .err-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
