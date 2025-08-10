<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Update Banner</h1>
    <div class="card p-fluid">
      <div class="field">
        <label for="from">Display From</label>
        <InputText id="from" v-model="form.displayFrom" placeholder="yyyy-mm-ddTHH:MM:SSZ" />
      </div>
      <div class="field">
        <label for="to">Display To</label>
        <InputText id="to" v-model="form.displayTo" placeholder="yyyy-mm-ddTHH:MM:SSZ" />
      </div>
      <div class="field">
        <label for="message">Message</label>
        <Textarea id="message" v-model="form.message" rows="4" />
      </div>
      <div class="field-checkbox">
        <Checkbox inputId="isPublic" v-model="form.isPublic" binary />
        <label for="isPublic">Public</label>
      </div>
      <UiButton class="mt-3" :disabled="submitting" @click="submit">
        <template v-if="submitting">
          <span class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          Updating...
        </template>
        <template v-else>
          Update
        </template>
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import UiButton from '../components/ui/button.vue';
// Replaced deprecated adminService with bannerService
import { bannerService } from '../services/bannerService';

const toast = useToast();
const form = reactive({ displayFrom: '', displayTo: '', message: '', isPublic: false });
const submitting = ref(false);

const submit = async () => {
  if (submitting.value) return;
  submitting.value = true;
  try {
    await bannerService.upsertBanner({
      displayFrom: form.displayFrom || undefined,
      displayTo: form.displayTo || undefined,
      message: form.message,
      isPublic: form.isPublic,
    });
    toast.add({ severity: 'success', summary: 'Success', detail: 'Banner updated', life: 3000 });
    form.displayFrom = form.displayTo = form.message = '';
    form.isPublic = false;
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Failed to update banner', life: 3000 });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.card {
  max-width: 500px;
}
/* Legacy PrimeVue button style removed (now using UiButton) */
</style>
