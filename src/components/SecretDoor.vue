<template>
  <div
    class="inline-block cursor-pointer select-none"
    @click.prevent="handleClick"
  >
    <slot />
  </div>
  <Teleport to="body" v-if="mounted">
    <Transition name="door">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] overflow-y-auto"
      >
        <!-- Animated background -->
        <canvas ref="bgCanvas" class="fixed inset-0 z-0" />

        <!-- Close button -->
        <button
          @click="open = false"
          class="fixed top-6 right-6 z-50 text-white/30 hover:text-white text-xs tracking-wider transition-colors"
        >
          [ESC] CLOSE
        </button>

        <!-- Content -->
        <div class="relative z-10 min-h-screen flex items-center justify-center p-8">
          <div class="max-w-2xl w-full space-y-12 py-20">
            <!-- Header -->
            <div class="text-center">
              <div class="text-5xl mb-4">&#x1f30c;</div>
              <h2 class="font-anybody font-800 text-3xl md:text-4xl text-white tracking-tight mb-2">
                The Other Side
              </h2>
              <div class="flex items-center justify-center gap-4 mb-2">
                <img src="/images/me/islam-in-car.jpg" alt="Islam" class="w-20 h-20 rounded-full object-cover border-2 border-white/10" />
              </div>
              <p class="text-sm text-white/30">You found the hidden room. Here's the stuff that didn't fit on the main page.</p>
              <p class="text-[10px] text-white/15 mt-1">a.k.a. Snowy7</p>
            </div>

            <!-- Personal grid -->
            <div class="grid md:grid-cols-2 gap-4">
              <!-- The human behind the code -->
              <div class="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 space-y-3">
                <p class="text-[10px] tracking-[0.3em] uppercase text-green-400/50">The human</p>
                <div class="space-y-2 text-xs text-white/50">
                  <p>&#x1f3ae; Started coding 8+ years ago with game modding</p>
                  <p>&#x1f30d; Based in Doha, Qatar</p>
                  <p>&#x1f393; Studying Telecom & Network Engineering at UDST</p>
                  <p>&#x1f3c6; Led autonomous vehicle to 2nd place internationally</p>
                  <p>&#x1f9e9; Can solve a Rubik's cube (not speedcubing fast, but still)</p>
                  <p>&#x1f579; Snowy7 on every platform</p>
                </div>
              </div>

              <!-- Hot takes -->
              <div class="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 space-y-3">
                <p class="text-[10px] tracking-[0.3em] uppercase text-green-400/50">Hot takes</p>
                <div class="space-y-2 text-xs text-white/50">
                  <p>&#x1f525; Unity > Unreal for small teams</p>
                  <p>&#x1f525; Game jams teach more than bootcamps</p>
                  <p>&#x1f525; C# is the best language, no debate</p>
                  <p>&#x1f525; You don't need a CS degree to ship great software</p>
                  <p>&#x1f525; Autonomous vehicles are basically giant robots</p>
                  <p>&#x1f525; The best code is the code you delete</p>
                </div>
              </div>

              <!-- Origin story -->
              <div class="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 space-y-3">
                <p class="text-[10px] tracking-[0.3em] uppercase text-green-400/50">Origin story</p>
                <div class="space-y-2 text-xs text-white/50 leading-relaxed">
                  <p>Started with Unity tutorials at 13. First "game" was a cube that jumped. Showed it to everyone like I'd built Minecraft.</p>
                  <p>Won 3 game jam awards with Body Parts — a solo project made in 72 hours on caffeine and determination.</p>
                  <p>Built an autonomous car that drove itself in Poland. Debugging LiDAR data at 3 AM in a foreign country hits different.</p>
                </div>
              </div>

              <!-- Now playing -->
              <div class="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 space-y-3">
                <p class="text-[10px] tracking-[0.3em] uppercase text-green-400/50">On repeat</p>
                <div class="space-y-2 text-xs text-white/50">
                  <p>&#x1f4fa; Anime: Attack on Titan, Jujutsu Kaisen, Solo Leveling</p>
                  <p>&#x1f4d6; Manhwa/Manga rabbit hole enthusiast</p>
                  <p>&#x1f3b5; Game OSTs (Hollow Knight, Celeste)</p>
                  <p>&#x1f3b5; Lo-fi beats & Hans Zimmer soundtracks</p>
                  <p>&#x1f3b5; Arabic classics when nostalgic</p>
                </div>
                <p class="text-[10px] text-white/20 mt-2">Anime + manga + lo-fi = the holy trinity</p>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div v-for="stat in stats" :key="stat.label" class="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 text-center">
                <p class="font-anybody font-800 text-2xl text-green-400">{{ stat.value }}</p>
                <p class="text-[10px] text-white/30 mt-1">{{ stat.label }}</p>
              </div>
            </div>

            <!-- Footer -->
            <div class="text-center space-y-2">
              <p class="text-xs text-white/20">Built with Astro + Vue + Tailwind. Crafted with way too many iterations.</p>
              <p class="text-[10px] text-white/10">Thanks for exploring. You're the curious type — that's rare.</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";

const clicks = ref(0);
const open = ref(false);
const mounted = ref(false);
const bgCanvas = ref<HTMLCanvasElement | null>(null);
const pageCount = 20;
let clickTimer: ReturnType<typeof setTimeout> | null = null;
let raf = 0;

const stats = [
  { value: "8+", label: "Years coding" },
  { value: "4", label: "Game jam awards" },
  { value: "2nd", label: "Shell Eco-Marathon" },
  { value: "1", label: "Rubik's cube" },
];

function handleClick() {
  clicks.value++;

  // Reset click count after 2 seconds of no clicks
  if (clickTimer) clearTimeout(clickTimer);
  clickTimer = setTimeout(() => {
    if (!open.value) clicks.value = 0;
  }, 2000);

  if (clicks.value >= 5) {
    open.value = true;
    clicks.value = 0;
  }
}

// ─── Animated particle background ───
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  pulse: number;
}

let particles: Particle[] = [];

function initParticles() {
  const canvas = bgCanvas.value;
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  particles = [];
  const count = Math.floor((window.innerWidth * window.innerHeight) / 8000);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    });
  }
}

function drawParticles(now: number) {
  const canvas = bgCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = window.innerWidth;
  const h = window.innerHeight;

  ctx.fillStyle = "rgba(0, 0, 0, 0.92)";
  ctx.fillRect(0, 0, w, h);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;

    const pulse = Math.sin(now * 0.001 + p.pulse) * 0.5 + 0.5;
    const alpha = p.alpha * (0.5 + pulse * 0.5);
    ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw connections between nearby particles
  const maxDist = 120;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.08;
        ctx.strokeStyle = `rgba(34, 197, 94, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  raf = requestAnimationFrame(drawParticles);
}

function handleEsc(e: KeyboardEvent) {
  if (e.key === "Escape" && open.value) {
    open.value = false;
  }
}

function handleResize() {
  if (open.value) initParticles();
}

watch(open, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      initParticles();
      raf = requestAnimationFrame(drawParticles);
    });
    document.body.style.overflow = "hidden";
  } else {
    cancelAnimationFrame(raf);
    document.body.style.overflow = "";
  }
});

onMounted(() => {
  mounted.value = true;
  window.addEventListener("keydown", handleEsc);
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener("keydown", handleEsc);
  window.removeEventListener("resize", handleResize);
  document.body.style.overflow = "";
});
</script>

<style scoped>
.door-enter-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.door-leave-active {
  transition: all 0.3s ease-in;
}
.door-enter-from {
  opacity: 0;
  transform: scale(1.05);
}
.door-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
