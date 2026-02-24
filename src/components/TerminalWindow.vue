<template>
  <Teleport to="body" v-if="mounted">
    <!-- Backdrop on mobile -->
    <div
      class="fixed inset-0 z-[90] bg-black/60 md:hidden transition-opacity duration-200"
      :class="isOpen && !isMinimized ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
      @click="minimize"
    />

    <!-- Minimized dock button -->
    <button
      v-show="isMinimized"
      @click="restore"
      class="fixed bottom-4 right-4 z-[95] flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-green-400 text-xs font-plex hover:border-green-400/30 transition-colors shadow-2xl shadow-black/50"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
      </svg>
      Terminal
    </button>

    <!-- Terminal window -->
    <div
      v-show="isOpen && !isMinimized"
      ref="windowEl"
      class="fixed z-[95] flex flex-col bg-[#0a0a0a] border border-[#2a2a2a] shadow-2xl shadow-black/80 transition-[inset,border-radius] duration-200 ease-out"
      :class="windowClass"
    >
      <!-- Title bar -->
      <div
        class="flex items-center justify-between px-4 py-2.5 bg-[#0f0f0f] border-b border-[#1a1a1a] shrink-0 select-none"
        :class="isMaximized ? '' : 'rounded-t-xl cursor-grab'"
        @mousedown="startDrag"
      >
        <div class="flex items-center gap-2">
          <div class="flex gap-1.5">
            <button @click.stop="close" class="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-125 transition-[filter]" title="Close" />
            <button @click.stop="minimize" class="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-125 transition-[filter]" title="Minimize" />
            <button @click.stop="toggleMaximize" class="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-125 transition-[filter]" title="Maximize" />
          </div>
          <span class="text-[10px] text-[#444] ml-2 tracking-wider font-plex hidden sm:inline">
            islam@portfolio ~ {{ snakeActive ? 'snake' : 'bash' }}
          </span>
        </div>
        <span class="text-[10px] text-[#333] font-plex">{{ isMaximized ? 'ESC to restore' : '' }}</span>
      </div>

      <!-- Snake game -->
      <div v-if="snakeActive" class="flex-1 flex flex-col p-4 overflow-hidden">
        <div class="flex items-center justify-between mb-2 text-[10px] font-plex">
          <span class="text-green-400/50">Score: {{ snakeScore }}</span>
          <span class="text-[#444]">WASD/arrows · Q quit</span>
        </div>
        <div class="flex-1 flex items-center justify-center">
          <canvas
            ref="snakeCanvas"
            :width="snakeCanvasW"
            :height="snakeCanvasH"
            class="border border-[#1a1a1a] rounded bg-black block"
            style="image-rendering: pixelated; max-width: 100%; max-height: 100%;"
          />
        </div>
        <p v-if="snakeGameOver" class="text-center text-green-400/60 text-[10px] mt-2 font-plex">
          Game Over! Score: {{ snakeScore }} · R restart · Q quit
        </p>
      </div>

      <!-- Terminal output -->
      <div
        v-else
        ref="outputEl"
        class="flex-1 p-4 overflow-y-auto space-y-1 font-plex text-xs scrollbar-thin"
        @click="focusInput"
      >
        <div v-for="(line, i) in lines" :key="i">
          <div v-if="line.type === 'input'" class="flex items-start gap-2">
            <span class="text-green-400/60 shrink-0">$</span>
            <span class="text-[#ccc]">{{ line.text }}</span>
          </div>
          <pre
            v-else
            class="text-[#888] whitespace-pre-wrap leading-relaxed break-words"
            :class="{ 'text-green-400/70': line.green, 'text-[#555]': line.dim, 'text-red-400/70': line.error }"
            v-html="line.text"
          ></pre>
        </div>

        <!-- Active prompt -->
        <div class="flex items-center gap-2">
          <span class="text-green-400/60 shrink-0">$</span>
          <input
            ref="inputEl"
            v-model="currentInput"
            @keydown.enter="execute"
            @keydown.up.prevent="historyUp"
            @keydown.down.prevent="historyDown"
            @keydown.tab.prevent="tabComplete"
            class="flex-1 bg-transparent text-[#ccc] outline-none caret-green-400 min-w-0"
            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            placeholder="type help..."
          />
          <span class="w-2 h-4 bg-green-400/60 animate-pulse shrink-0"></span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";

