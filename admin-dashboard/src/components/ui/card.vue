<template>
  <div :class="['rounded-lg border bg-white shadow-sm', padding ? 'p-6' : '']">
    <slot />
  </div>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ padding?: boolean }>(), { padding: true });
</script>
