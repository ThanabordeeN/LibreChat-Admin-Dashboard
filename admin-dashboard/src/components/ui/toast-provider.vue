<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
    <transition-group name="toast-fade" tag="div">
      <div v-for="t in toasts" :key="t.id" :class="['rounded-md border p-4 shadow bg-white', variantClass(t.variant)]">
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <p v-if="t.title" class="text-sm font-medium leading-none">{{ t.title }}</p>
            <p v-if="t.description" class="text-xs text-slate-600">{{ t.description }}</p>
          </div>
          <button @click="dismiss(t.id)" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
        </div>
      </div>
    </transition-group>
  </div>
</template>
<script setup lang="ts">
import { toasts, useToast } from '../../stores/toast';
const { dismiss } = useToast();
function variantClass(v?: string) {
  switch (v) {
    case 'success': return 'border-emerald-200';
    case 'error': return 'border-red-200';
    default: return 'border-slate-200';
  }
}
</script>
<style scoped>
.toast-fade-enter-active,.toast-fade-leave-active { transition: all .15s ease; }
.toast-fade-enter-from { opacity:0; transform: translateY(-4px); }
.toast-fade-leave-to { opacity:0; transform: translateY(-4px); }
</style>
