<template>
  <canvas ref="canvas" class="fixed inset-0 z-0 pointer-events-none opacity-25" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const props = withDefaults(
  defineProps<{ color?: string }>(),
  { color: "#22c55e" }
);

const canvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let raf = 0;
let columns: number[] = [];
let colCount = 0;
const fontSize = 14;
const chars = "01アイウエオカキクケコ{}[]<>=+-~$#@";

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) }
    : { r: 34, g: 197, b: 94 };
}

function init() {
  if (!canvas.value) return;
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.value.width = w * dpr;
  canvas.value.height = h * dpr;
  canvas.value.style.width = w + "px";
  canvas.value.style.height = h + "px";
  ctx = canvas.value.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  colCount = Math.ceil(w / fontSize);
  const old = columns.slice();
  columns = [];
  for (let i = 0; i < colCount; i++) {
    columns.push(old[i] ?? Math.random() * -100);
  }
}

let lastFrame = 0;

function draw(now: number) {
  raf = requestAnimationFrame(draw);
  if (now - lastFrame < 50) return; // ~20fps
  lastFrame = now;

  if (!ctx || !canvas.value) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const rgb = hexToRgb(props.color);

  // Fast fade — short trails
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.fillRect(0, 0, w, h);

  ctx.font = `${fontSize}px "IBM Plex Mono", monospace`;
  ctx.textAlign = "center";

  for (let i = 0; i < colCount; i++) {
    const y = columns[i] * fontSize;

    if (y > 0) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      // Head character
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
      ctx.fillText(char, i * fontSize + fontSize / 2, y);
    }

    if (y > h && Math.random() > 0.975) {
      columns[i] = 0;
    }
    columns[i]++;
  }
}

function onResize() { init(); }

onMounted(() => {
  init();
  raf = requestAnimationFrame(draw);
  window.addEventListener("resize", onResize, { passive: true });
});

onUnmounted(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener("resize", onResize);
});
</script>
