<template>
  <span :class="['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', colorClass]">
    <slot />
  </span>
</template>
<script setup lang="ts">
const props = withDefaults(defineProps<{ variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' }>(), { variant: 'default' });
const colorClass = {
  default: 'bg-slate-200 text-slate-800',
  success: 'bg-emerald-100 text-emerald-700',
  danger: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700'
}[props.variant];
</script>
