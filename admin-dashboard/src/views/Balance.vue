<template>
  <div class="balance-view">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-800">User Balances</h1>
    </div>

    <div class="card">
      <DataTable
        :value="balances"
        :loading="loading"
        dataKey="id"
        :paginator="true"
        :rows="10"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} balances"
        responsiveLayout="scroll"
      >
        <template #header>
          <div class="table-header">
             <span class="text-xl text-900 font-bold">All Balances</span>
          </div>
        </template>
        <Column field="email" header="Email" :sortable="true"></Column>
        <Column field="balance" header="Balance" :sortable="true">
          <template #body="{ data }">
            <span class="font-semibold">{{ data.balance.toLocaleString() }}</span>
          </template>
        </Column>
        <Column header="Actions" style="min-width: 10rem">
          <template #body="{ data }">
            <div v-if="editingId === data.id" class="flex items-center gap-2">
              <InputNumber v-model="editBalance" mode="decimal" :min="0" class="p-inputtext-sm" style="width: 80px;" />
              <Button icon="pi pi-check" class="p-button-rounded p-button-success p-button-sm" @click="saveBalance(data)" v-tooltip.top="'Save'"/>
              <Button icon="pi pi-times" class="p-button-rounded p-button-secondary p-button-sm" @click="cancelEdit" v-tooltip.top="'Cancel'"/>
            </div>
            <div v-else>
              <Button icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-outlined" @click="startEdit(data)" label="Edit" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { balanceService, type Balance } from '../services/balanceService';
import { useToast } from 'primevue/usetoast';
import InputNumber from 'primevue/inputnumber';

const balances = ref<Balance[]>([]);
const loading = ref(true);
const editingId = ref<string | null>(null);
const editBalance = ref<number>(0);
const toast = useToast();

onMounted(async () => {
  try {
    balances.value = await balanceService.getBalances();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch balances.', life: 3000 });
    console.error(error);
  } finally {
    loading.value = false;
  }
});

const startEdit = (data: Balance) => {
  editingId.value = data.id ?? null;
  editBalance.value = data.balance;
};

const cancelEdit = () => {
  editingId.value = null;
  editBalance.value = 0;
};

const saveBalance = async (data: Balance) => {
  if (!data.id) return;
  loading.value = true;
  try {
    await balanceService.updateBalance(data.id, editBalance.value);
    const index = balances.value.findIndex(b => b.id === data.id);
    if (index !== -1) {
      balances.value[index].balance = editBalance.value;
    }
    toast.add({ severity: 'success', summary: 'Success', detail: 'Balance updated successfully.', life: 3000 });
    cancelEdit();
  } catch (error) {
     toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update balance.', life: 3000 });
     console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.balance-view {
  padding: 1rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.table-header {
    padding: 1rem;
    background-color: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
}
</style>