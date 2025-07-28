<template>
  <div class="banners-view">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-800">Banner Management</h1>
      <Button
        label="New Banner"
        icon="pi pi-plus"
        class="p-button-primary"
        @click="openNew"
      />
    </div>

    <div class="card">
      <DataTable
        :value="banners"
        :loading="loading"
        dataKey="bannerId"
        :paginator="true"
        :rows="10"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} banners"
        responsiveLayout="scroll"
      >
        <Column field="message" header="Message" :sortable="true" style="min-width: 20rem">
          <template #body="slotProps">
            <p class="truncate">{{ slotProps.data.message }}</p>
          </template>
        </Column>
        <Column field="duration" header="Duration (minutes)" :sortable="true" style="min-width: 12rem"></Column>
        <Column :exportable="false" header="Actions" style="min-width: 10rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editBanner(slotProps.data)" v-tooltip.top="'Edit'" />
            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning" @click="confirmDeleteBanner(slotProps.data)" v-tooltip.top="'Delete'"/>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="bannerDialog"
      :style="{ width: '450px' }"
      :header="banner.bannerId ? 'Edit Banner' : 'Create New Banner'"
      :modal="true"
      class="p-fluid"
    >
      <div class="field">
        <label for="message">Message</label>
        <Textarea
          id="message"
          v-model="banner.message"
          required="true"
          :autoResize="true"
          rows="4"
          :class="{ 'p-invalid': submitted && !banner.message }"
        />
        <small class="p-error" v-if="submitted && !banner.message">Message is required.</small>
      </div>
      <div class="field">
        <label for="duration">Duration (in minutes)</label>
        <InputNumber
          id="duration"
          v-model="banner.duration"
          integeronly
          :min="1"
          required="true"
          :class="{ 'p-invalid': submitted && (!banner.duration || banner.duration <= 0) }"
        />
        <small class="p-error" v-if="submitted && (!banner.duration || banner.duration <= 0)">A valid duration is required.</small>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
        <Button label="Save" icon="pi pi-check" class="p-button-primary" @click="saveBanner" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { bannerService, type Banner } from '../services/bannerService';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';

const toast = useToast();
const confirm = useConfirm();

const banners = ref<Banner[]>([]);
const bannerDialog = ref(false);
const banner = ref<Banner>({ message: '', duration: 0 });
const submitted = ref(false);
const loading = ref(false);

const fetchBanners = async () => {
  loading.value = true;
  try {
    banners.value = await bannerService.getBanners();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch banners', life: 3000 });
  } finally {
    loading.value = false;
  }
};

onMounted(fetchBanners);

const openNew = () => {
  banner.value = { message: '', duration: 60 }; // Default to 60 mins
  submitted.value = false;
  bannerDialog.value = true;
};

const hideDialog = () => {
  bannerDialog.value = false;
  submitted.value = false;
};

const saveBanner = async () => {
  submitted.value = true;
  if (banner.value.message.trim() && banner.value.duration > 0) {
    try {
      if (banner.value.bannerId) {
        await bannerService.updateBanner(banner.value.bannerId, banner.value);
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Banner Updated', life: 3000 });
      } else {
        await bannerService.createBanner(banner.value);
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Banner Created', life: 3000 });
      }
      bannerDialog.value = false;
      fetchBanners();
    } catch (error: any) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save banner', life: 3000 });
    }
  }
};

const editBanner = (editBannerData: Banner) => {
  banner.value = { ...editBannerData };
  bannerDialog.value = true;
};

const confirmDeleteBanner = (bannerToDelete: Banner) => {
  confirm.require({
    message: 'Are you sure you want to delete this banner?',
    header: 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await bannerService.deleteBanner(bannerToDelete.bannerId!);
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Banner Deleted', life: 3000 });
        fetchBanners();
      } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete banner', life: 3000 });
      }
    },
  });
};
</script>

<style scoped>
.banners-view {
  padding: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.p-button-primary {
    background: #4f46e5;
    border: 1px solid #4f46e5;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 40ch;
}
</style>