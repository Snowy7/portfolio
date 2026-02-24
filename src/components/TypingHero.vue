<template>
  <p class="text-sm text-[#666] h-6 font-plex">
    <span class="text-lime-400/50">></span> {{ displayText }}<span class="inline-block w-[2px] h-4 bg-lime-400/60 ml-0.5 align-middle" :class="{ 'opacity-0': !cursorVisible }"></span>
  </p>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const phrases = [
  "I build things for the web.",
  "I write code that humans can read.",
  "I turn ideas into shipped products.",
  "I care about performance & accessibility.",
  "I'm probably refactoring something right now.",
];

const displayText = ref("");
const cursorVisible = ref(true);
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let timeout: ReturnType<typeof setTimeout>;
let cursorInterval: ReturnType<typeof setInterval>;

function tick() {
  const current = phrases[phraseIndex];

  if (!isDeleting) {
    displayText.value = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      isDeleting = true;
      timeout = setTimeout(tick, 2000);
      return;
    }
    timeout = setTimeout(tick, 50 + Math.random() * 40);
  } else {
    displayText.value = current.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      timeout = setTimeout(tick, 400);
      return;
    }
    timeout = setTimeout(tick, 25);
  }
}

onMounted(() => {
  tick();
  cursorInterval = setInterval(() => {
    cursorVisible.value = !cursorVisible.value;
  }, 530);
});

onUnmounted(() => {
  clearTimeout(timeout);
  clearInterval(cursorInterval);
});
</script>
