<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../lib/utils';

interface Props {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'minimal';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
}

const props = defineProps<Props>();

// Added transition-transform + subtle hover/active interaction classes
const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background hover:shadow-sm active:scale-95';

const variants: Record<string, string> = {
  default: 'bg-blue-600 text-white hover:bg-blue-600/90',
  destructive: 'bg-red-600 text-white hover:bg-red-600/90',
  outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  ghost: 'hover:bg-gray-100 hover:text-gray-900',
  link: 'text-blue-600 underline-offset-4 hover:underline',
  minimal: 'bg-transparent text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-2'
};

const sizes: Record<string, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10'
};

const classes = computed(() => cn(
  base,
  variants[props.variant || 'default'],
  sizes[props.size || 'default']
));
</script>

<template>
  <button :disabled="props.disabled" :class="classes">
    <slot />
  </button>
</template>
