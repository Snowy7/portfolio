<template>
  <span class="font-plex text-inherit">{{ time || "--:--:--" }}</span>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const time = ref("");
let interval: ReturnType<typeof setInterval>;

function update() {
  const now = new Date();
  time.value = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

onMounted(() => {
  update();
  interval = setInterval(update, 1000);
});
onUnmounted(() => clearInterval(interval));
</script>
