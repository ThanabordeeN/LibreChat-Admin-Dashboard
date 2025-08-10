<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Ban User</h1>
    <div class="card p-fluid">
      <div class="field">
        <label for="email">Email</label>
        <InputText id="email" v-model="form.email" />
      </div>
      <div class="field">
        <label for="duration">Duration (minutes)</label>
        <InputNumber id="duration" v-model="form.duration" />
      </div>
      <UiButton variant="destructive" class="mt-3" :disabled="submitting" @click="submit">
        <template v-if="submitting">
          <span class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          Banning...
        </template>
        <template v-else>
          Ban
        </template>
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import UiButton from '../components/ui/button.vue';
// Replaced deprecated adminService with userService
// userService not used here after deprecation of direct email ban endpoint

const toast = useToast();
const form = reactive({ email: '', duration: 60 });
const submitting = ref(false);

const submit = async () => {
  if (submitting.value) return;
  submitting.value = true;
  try {
    // Still directing users to main Users page for ban action until email->id lookup implemented
    throw new Error('Use Users page to ban/unban users (email-based ban form deprecated).');
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.message || err.response?.data?.message || 'Failed to ban user', life: 3000 });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.card {
  max-width: 400px;
}
.p-button-danger {
  background: #dc2626;
  border: 1px solid #dc2626;
}
</style>
