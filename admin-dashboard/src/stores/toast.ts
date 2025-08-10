import { ref } from 'vue';

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
  timeout?: number;
}

export const toasts = ref<ToastItem[]>([]);

export function useToast() {
  function push(t: Omit<ToastItem, 'id'>) {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { timeout: 3000, variant: 'default', ...t, id };
    toasts.value.push(item);
    if (item.timeout) setTimeout(() => dismiss(id), item.timeout);
  }
  function dismiss(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }
  return { toasts, push, dismiss };
}
