<template>
  <MatrixRain color="#22c55e" :opacity="0.4" :speed="0.8" />

  <NavBar :isHome="isHome" @openTerminal="terminalRef?.open()">
    <template #logo>
      <SecretDoor>
        <span class="text-green-400 font-bold tracking-wider cursor-pointer font-plex text-xs">ISLAM</span>
      </SecretDoor>
    </template>
  </NavBar>

  <TerminalWindow ref="terminalRef" />

  <!-- Page content slot rendered via default slot -->
  <slot />
</template>

<script setup lang="ts">
import { ref } from "vue";
import MatrixRain from "./MatrixRain.vue";
import NavBar from "./NavBar.vue";
import SecretDoor from "./SecretDoor.vue";
import TerminalWindow from "./TerminalWindow.vue";

defineProps<{ isHome?: boolean }>();

const terminalRef = ref<InstanceType<typeof TerminalWindow> | null>(null);
</script>
