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
      <Button label="Ban" class="p-button-danger mt-3" @click="submit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import { adminService } from '../services/adminService';

const toast = useToast();
const form = reactive({ email: '', duration: 60 });

const submit = async () => {
  try {
    await adminService.banUser({ email: form.email, duration: form.duration * 60000 });
    toast.add({ severity: 'success', summary: 'Success', detail: 'User banned', life: 3000 });
    form.email = '';
    form.duration = 60;
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Failed to ban user', life: 3000 });
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
