<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../lib/utils';

interface Props {
  modelValue: string | number | null;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const classes = computed(() => cn(
  'flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
));
</script>
<template>
  <input :type="props.type || 'text'" :value="props.modelValue ?? ''" :placeholder="props.placeholder" :disabled="props.disabled" :class="classes" @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
</template>
