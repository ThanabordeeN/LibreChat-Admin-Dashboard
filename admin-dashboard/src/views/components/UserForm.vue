<template>
  <Dialog
    :visible="visible"
    :style="{ width: '450px' }"
    header="User Details"
    :modal="true"
    class="p-fluid"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="field">
      <label for="email">Email</label>
      <InputText
        id="email"
        v-model.trim="user.email"
        required="true"
        autofocus
        :class="{ 'p-invalid': submitted && !user.email }"
      />
      <small class="p-error" v-if="submitted && !user.email"
        >Email is required.</small
      >
    </div>
    <div class="field">
      <label for="name">Name</label>
      <InputText id="name" v-model.trim="user.name" />
    </div>
    <div class="field">
      <label for="role">Role</label>
      <Dropdown
        id="role"
        v-model="user.role"
        :options="roles"
        placeholder="Select a Role"
      />
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
      <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveUser" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  visible: Boolean,
  user: Object,
});

const emit = defineEmits(['update:visible', 'save']);

const user = ref(props.user || {});
const submitted = ref(false);
const roles = ref(['user', 'admin']);

watch(
  () => props.user,
  (newUser) => {
    user.value = newUser || {};
  },
  { deep: true },
);

const hideDialog = () => {
  emit('update:visible', false);
};

const saveUser = () => {
  submitted.value = true;
  if (user.value.email) {
    emit('save', user.value);
  }
};
</script>
