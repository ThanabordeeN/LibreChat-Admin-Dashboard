<template>
  <Menubar :model="items" class="app-header">
    <template #start>
      <div class="flex items-center">
        <i class="pi pi-th-large text-2xl text-primary mr-3"></i>
        <h1 class="text-xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>
    </template>
    <template #item="{ item, props }">
      <router-link :to="item.to" v-bind="props.action" class="flex items-center p-menuitem-link">
        <span :class="item.icon" />
        <span class="ml-2">{{ item.label }}</span>
      </router-link>
    </template>
    <template #end>
      <Button 
        label="Logout" 
        icon="pi pi-power-off" 
        class="p-button-danger p-button-outlined"
        @click="logout" 
      />
    </template>
  </Menubar>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const items = ref([
  {
    label: 'Users',
    icon: 'pi pi-fw pi-users',
    to: '/',
  },
  {
    label: 'Balance',
    icon: 'pi pi-fw pi-dollar',
    to: '/balance',
  },
  {
    label: 'Banners',
    icon: 'pi pi-fw pi-megaphone',
    to: '/banners',
  },
]);

const logout = () => {
  authStore.logout();
  router.push({ name: 'login' });
};
</script>

<style scoped>
.app-header {
  padding: 0.5rem 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 0;
}

.p-menubar {
  border-radius: 0;
}

.p-menuitem-link {
    text-decoration: none;
}

.p-button-danger.p-button-outlined {
    color: #ef4444;
    border-color: #ef4444;
}
</style>