const mounted = ref(false);
const isOpen = ref(false);
const isMinimized = ref(false);
const isMaximized = ref(false);
const windowEl = ref<HTMLDivElement | null>(null);

// Drag
let isDragging = false;
let dragX = 0;
let dragY = 0;
let dragOffX = 0;
let dragOffY = 0;
const hasDragged = ref(false);

const windowClass = computed(() => {
  if (isMaximized.value) return "inset-0 rounded-none";
  if (hasDragged.value) return "rounded-xl";
  // Default position: bottom-right on desktop, near-fullscreen on mobile
  return "inset-3 md:inset-auto md:bottom-4 md:right-4 md:w-[560px] md:h-[420px] rounded-xl";
});

function open() {
  isOpen.value = true;
  isMinimized.value = false;
  nextTick(focusInput);
}
function close() {
  isOpen.value = false;
  isMinimized.value = false;
  isMaximized.value = false;
  hasDragged.value = false;
  clearInlinePos();
  if (snakeActive.value) quitSnake();
}
function minimize() {
  isMinimized.value = true;
}
function restore() {
  isMinimized.value = false;
  nextTick(focusInput);
}
function toggleMaximize() {
  const wasMaximized = isMaximized.value;
  isMaximized.value = !wasMaximized;
  if (!wasMaximized) {
    // Going fullscreen: clear inline styles so inset-0 class works
    clearInlinePos();
  } else if (hasDragged.value) {
    // Restoring from fullscreen: re-apply drag position
    nextTick(applyDragPos);
  }
}

defineExpose({ open, close, isOpen });

