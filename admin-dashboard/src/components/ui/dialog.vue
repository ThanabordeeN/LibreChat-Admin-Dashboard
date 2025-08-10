<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />
    <div class="relative w-full max-w-lg rounded-lg border bg-white shadow-lg p-6 space-y-4 animate-in fade-in zoom-in-95">
      <header v-if="title" class="flex items-start justify-between gap-4">
        <h2 class="text-base font-semibold leading-none tracking-tight">{{ title }}</h2>
        <button @click="emit('close')" class="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100">
          <span class="sr-only">Close</span>
          ✕
        </button>
      </header>
      <div class="text-sm text-slate-600">
        <slot />
      </div>
      <footer class="flex justify-end gap-2 pt-2">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ open: boolean; title?: string }>();
const emit = defineEmits(['close']);
</script>
<style scoped>
@keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes zoom-in-95 { from { transform: scale(.95) } to { transform: scale(1) } }
.animate-in { animation: fade-in .15s ease, zoom-in-95 .15s ease; }
</style>
