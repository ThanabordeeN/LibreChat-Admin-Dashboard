<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold tracking-tight">User Balances</h1>
      <div class="flex items-center gap-2">
        <UiInput v-model="search" placeholder="Search email..." class="h-9 w-60" />
      </div>
    </div>

    <div class="rounded-lg border bg-white shadow-sm">
      <div class="flex items-center justify-between border-b bg-slate-50/60 p-4 text-sm text-slate-600">
        <span>Total: {{ filtered.length }}</span>
        <div class="flex items-center gap-2 text-xs">
          <span>Rows:</span>
          <select v-model.number="rows" class="h-8 rounded border border-slate-300 bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-400">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="25">25</option>
          </select>
        </div>
      </div>
      <div class="overflow-x-auto">
        <UiTable class="min-w-full">
          <UiThead>
            <UiTr>
              <UiTh>Email</UiTh>
              <UiTh class="w-40">Balance</UiTh>
              <UiTh class="text-right w-48">Actions</UiTh>
            </UiTr>
          </UiThead>
          <UiTbody>
            <UiTr v-for="b in paged" :key="b.id" class="hover:bg-slate-50">
              <UiTd class="font-medium">{{ b.email }}</UiTd>
              <UiTd>
                <span class="font-semibold tabular-nums">{{ b.balance.toLocaleString() }}</span>
              </UiTd>
              <UiTd class="flex justify-end gap-2">
                <UiButton size="sm" variant="outline" @click="openEdit(b,'set')">Set</UiButton>
                <UiButton size="sm" variant="secondary" @click="openEdit(b,'add')">Add</UiButton>
              </UiTd>
            </UiTr>
            <UiTr v-if="!loading && !paged.length">
              <UiTd colspan="3" class="py-10 text-center text-sm text-slate-500">No balances found.</UiTd>
            </UiTr>
            <UiTr v-if="loading">
              <UiTd colspan="3" class="py-10 text-center text-sm text-slate-500">Loading...</UiTd>
            </UiTr>
          </UiTbody>
        </UiTable>
      </div>
      <div class="flex items-center justify-between gap-4 border-t p-4">
        <div class="text-xs text-slate-500">Showing {{ start+1 }}-{{ end }} of {{ filtered.length }}</div>
        <div class="flex items-center gap-2">
          <UiButton variant="outline" size="sm" :disabled="page===0" @click="page--">Prev</UiButton>
          <div class="text-xs">Page {{ page+1 }} / {{ totalPages||1 }}</div>
          <UiButton variant="outline" size="sm" :disabled="page>=totalPages-1" @click="page++">Next</UiButton>
        </div>
      </div>
    </div>

    <UiDialog :open="editDialog" :title="dialogTitle" @close="closeEdit">
      <div class="space-y-4">
        <p class="text-sm">User: <strong>{{ current?.email }}</strong></p>
        <div class="space-y-2">
          <UiLabel for="amount">Amount</UiLabel>
          <UiInput id="amount" type="number" min="0" v-model.number="amount" />
          <p class="text-xs text-slate-500" v-if="mode==='add'">Can be negative (except zero) to subtract.</p>
        </div>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="closeEdit">Cancel</UiButton>
        <UiButton :disabled="invalidAmount" @click="applyChange">Save</UiButton>
      </template>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { balanceService, type Balance } from '../services/balanceService';
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

const { push } = useToast();
const balances = ref<Balance[]>([]);
const loading = ref(true);
const search = ref('');
const page = ref(0);
const rows = ref(10);

// edit dialog
const editDialog = ref(false);
const current = ref<Balance | null>(null);
const mode = ref<'add' | 'set'>('set');
const amount = ref<number | null>(null);

onMounted(load);
async function load() {
  loading.value = true;
  try {
    balances.value = await balanceService.getBalances();
  } catch (e) {
    push({ variant: 'error', title: 'Error', description: 'Failed to fetch balances' });
  } finally {
    loading.value = false;
  }
}

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return balances.value;
  return balances.value.filter(b => b.email.toLowerCase().includes(q));
});
const totalPages = computed(() => Math.ceil(filtered.value.length / rows.value));
const start = computed(() => page.value * rows.value);
const end = computed(() => Math.min(start.value + rows.value, filtered.value.length));
const paged = computed(() => filtered.value.slice(start.value, end.value));

function openEdit(b: Balance, m: 'add' | 'set') {
  current.value = b;
  mode.value = m;
  amount.value = null;
  editDialog.value = true;
}
function closeEdit() { editDialog.value = false; current.value = null; }
const invalidAmount = computed(() => amount.value === null || (mode.value==='set' && amount.value < 0) || (mode.value==='add' && amount.value === 0));
const dialogTitle = computed(() => mode.value === 'set' ? 'Set Balance' : 'Add/Subtract Balance');

async function applyChange() {
  if (!current.value || amount.value === null) return;
  try {
    if (mode.value === 'set') {
      await balanceService.setBalance(current.value.id!, amount.value);
      current.value.balance = amount.value;
    } else {
      await balanceService.addBalance(current.value.id!, amount.value);
      current.value.balance += amount.value;
    }
    push({ variant: 'success', title: 'Saved', description: 'Balance updated' });
    editDialog.value = false;
  } catch (e) {
    push({ variant: 'error', title: 'Error', description: 'Update failed' });
  }
}

// prevent linter unused warnings
void totalPages; void paged; void end;
</script>

<style scoped></style>