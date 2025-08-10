<template>
  <div class="h-screen flex bg-slate-50 text-slate-900">
    <!-- Sidebar -->
    <aside class="hidden md:flex w-60 shrink-0 flex-col border-r bg-white">
      <div class="h-14 flex items-center gap-2 px-4 border-b">
        <span class="text-sm font-semibold tracking-tight">Admin Console</span>
      </div>
      <nav class="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        <button v-for="item in nav" :key="item.to" @click="go(item.to)" :class="navBtn(item.to)">
          <span>{{ item.label }}</span>
        </button>
      </nav>
      <div class="p-4 border-t">
        <Button variant="outline" class="w-full justify-center" @click="logout">Logout</Button>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex flex-col flex-1 min-w-0">
      <header class="h-14 flex items-center gap-4 border-b bg-white px-4 md:hidden">
        <div class="flex-1 font-semibold">Admin</div>
        <Button size="sm" variant="outline" @click="logout">Logout</Button>
      </header>
      <main class="flex-1 overflow-auto p-4">
        <router-view />
      </main>
    </div>
    <ToastProvider />
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import Button from '../components/ui/button.vue';
import ToastProvider from '../components/ui/toast-provider.vue';
import { useAuthStore } from '../stores/auth';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const nav = [
  { label: 'Users', to: '/' },
  { label: 'Balance', to: '/balance' },
  { label: 'Banners', to: '/banners' },
  { label: 'Create User', to: '/create-user' },
  { label: 'Ban User', to: '/ban-user' },
  { label: 'Update Banner', to: '/update-banner' },
];

function go(to: string) { router.push(to); }
function logout() { auth.logout(); router.push({ name: 'login' }); }
const navBtn = (path: string) => computed(() => [
  'w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 transition',
  route.path === path ? 'bg-slate-100 text-slate-900' : 'text-slate-600'
]).value;
</script>

<style scoped></style>
