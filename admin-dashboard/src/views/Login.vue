<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
    <div class="w-full max-w-md rounded-xl border bg-white shadow-sm p-8 space-y-6">
      <header class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p class="text-sm text-slate-500">Sign in to manage users & system settings.</p>
      </header>
      <form @submit.prevent="login" class="space-y-5">
        <div class="space-y-2">
          <label for="email" class="text-sm font-medium text-slate-700">Email</label>
          <input id="email" type="email" v-model="email" required autocomplete="username"
            class="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="you@example.com" />
        </div>
        <div class="space-y-2">
          <label for="password" class="text-sm font-medium text-slate-700">Password</label>
          <input id="password" type="password" v-model="password" required autocomplete="current-password"
            class="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="••••••••" />
        </div>
        <Button :disabled="loading" class="w-full h-10" :variant="'default'">
          <span v-if="loading" class="flex items-center gap-2"><span class="animate-spin h-4 w-4 border-2 border-slate-200 border-t-slate-600 rounded-full" />Signing in...</span>
          <span v-else>Sign In</span>
        </Button>
        <p v-if="error" class="text-sm text-red-600 text-center">{{ error }}</p>
      </form>
      <footer class="pt-2">
        <p class="text-xs text-slate-400 text-center">&copy; {{ new Date().getFullYear() }} Admin Console</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Button from '../components/ui/button.vue';

const email = ref('admin@example.com'); // Default for easy testing
const password = ref('password'); // Default for easy testing
const error = ref<string | null>(null);
const loading = ref(false);
const router = useRouter();
const authStore = useAuthStore();

const login = async () => {
  error.value = null;
  loading.value = true;
  try {
    await authStore.login(email.value, password.value);
    router.push({ name: 'users' });
  } catch (err: any) {
    error.value = err.message || 'Login failed. Please check your credentials.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped></style>