// ─── Drag ───
function startDrag(e: MouseEvent) {
  if (isMaximized.value || window.innerWidth < 768) return;
  const el = windowEl.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  dragOffX = e.clientX - rect.left;
  dragOffY = e.clientY - rect.top;
  isDragging = true;

  const onMove = (ev: MouseEvent) => {
    dragX = Math.max(0, Math.min(ev.clientX - dragOffX, window.innerWidth - 200));
    dragY = Math.max(0, Math.min(ev.clientY - dragOffY, window.innerHeight - 100));
    hasDragged.value = true;
    applyDragPos();
  };
  const onUp = () => {
    isDragging = false;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
}

function applyDragPos() {
  const el = windowEl.value;
  if (!el || isMaximized.value) return;
  el.style.left = dragX + "px";
  el.style.top = dragY + "px";
  el.style.right = "auto";
  el.style.bottom = "auto";
  el.style.width = "560px";
  el.style.height = "420px";
}

function clearInlinePos() {
  const el = windowEl.value;
  if (!el) return;
  el.style.left = "";
  el.style.top = "";
  el.style.right = "";
  el.style.bottom = "";
  el.style.width = "";
  el.style.height = "";
}

// ─── Terminal ───
interface Line { type: "input" | "output"; text: string; green?: boolean; dim?: boolean; error?: boolean; }
const lines = ref<Line[]>([]);
const currentInput = ref("");
const inputEl = ref<HTMLInputElement | null>(null);
const outputEl = ref<HTMLDivElement | null>(null);
const history = ref<string[]>([]);
let historyIndex = -1;

// ─── Snake ───
const snakeActive = ref(false);
const snakeCanvas = ref<HTMLCanvasElement | null>(null);
const snakeScore = ref(0);
const snakeGameOver = ref(false);
const snakeCellSize = 14;
const snakeCols = 28;
const snakeRows = 18;
const snakeCanvasW = computed(() => snakeCols * snakeCellSize);
const snakeCanvasH = computed(() => snakeRows * snakeCellSize);
let snakeInterval: ReturnType<typeof setInterval> | null = null;
let snake: { x: number; y: number }[] = [];
let snakeDir = { x: 1, y: 0 };
let snakeNextDir = { x: 1, y: 0 };
let food = { x: 15, y: 10 };

const commands: Record<string, () => string[]> = {
  help: () => [
    "",
    '<span class="text-green-400">Commands:</span>',
    "",
    "  <span class=\"text-green-400\">help</span>        Show this message",
    "  <span class=\"text-green-400\">about</span>       About me",
    "  <span class=\"text-green-400\">skills</span>      Tech stack",
    "  <span class=\"text-green-400\">projects</span>    Things I built",
    "  <span class=\"text-green-400\">blog</span>        Recent writing",
    "  <span class=\"text-green-400\">contact</span>     Reach me",
    "  <span class=\"text-green-400\">neofetch</span>    System info",
    "  <span class=\"text-green-400\">snake</span>       Play Snake",
    "  <span class=\"text-green-400\">clear</span>       Clear terminal",
    "",
  ],
  about: () => [
    "",
    '<span class="text-green-400">┌─ About ─────────────────────────────────┐</span>',
    '<span class="text-green-400">│</span>  <span class="text-white">Islam Azzam</span> — Software Dev & Network Eng',
    '<span class="text-green-400">│</span>  50+ projects · Games · Web · Autonomous',
    '<span class="text-green-400">│</span>',
    '<span class="text-green-400">│</span>  Location: <span class="text-[#bbb]">Doha, Qatar</span>',
    '<span class="text-green-400">│</span>  Education: <span class="text-[#bbb]">B.Sc. EE — Telecom @ UDST</span>',
    '<span class="text-green-400">│</span>  Building:  <span class="text-[#bbb]">The Cube (multiplayer FPS)</span>',
    '<span class="text-green-400">└─────────────────────────────────────────┘</span>',
    "",
  ],
  skills: () => [
    "",
    '<span class="text-green-400">Languages</span>',
    "  C#         ████████████████████░░ 95%",
    "  JavaScript ████████████████████░░ 95%",
    "  Python     ██████████████████░░░░ 90%",
    "  C++        ████████████████░░░░░░ 80%",
    "",
    '<span class="text-green-400">Game Dev</span>',
    "  Unity      ████████████████████░░ 95%",
    "  Multiplayer██████████████████░░░░ 90%",
    "  Shaders    █████████████████░░░░░ 85%",
    "",
    '<span class="text-green-400">Web</span>',
    "  React      ██████████████████░░░░ 90%",
    "  Node.js    ██████████████████░░░░ 90%",
    "  Tailwind   █████████████████░░░░░ 85%",
    "",
    '<span class="text-green-400">Engineering</span>',
    "  Embedded   █████████████████░░░░░ 85%",
    "  Autonomous █████████████████░░░░░ 85%",
    "  LiDAR      ████████████████░░░░░░ 80%",
    "",
  ],
  projects: () => [
    "",
    '<span class="text-green-400">[01]</span> <span class="text-white">SANAD</span> — AI university advisor platform',
    '<span class="text-green-400">[02]</span> <span class="text-white">HeyRabit</span> — Startup ecosystem platform',
    '<span class="text-green-400">[03]</span> <span class="text-white">Noor</span> — Quran companion PWA',
    '<span class="text-green-400">[04]</span> <span class="text-white">Snist</span> — AI Unity dev assistant',
    '<span class="text-green-400">[05]</span> <span class="text-white">The Cube</span> — Co-op FPS for Steam',
    '<span class="text-green-400">[06]</span> <span class="text-white">Shell Eco-Marathon</span> — 2nd place, autonomous',
    "",
    '  → <a href="/projects" class="text-green-400 underline">View all projects</a>',
    "",
  ],
  blog: () => [
    "",
    '<span class="text-green-400">Recent:</span>',
    '  <span class="text-white">How We Got 2nd at Shell Eco-Marathon</span>  <span class="text-[#555]">8 min</span>',
    '  <span class="text-white">Multiplayer Networking in Unity</span>  <span class="text-[#555]">6 min</span>',
    '  <span class="text-white">Winning 3 Awards in 72 Hours</span>  <span class="text-[#555]">5 min</span>',
    '  <span class="text-white">From React Native to Full Stack</span>  <span class="text-[#555]">5 min</span>',
    "",
  ],
  contact: () => [
    "",
    "  Email    → snowydev7@gmail.com",
    "  GitHub   → github.com/Snowy7",
    "  LinkedIn → linkedin.com/in/islam-azzam-6a3449205",
    "  Itch.io  → snowy7.itch.io",
    "  Twitter  → twitter.com/snowy7x",
    "",
  ],
  neofetch: () => [
    "",
    '<span class="text-green-400">        ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄</span>       <span class="text-green-400">islam</span>@<span class="text-green-400">portfolio</span>',
    '<span class="text-green-400">       ██████████████████</span>      ─────────────────',
    '<span class="text-green-400">      ████</span><span class="text-white">██</span><span class="text-green-400">████████</span><span class="text-white">██</span><span class="text-green-400">███</span>      <span class="text-green-400">OS:</span> Web · Astro 5',
    '<span class="text-green-400">      ████████████████████</span>     <span class="text-green-400">UI:</span> Vue 3 + Tailwind v4',
    '<span class="text-green-400">       ████████████████</span>        <span class="text-green-400">Font:</span> IBM Plex Mono',
    '<span class="text-green-400">        ██████████████</span>         <span class="text-green-400">Location:</span> Doha, Qatar',
    '<span class="text-green-400">         ████████████</span>          <span class="text-green-400">Experience:</span> 8+ years',
    '<span class="text-green-400">           ████████</span>            <span class="text-green-400">Focus:</span> Web · Games · Robotics',
    "",
  ],
  clear: () => { lines.value = []; return []; },
};

function execute() {
  const raw = currentInput.value.trim();
  if (!raw) return;
  lines.value.push({ type: "input", text: raw });
  history.value.unshift(raw);
  historyIndex = -1;
  const cmd = raw.toLowerCase().split(/\s+/)[0];
  if (cmd === "snake") {
    currentInput.value = "";
    lines.value.push({ type: "output", text: "Starting Snake... WASD/arrows. Q to quit.", green: true });
    nextTick(() => { snakeActive.value = true; nextTick(() => startSnake()); });
    return;
  }
  if (commands[cmd]) {
    for (const t of commands[cmd]()) lines.value.push({ type: "output", text: t });
  } else {
    lines.value.push({ type: "output", text: `bash: ${cmd}: command not found. Type <span class="text-green-400">help</span>.`, error: true });
  }
  currentInput.value = "";
  nextTick(scrollToBottom);
}

function historyUp() {
  if (!history.value.length) return;
  historyIndex = Math.min(historyIndex + 1, history.value.length - 1);
  currentInput.value = history.value[historyIndex];
}
function historyDown() {
  if (historyIndex <= 0) { historyIndex = -1; currentInput.value = ""; return; }
  historyIndex--;
  currentInput.value = history.value[historyIndex];
}
function tabComplete() {
  const p = currentInput.value.toLowerCase();
  if (!p) return;
  const m = Object.keys(commands).concat(["snake"]).find((c) => c.startsWith(p));
  if (m) currentInput.value = m;
}
function scrollToBottom() {
  if (outputEl.value) outputEl.value.scrollTop = outputEl.value.scrollHeight;
}
function focusInput() {
  if (!snakeActive.value) inputEl.value?.focus();
}

// ─── Snake ───
function startSnake() {
  snakeScore.value = 0; snakeGameOver.value = false;
  snake = [{ x: 5, y: 9 }, { x: 4, y: 9 }, { x: 3, y: 9 }];
  snakeDir = { x: 1, y: 0 }; snakeNextDir = { x: 1, y: 0 };
  placeFood(); drawSnake();
  if (snakeInterval) clearInterval(snakeInterval);
  snakeInterval = setInterval(snakeTick, 100);
}
function placeFood() {
  let a = 0;
  do { food = { x: Math.floor(Math.random() * snakeCols), y: Math.floor(Math.random() * snakeRows) }; a++; }
  while (snake.some((s) => s.x === food.x && s.y === food.y) && a < 200);
}
function snakeTick() {
  if (snakeGameOver.value) return;
  snakeDir = { ...snakeNextDir };
  const head = { x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y };
  if (head.x < 0 || head.x >= snakeCols || head.y < 0 || head.y >= snakeRows || snake.some((s) => s.x === head.x && s.y === head.y)) {
    snakeGameOver.value = true; if (snakeInterval) clearInterval(snakeInterval); drawSnake(); return;
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) { snakeScore.value += 10; placeFood(); } else { snake.pop(); }
  drawSnake();
}
function drawSnake() {
  const ctx = snakeCanvas.value?.getContext("2d"); if (!ctx) return;
  const c = snakeCellSize;
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, snakeCanvasW.value, snakeCanvasH.value);
  ctx.fillStyle = "rgba(34,197,94,0.04)";
  for (let x = 0; x < snakeCols; x++) for (let y = 0; y < snakeRows; y++) ctx.fillRect(x * c + c / 2 - 0.5, y * c + c / 2 - 0.5, 1, 1);
  snake.forEach((seg, i) => { ctx.fillStyle = `rgba(34,197,94,${i === 0 ? 1 : Math.max(0.3, 1 - i * 0.04)})`; ctx.fillRect(seg.x * c + 1, seg.y * c + 1, c - 2, c - 2); });
  ctx.fillStyle = "#fff"; ctx.fillRect(food.x * c + 2, food.y * c + 2, c - 4, c - 4);
}
function quitSnake() {
  snakeActive.value = false; if (snakeInterval) clearInterval(snakeInterval);
  lines.value.push({ type: "output", text: `Snake ended. Score: ${snakeScore.value}`, green: true });
  nextTick(() => { scrollToBottom(); focusInput(); });
}

