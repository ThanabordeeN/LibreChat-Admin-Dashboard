<template>
  <div class="users-view">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-800">User Management</h1>
      <Button
        label="New User"
        icon="pi pi-plus"
        class="p-button-primary"
        @click="openNew"
      />
    </div>

    <div class="card">
      <DataTable
        :value="mappedUsers"
        :loading="loading"
        dataKey="id"
        :paginator="true"
        :rows="10"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
        responsiveLayout="scroll"
      >
        <template #header>
          <div class="table-header">
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </span>
          </div>
        </template>
        <Column field="email" header="Email" :sortable="true"></Column>
        <Column field="name" header="Name" :sortable="true"></Column>
        <Column field="role" header="Role" :sortable="true">
          <template #body="slotProps">
            <span :class="['role-badge', `role-${slotProps.data.role}`]">{{ slotProps.data.role }}</span>
          </template>
        </Column>
        <Column header="Status" :sortable="true" field="banned">
            <template #body="slotProps">
                <span :class="['status-badge', slotProps.data.banned ? 'status-banned' : 'status-active']">
                {{ slotProps.data.banned ? 'Banned' : 'Active' }}
                </span>
            </template>
        </Column>
        <Column :exportable="false" header="Actions" style="min-width: 12rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editUser(slotProps.data)" v-tooltip.top="'Edit'" />
            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mr-2" @click="confirmDeleteUser(slotProps.data)" v-tooltip.top="'Delete'" />
            <Button 
              :icon="slotProps.data.banned ? 'pi pi-unlock' : 'pi pi-lock'" 
              :class="['p-button-rounded', slotProps.data.banned ? 'p-button-help' : 'p-button-danger']" 
              @click="toggleBanUser(slotProps.data)"
              v-tooltip.top="slotProps.data.banned ? 'Unban' : 'Ban'"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <UserForm
      :visible="userDialog"
      :user="user"
      @update:visible="userDialog = $event"
      @save="saveUser"
    />
    
    <Dialog v-model:visible="banReasonDialog" header="Confirm Ban" modal :style="{ width: '450px' }">
      <div class="p-fluid">
        <p class="mb-4">Are you sure you want to ban <strong>{{ banningUser?.email }}</strong>? Please provide the ban details.</p>
        <div class="field">
          <label for="ban-start">Start Date</label>
          <Calendar id="ban-start" v-model="banStartDate" showIcon dateFormat="yy-mm-dd" class="w-full" />
        </div>
        <div class="field">
          <label for="ban-end">End Date</label>
          <Calendar id="ban-end" v-model="banEndDate" showIcon dateFormat="yy-mm-dd" class="w-full" />
        </div>
        <div class="field">
          <label for="ban-message">Reason</label>
          <Textarea id="ban-message" v-model="banMessage" :autoResize="true" rows="3" placeholder="Reason for banning" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="banReasonDialog = false" />
        <Button label="Confirm Ban" icon="pi pi-check" class="p-button-danger" @click="confirmBanUser" :disabled="!banStartDate || !banEndDate || !banMessage.trim()" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useUsers } from '../composables/useUsers';
import UserForm from './components/UserForm.vue';
import { bannerService, type Banner } from '../services/bannerService';
import type { User } from '../types/user';

// --- State ---
const {
  users,
  loading,
  fetchUsers: fetchRawUsers,
  saveUser: saveUserData,
  deleteUser: deleteUserFn,
  banUser,
  unbanUser,
} = useUsers();

const toast = useToast();
const confirm = useConfirm();

const userDialog = ref(false);
const user = ref<Partial<User>>({});
const filters = ref({ 'global': { value: null, matchMode: FilterMatchMode.CONTAINS } });
const mappedUsers = computed(() => Array.isArray(users.value) ? users.value.map((u: any) => ({ ...u, id: u._id })) : []);

// Ban-related state
const banReasonDialog = ref(false);
const banStartDate = ref<Date | null>(null);
const banEndDate = ref<Date | null>(null);
const banMessage = ref('');
const banningUser = ref<any>(null);

// --- Methods ---
const fetchUsers = async () => {
  await fetchRawUsers();
};

onMounted(fetchUsers);

const openNew = () => {
  user.value = {};
  userDialog.value = true;
};

const saveUser = async (userData: User) => {
  const success = await saveUserData(userData);
  if (success) {
    userDialog.value = false;
    toast.add({ severity: 'success', summary: 'Success', detail: `User ${userData.id ? 'Updated' : 'Created'}`, life: 3000 });
    fetchUsers();
  }
};

const editUser = (editUser: User) => {
  user.value = { ...editUser };
  userDialog.value = true;
};

const confirmDeleteUser = (userToDelete: User) => {
  confirm.require({
    message: `Are you sure you want to delete ${userToDelete.name || userToDelete.email}?`,
    header: 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const success = await deleteUserFn(userToDelete);
      if (success) {
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'User has been removed.', life: 3000 });
        fetchUsers();
      }
    },
  });
};

const toggleBanUser = async (userToToggle: any) => {
  if (userToToggle.banned) {
    // Unban logic
    confirm.require({
        message: `Are you sure you want to unban ${userToToggle.email}?`,
        header: 'Confirm Unban',
        icon: 'pi pi-unlock',
        accept: async () => {
            try {
                await unbanUser(userToToggle);
                toast.add({ severity: 'success', summary: 'Unbanned', detail: 'User has been unbanned.', life: 3000 });
                fetchUsers();
            } catch (error) {
                console.error('Failed to unban:', error);
                toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to unban user.', life: 3000 });
            }
        }
    });
  } else {
    // Open ban dialog
    banningUser.value = userToToggle;
    banReasonDialog.value = true;
    // Reset fields
    banStartDate.value = new Date();
    banEndDate.value = null;
    banMessage.value = '';
  }
};

const confirmBanUser = async () => {
  if (!banningUser.value) return;
  const userToBan = banningUser.value;

  const banner: Banner = {
    message: banMessage.value,
    displayFrom: banStartDate.value ? banStartDate.value.toISOString() : undefined,
    displayTo: banEndDate.value ? banEndDate.value.toISOString() : undefined,
  };

  try {
  await bannerService.upsertBanner(banner);
  await banUser(userToBan);
    toast.add({ severity: 'success', summary: 'Banned', detail: 'User has been banned successfully.', life: 3000 });
    
    // Cleanup and refresh
    banReasonDialog.value = false;
    banningUser.value = null;
    fetchUsers();
  } catch (error) {
      console.error('Failed to ban:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to ban user.', life: 3000 });
  }
};

</script>

<style scoped>
.users-view {
  padding: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-header {
  display: flex;
  justify-content: flex-end;
}

.p-input-icon-left > .p-inputtext {
  border-radius: 8px;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.role-admin {
  background-color: #d1fae5;
  color: #065f46;
}

.role-user {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-active {
    background-color: #cce7e0;
    color: #0d6b53;
}

.status-banned {
    background-color: #f8d7da;
    color: #721c24;
}

.p-button-primary {
    background: #4f46e5;
    border: 1px solid #4f46e5;
}
</style>