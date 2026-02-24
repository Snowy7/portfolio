<template>
  <nav class="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-b border-[#1a1a1a]">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between text-xs">
      <!-- Logo with SecretDoor -->
      <slot name="logo" />

      <!-- Desktop nav -->
      <div class="hidden md:flex items-center gap-5 text-[#666]">
        <a :href="isHome ? '#about' : '/'" class="hover:text-green-400 transition-colors">{{ isHome ? 'About' : 'Home' }}</a>
        <a href="/projects" class="hover:text-green-400 transition-colors">Projects</a>
        <a href="/blog" class="hover:text-green-400 transition-colors">Blog</a>
        <a :href="isHome ? '#contact' : '/#contact'" class="hover:text-green-400 transition-colors">Contact</a>
        <button
          @click="$emit('openTerminal')"
          class="p-1.5 text-[#555] hover:text-green-400 transition-colors"
          title="Terminal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      <!-- Mobile hamburger -->
      <button @click="mobileOpen = !mobileOpen" class="md:hidden p-2 text-[#666]">
        <svg v-if="!mobileOpen" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile menu -->
    <Transition name="menu">
      <div
        v-if="mobileOpen"
        class="md:hidden bg-[#0a0a0a] border-t border-[#1a1a1a] px-4 py-4 space-y-1"
      >
        <a :href="isHome ? '#about' : '/'" @click="mobileOpen = false" class="block py-2.5 text-sm text-[#888] hover:text-green-400 transition-colors">{{ isHome ? 'About' : 'Home' }}</a>
        <a href="/projects" @click="mobileOpen = false" class="block py-2.5 text-sm text-[#888] hover:text-green-400 transition-colors">Projects</a>
        <a href="/blog" @click="mobileOpen = false" class="block py-2.5 text-sm text-[#888] hover:text-green-400 transition-colors">Blog</a>
        <a :href="isHome ? '#contact' : '/#contact'" @click="mobileOpen = false" class="block py-2.5 text-sm text-[#888] hover:text-green-400 transition-colors">Contact</a>
        <button
          @click="$emit('openTerminal'); mobileOpen = false"
          class="flex items-center gap-2 w-full py-2.5 text-sm text-green-400/70 hover:text-green-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Open Terminal
        </button>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{ isHome?: boolean }>();
defineEmits(["openTerminal"]);

const mobileOpen = ref(false);
</script>

<style scoped>
.menu-enter-active { transition: all 0.2s ease-out; }
.menu-leave-active { transition: all 0.15s ease-in; }
.menu-enter-from { opacity: 0; transform: translateY(-8px); }
.menu-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
