<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold tracking-tight">User Management</h1>
      <UiButton variant="default" size="sm" @click="openNew">New User</UiButton>
    </div>

    <div class="rounded-lg border bg-white shadow-sm">
      <div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between border-b bg-slate-50/60">
        <div class="flex w-full max-w-sm items-center gap-2">
          <UiInput v-model="search" placeholder="Search users..." class="h-9" />
        </div>
        <div class="text-xs text-slate-500">Showing {{ pageStart + 1 }}-{{ pageEnd }} of {{ filteredUsers.length }} users</div>
      </div>
      <div class="overflow-x-auto">
        <UiTable class="min-w-full">
          <UiThead>
            <UiTr>
              <UiTh>Email</UiTh>
              <UiTh>Name</UiTh>
              <UiTh>Role</UiTh>
              <UiTh>Status</UiTh>
              <UiTh class="text-right">Actions</UiTh>
            </UiTr>
          </UiThead>
          <UiTbody>
            <UiTr v-for="u in pagedUsers" :key="u.id" class="hover:bg-slate-50">
              <UiTd class="font-medium">{{ u.email }}</UiTd>
              <UiTd>{{ u.name }}</UiTd>
              <UiTd>
                <span :class="roleChipClass(u.role)">{{ u.role || 'user' }}</span>
              </UiTd>
              <UiTd>
                <span :class="statusChipClass(u.banned)">{{ u.banned ? 'Banned' : 'Active' }}</span>
              </UiTd>
              <UiTd class="flex justify-end gap-2">
                <UiButton variant="outline" size="sm" @click="editUser(u)">Edit</UiButton>
                <UiButton variant="destructive" size="sm" @click="askDelete(u)">Delete</UiButton>
                <UiButton :variant="u.banned ? 'secondary' : 'destructive'" size="sm" @click="toggleBanUser(u)">{{ u.banned ? 'Unban' : 'Ban' }}</UiButton>
              </UiTd>
            </UiTr>
            <UiTr v-if="!loading && !pagedUsers.length">
              <UiTd colspan="5" class="text-center text-sm text-slate-500 py-10">No users found.</UiTd>
            </UiTr>
            <UiTr v-if="loading">
              <UiTd colspan="5" class="text-center text-sm text-slate-500 py-10">Loading...</UiTd>
            </UiTr>
          </UiTbody>
        </UiTable>
      </div>
      <div class="flex items-center justify-between gap-4 p-4 border-t">
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <span>Rows:</span>
          <select v-model.number="rows" class="h-8 rounded border border-slate-300 bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-400">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="25">25</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <UiButton variant="outline" size="sm" :disabled="page===0" @click="page--">Prev</UiButton>
          <div class="text-xs">Page {{ page + 1 }} / {{ totalPages || 1 }}</div>
          <UiButton variant="outline" size="sm" :disabled="page>=totalPages-1" @click="page++">Next</UiButton>
        </div>
      </div>
    </div>

    <!-- User Form Dialog -->
    <UiDialog :open="userDialog" title="User Details" @close="userDialog=false">
      <form class="space-y-4" @submit.prevent="saveUser(user as any)">
        <div class="space-y-2">
          <UiLabel for="email">Email</UiLabel>
          <UiInput id="email" v-model.trim="(user.email as string)" required />
        </div>
        <div class="space-y-2">
          <UiLabel for="name">Name</UiLabel>
          <UiInput id="name" v-model.trim="(user.name as string)" />
        </div>
        <div class="space-y-2">
          <UiLabel for="role">Role</UiLabel>
          <select id="role" v-model="user.role" class="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
      </form>
      <template #footer>
        <UiButton type="button" variant="outline" @click="userDialog=false">Cancel</UiButton>
        <UiButton type="submit" @click="saveUser(user as any)">Save</UiButton>
      </template>
    </UiDialog>

    <!-- Ban Dialog -->
    <UiDialog :open="banReasonDialog" title="Confirm Ban" @close="banReasonDialog=false">
      <div class="space-y-4">
        <p class="text-sm">Ban <strong>{{ banningUser?.email }}</strong>. Provide details.</p>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="space-y-2">
            <UiLabel for="ban-start">Start</UiLabel>
            <UiInput id="ban-start" type="date" v-model="banStart" />
          </div>
          <div class="space-y-2">
            <UiLabel for="ban-end">End</UiLabel>
            <UiInput id="ban-end" type="date" v-model="banEnd" />
          </div>
        </div>
        <div class="space-y-2">
          <UiLabel for="ban-reason">Reason</UiLabel>
          <textarea id="ban-reason" v-model="banMessage" rows="3" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"></textarea>
        </div>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="banReasonDialog=false">Cancel</UiButton>
        <UiButton :disabled="!banStart || !banEnd || !banMessage.trim()" variant="destructive" @click="confirmBanUser">Confirm Ban</UiButton>
      </template>
    </UiDialog>

    <!-- Delete Confirm Dialog -->
    <UiDialog :open="deleteDialog" title="Confirm Deletion" @close="deleteDialog=false">
      <div class="space-y-4">
        <p class="text-sm">Delete user <strong>{{ deletingUser?.email }}</strong>? This action cannot be undone.</p>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="deleteDialog=false">Cancel</UiButton>
        <UiButton variant="destructive" @click="confirmDeleteUser">Delete</UiButton>
      </template>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUsers } from '../composables/useUsers';
