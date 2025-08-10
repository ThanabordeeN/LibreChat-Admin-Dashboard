<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Create User</h1>
    <div class="card p-fluid">
      <div class="field">
        <label for="email">Email</label>
        <InputText id="email" v-model="form.email" />
      </div>
      <div class="field">
        <label for="name">Name</label>
        <InputText id="name" v-model="form.name" />
      </div>
      <div class="field">
        <label for="username">Username</label>
        <InputText id="username" v-model="form.username" />
      </div>
      <div class="field">
        <label for="password">Password</label>
        <Password id="password" v-model="form.password" toggleMask />
      </div>
      <div class="field-checkbox">
        <Checkbox inputId="emailVerified" v-model="form.emailVerified" binary />
        <label for="emailVerified">Email Verified</label>
      </div>
      <Button label="Create" class="p-button-primary mt-3" @click="submit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
// Replaced deprecated adminService with userService
import { userService } from '../services/userService';

const toast = useToast();
const form = reactive({ email: '', name: '', username: '', password: '', emailVerified: true });

const submit = async () => {
  try {
  await userService.createUser(form as any);
    toast.add({ severity: 'success', summary: 'Success', detail: 'User created', life: 3000 });
    form.email = form.name = form.username = form.password = '';
    form.emailVerified = true;
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Failed to create user', life: 3000 });
  }
};
</script>

<style scoped>
.card {
  max-width: 400px;
}
.p-button-primary {
  background: #4f46e5;
  border: 1px solid #4f46e5;
}
</style>
