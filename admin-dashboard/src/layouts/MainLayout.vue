<template>
  <div class="main-layout">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <h1 class="app-title">Admin Dashboard</h1>
        <Button 
          label="Logout" 
          icon="pi pi-sign-out" 
          class="p-button-danger p-button-text logout-btn" 
          @click="logout"
        />
      </div>
    </header>

    <div class="layout-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <Menubar :model="items" orientation="vertical" class="p-menubar-vertical" />
      </aside>

      <!-- Main Content -->
      <main class="layout-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </main>
    </div>

    <Toast />
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Menubar from 'primevue/menubar';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const logout = () => {
  authStore.logout();
  router.push({ name: 'login' });
};

const items = ref([
  { 
    label: 'Users', 
    icon: 'pi pi-fw pi-users', 
    command: () => router.push('/') 
  },
  { 
    label: 'Balance', 
    icon: 'pi pi-fw pi-dollar', 
    command: () => router.push('/balance') 
  },
  { 
    label: 'Banners', 
    icon: 'pi pi-fw pi-megaphone', 
    command: () => router.push('/banners') 
  }
]);
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--surface-ground);
}

.header {
  background: linear-gradient(90deg, var(--primary-color), var(--primary-color-light));
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 0 1.5rem;
  height: 60px;
  display: flex;
  align-items: center;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 100%;
}

.app-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border: none !important;
  color: white !important;
  padding: 0.5rem 1rem !important;
  border-radius: 6px !important;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
}

.layout-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 250px;
  flex-shrink: 0;
  background: var(--surface-card);
  border-right: 1px solid var(--surface-border);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  z-index: 90;
  overflow-y: auto;
}

.sidebar :deep(.p-menubar) {
  border: none;
  background: transparent;
  padding: 1rem 0;
}

.sidebar :deep(.p-menuitem) {
  margin: 0.25rem 0;
}

.sidebar :deep(.p-menuitem-link) {
  padding: 0.85rem 1.25rem;
  color: var(--text-color);
  border-radius: 0;
  gap: 0.75rem;
  margin: 0 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.sidebar :deep(.p-menuitem-link:hover) {
  background: var(--surface-hover);
  color: var(--primary-color);
}

.sidebar :deep(.p-menuitem-link:focus) {
  outline: 0 none;
  outline-offset: 0;
  box-shadow: inset 0 0 0 1px var(--primary-color);
}

.sidebar :deep(.p-menuitem-icon) {
  font-size: 1.25rem;
}

.sidebar :deep(.p-menuitem-text) {
  font-size: 1rem;
  font-weight: 500;
}

.layout-content {
  flex: 1;
  overflow: auto;
  padding: 1.5rem;
  background: var(--surface-ground);
}

.content-wrapper {
  max-width: 100%;
  margin: 0 auto;
  width: 100%;
}

/* Responsive design */
@media (max-width: 768px) {
  .header {
    padding: 0 1rem;
    height: 56px;
  }
  
  .app-title {
    font-size: 1.25rem;
  }
  
  .sidebar {
    width: 200px;
  }
  
  .layout-content {
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .header {
    padding: 0 0.75rem;
  }
  
  .app-title {
    font-size: 1.1rem;
  }
  
  .logout-btn {
    padding: 0.4rem 0.75rem !important;
    font-size: 0.85rem !important;
  }
  
  .sidebar {
    width: 60px;
  }
  
  .sidebar :deep(.p-menuitem-text) {
    display: none;
  }
  
  .sidebar :deep(.p-menuitem-link) {
    justify-content: center;
    padding: 1rem;
  }
  
  .layout-content {
    padding: 0.75rem;
  }
}
</style>