import { bannerService, type Banner } from '../services/bannerService';
import type { User } from '../types/user';
import UiButton from '../components/ui/button.vue';
import UiInput from '../components/ui/input.vue';
import UiDialog from '../components/ui/dialog.vue';
import UiTable from '../components/ui/table/table.vue';
import UiThead from '../components/ui/table/thead.vue';
import UiTbody from '../components/ui/table/tbody.vue';
import UiTr from '../components/ui/table/tr.vue';
import UiTh from '../components/ui/table/th.vue';
import UiTd from '../components/ui/table/td.vue';
import UiLabel from '../components/ui/label.vue';
import { useToast } from '../stores/toast';

// data + api hooks
const { users, loading, fetchUsers: fetchRawUsers, saveUser: saveUserData, deleteUser: deleteUserFn, banUser, unbanUser } = useUsers();
const { push } = useToast();

// local ui state
const userDialog = ref(false);
const user = ref<Partial<User>>({});
const search = ref('');
const page = ref(0);
const rows = ref(10);

// ban dialog
const banReasonDialog = ref(false);
const banStart = ref<string>('');
const banEnd = ref<string>('');
const banMessage = ref('');
const banningUser = ref<User | null>(null);

// delete dialog
const deleteDialog = ref(false);
const deletingUser = ref<User | null>(null);

onMounted(() => fetchRawUsers());

const mappedUsers = computed(() => Array.isArray(users.value) ? users.value.map((u: any) => ({ ...u, id: u._id })) : []);
const filteredUsers = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return mappedUsers.value;
  return mappedUsers.value.filter(u =>
    [u.email, u.name, u.role].filter(Boolean).some((f: string) => f.toLowerCase().includes(q))
  );
});
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / rows.value));
const pagedUsers = computed(() => {
  const start = page.value * rows.value;
  return filteredUsers.value.slice(start, start + rows.value);
});
const pageStart = computed(() => page.value * rows.value);
const pageEnd = computed(() => Math.min(pageStart.value + rows.value, filteredUsers.value.length));

// touch refs so linter sees usage in script context (template uses them but some setups still warn)
void loading; void totalPages; void pagedUsers; void pageEnd;
void openNew; void saveUser; void editUser; void askDelete; void confirmDeleteUser; void toggleBanUser; void confirmBanUser; void roleChipClass; void statusChipClass;

function openNew() {
  user.value = { role: 'user' };
  userDialog.value = true;
}

async function saveUser(userData: User) {
  const success = await saveUserData(userData);
  if (success) {
    userDialog.value = false;
    push({ variant: 'success', title: 'Success', description: `User ${userData.id ? 'updated' : 'created'}` });
    fetchRawUsers();
  }
}

function editUser(editUser: User) {
  user.value = { ...editUser };
  userDialog.value = true;
}

function askDelete(u: User) {
  deletingUser.value = u;
  deleteDialog.value = true;
}

async function confirmDeleteUser() {
  if (!deletingUser.value) return;
  const success = await deleteUserFn(deletingUser.value);
  if (success) {
    push({ variant: 'success', title: 'Deleted', description: 'User removed.' });
    fetchRawUsers();
  }
  deleteDialog.value = false;
}

async function toggleBanUser(u: any) {
  if (u.banned) {
    try {
      await unbanUser(u);
      push({ variant: 'success', title: 'Unbanned', description: 'User unbanned.' });
      fetchRawUsers();
    } catch (e) {
      push({ variant: 'error', title: 'Error', description: 'Failed to unban.' });
    }
  } else {
    banningUser.value = u;
    const today = new Date();
    banStart.value = today.toISOString().slice(0,10);
    banEnd.value = '';
    banMessage.value = '';
    banReasonDialog.value = true;
  }
}

async function confirmBanUser() {
  if (!banningUser.value) return;
  const banner: Banner = {
    message: banMessage.value,
    displayFrom: new Date(banStart.value).toISOString(),
    displayTo: banEnd.value ? new Date(banEnd.value).toISOString() : undefined,
  };
  try {
    await bannerService.upsertBanner(banner);
    await banUser(banningUser.value);
    push({ variant: 'success', title: 'Banned', description: 'User banned.' });
    banReasonDialog.value = false;
    banningUser.value = null;
    fetchRawUsers();
  } catch (e) {
    push({ variant: 'error', title: 'Error', description: 'Failed to ban user.' });
  }
}

function roleChipClass(role?: string) {
  return ['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
    role === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'];
}
function statusChipClass(banned?: boolean) {
  return ['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
    banned ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'];
}
</script>

<style scoped></style>