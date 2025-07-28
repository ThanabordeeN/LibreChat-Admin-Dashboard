<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2 class="text-3xl font-bold text-center text-gray-800">Admin Dashboard</h2>
        <p class="text-center text-gray-500">Please sign in to continue</p>
      </div>
      <form @submit.prevent="login" class="mt-8 space-y-6">
        <div class="relative">
          <label for="email" class="sr-only">Email</label>
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <i class="pi pi-envelope text-gray-400"></i>
          </span>
          <input
            id="email"
            type="email"
            v-model="email"
            required
            class="w-full px-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email address"
          />
        </div>
        <div class="relative">
          <label for="password" class="sr-only">Password</label>
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <i class="pi pi-lock text-gray-400"></i>
          </span>
          <input
            id="password"
            type="password"
            v-model="password"
            required
            class="w-full px-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
          />
        </div>
        <div>
          <button
            type="submit"
            class="w-full px-6 py-3 mt-4 font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            :disabled="loading"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <i class="pi pi-spin pi-spinner mr-2"></i>
              Signing in...
            </span>
            <span v-else>Sign In</span>
          </button>
        </div>
        <div v-if="error" class="mt-4 text-center text-red-500">
          <small>{{ error }}</small>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

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

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
.login-box {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
.login-header {
  margin-bottom: 2rem;
}
</style>