function handleKeys(e: KeyboardEvent) {
  if (e.key === "Escape" && isOpen.value && !isMinimized.value) {
    if (isMaximized.value) isMaximized.value = false;
    else close();
    return;
  }
  if (!snakeActive.value || !isOpen.value || isMinimized.value) return;
  const key = e.key.toLowerCase();
  if (key === "q") { e.preventDefault(); quitSnake(); return; }
  if (key === "r" && snakeGameOver.value) { e.preventDefault(); startSnake(); return; }
  const dm: Record<string, { x: number; y: number }> = {
    arrowup: { x: 0, y: -1 }, arrowdown: { x: 0, y: 1 }, arrowleft: { x: -1, y: 0 }, arrowright: { x: 1, y: 0 },
    w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
  };
  const nd = dm[key]; if (nd) { e.preventDefault(); if (nd.x !== -snakeDir.x || nd.y !== -snakeDir.y) snakeNextDir = nd; }
}

onMounted(() => {
  mounted.value = true;
  lines.value = [
    { type: "output", text: '<span class="text-green-400">Welcome to Islam Azzam\'s terminal.</span>' },
    { type: "output", text: 'Type <span class="text-green-400">help</span> for commands or <span class="text-green-400">snake</span> to play.', dim: true },
    { type: "output", text: "" },
  ];
  window.addEventListener("keydown", handleKeys);
});
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeys);
  if (snakeInterval) clearInterval(snakeInterval);
});
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar { width: 4px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
</style>
