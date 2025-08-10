<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold tracking-tight">Banner Management</h1>
  <UiButton size="sm" @click="openNew">{{ banner.bannerId ? 'Edit Banner' : 'New Banner' }}</UiButton>
    </div>

    <div class="rounded-lg border bg-white shadow-sm p-6" v-if="loading">Loading banner...</div>
    <div v-else class="rounded-lg border bg-white shadow-sm">
      <div v-if="bannerData" class="p-6 space-y-4">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-2 w-full">
            <p class="text-sm text-slate-500">Active Banner</p>
            <p class="text-base font-medium leading-relaxed whitespace-pre-wrap">{{ bannerData.message }}</p>
            <p class="text-xs text-slate-500" v-if="bannerData.displayFrom">From: {{ formatDate(bannerData.displayFrom) }} <span v-if="bannerData.displayTo">→ {{ formatDate(bannerData.displayTo) }}</span></p>
            <p class="text-xs text-amber-600" v-if="durationMinutes">Duration: {{ durationMinutes }} min</p>
          </div>
          <div class="flex flex-col gap-2">
            <UiButton size="sm" variant="outline" @click="openNew">Edit</UiButton>
            <UiButton size="sm" variant="destructive" @click="askDelete">Delete</UiButton>
          </div>
        </div>
      </div>
      <div v-else class="p-6 text-sm text-slate-500">No banner set.</div>
    </div>

  <UiDialog :open="bannerDialog" :title="banner.bannerId ? 'Edit Banner' : 'Create Banner'" @close="hideDialog">
      <form class="space-y-4" @submit.prevent="saveBanner">
        <div class="space-y-2">
          <UiLabel for="message">Message</UiLabel>
          <textarea id="message" v-model="banner.message" rows="4" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
          <p class="text-xs text-red-500" v-if="submitted && !banner.message">Message required</p>
        </div>
        <div class="space-y-2">
          <UiLabel for="duration">Duration (minutes)</UiLabel>
          <UiInput id="duration" type="number" min="1" v-model.number="(banner.duration as number)" />
          <p class="text-xs text-red-500" v-if="submitted && (!banner.duration || banner.duration <=0)">Valid duration required</p>
        </div>
      </form>
      <template #footer>
        <UiButton variant="outline" @click="hideDialog">Cancel</UiButton>
  <UiButton @click="saveBanner" :disabled="!banner.message || !banner.duration || banner.duration<=0">Save</UiButton>
      </template>
    </UiDialog>

    <UiDialog :open="deleteDialog" title="Delete Banner" @close="deleteDialog=false">
      <p class="text-sm mb-4">Delete current banner?</p>
      <template #footer>
        <UiButton variant="outline" @click="deleteDialog=false">Cancel</UiButton>
        <UiButton variant="destructive" @click="confirmDelete">Delete</UiButton>
      </template>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { bannerService, type Banner as ApiBanner } from '../services/bannerService';
import UiButton from '../components/ui/button.vue';
import UiDialog from '../components/ui/dialog.vue';
import UiInput from '../components/ui/input.vue';
import UiLabel from '../components/ui/label.vue';
import { useToast } from '../stores/toast';

const { push } = useToast();
const loading = ref(false);
const bannerData = ref<ApiBanner | null>(null);
const banner = ref<{ bannerId?: string; message: string; duration?: number }>({ message: '', duration: 60 });
const bannerDialog = ref(false);
const submitted = ref(false);
const deleteDialog = ref(false);

async function load() {
  loading.value = true;
  try {
    const b = await bannerService.getBanner();
    if (b) {
      const from = b.displayFrom ? new Date(b.displayFrom).getTime() : Date.now();
      const to = b.displayTo ? new Date(b.displayTo).getTime() : null;
      const duration = to ? Math.round((to - from) / 60000) : 0;
      bannerData.value = b;
      banner.value = { bannerId: (b as any).bannerId, message: b.message, duration: duration || 60 };
    } else {
      bannerData.value = null;
    }
  } catch (e) {
    push({ variant: 'error', title: 'Error', description: 'Failed to fetch banner' });
  } finally {
    loading.value = false;
  }
}
onMounted(load);

function openNew() {
  submitted.value = false;
  if (!bannerData.value) {
    banner.value = { message: '', duration: 60 };
  }
  bannerDialog.value = true;
}
function hideDialog() { bannerDialog.value = false; }

async function saveBanner() {
  submitted.value = true;
  if (!banner.value.message || !banner.value.duration || banner.value.duration <= 0) return;
  const now = new Date();
  const payload: ApiBanner = {
    message: banner.value.message,
    displayFrom: now.toISOString(),
    displayTo: new Date(now.getTime() + (banner.value.duration || 0) * 60000).toISOString(),
  } as any;
  try {
    await bannerService.upsertBanner(payload);
    push({ variant: 'success', title: 'Saved', description: 'Banner saved' });
    bannerDialog.value = false;
    load();
  } catch (e) {
    push({ variant: 'error', title: 'Error', description: 'Save failed' });
  }
}

function askDelete() { deleteDialog.value = true; }
async function confirmDelete() {
  try {
    await bannerService.deleteBanner();
    push({ variant: 'success', title: 'Deleted', description: 'Banner removed' });
    deleteDialog.value = false;
    load();
  } catch (e) {
    push({ variant: 'error', title: 'Error', description: 'Delete failed' });
  }
}

const durationMinutes = computed(() => {
  if (!bannerData.value?.displayFrom || !bannerData.value?.displayTo) return null;
  const from = new Date(bannerData.value.displayFrom).getTime();
  const to = new Date(bannerData.value.displayTo).getTime();
  return Math.round((to - from) / 60000);
});
function formatDate(d: any) { return new Date(d).toLocaleString(); }

// silence unused warnings
void durationMinutes;
</script>

<style scoped></style>