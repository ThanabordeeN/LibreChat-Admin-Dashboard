import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import type { User } from '../types/user';
import { userService } from '../services/userService';

export function useUsers() {
  const users = ref<User[]>([]);
  const loading = ref(false);
  const toast = useToast();
  const confirm = useConfirm();

  const fetchUsers = async () => {
    loading.value = true;
    try {
      users.value = await userService.getUsers();
      console.log('Fetched users:', users.value);
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch users',
        life: 3000,
      });
    } finally {
      loading.value = false;
    }
  };

  const saveUser = async (userData: User) => {
    try {
      if (userData.id) {
        await userService.updateUser(userData.id, userData);
        toast.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'User Updated',
          life: 3000,
        });
      } else {
        await userService.createUser(userData);
        toast.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'User Created',
          life: 3000,
        });
      }
      return true;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to save user',
        life: 3000,
      });
      return false;
    }
  };

  const deleteUser = async (user: User) => {
    return new Promise<boolean>((resolve) => {
      confirm.require({
        message: `Are you sure you want to delete user ${user.email}?`,
        header: 'Confirm Delete',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          try {
            await userService.deleteUser(user.id!);
            toast.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'User Deleted',
              life: 3000,
            });
            resolve(true);
          } catch (error: any) {
            toast.add({
              severity: 'error',
              summary: 'Error',
              detail: error.response?.data?.message || 'Failed to delete user',
              life: 3000,
            });
            resolve(false);
          }
        },
        reject: () => {
          resolve(false);
        },
      });
    });
  };

  const banUser = async (user: User) => {
    try {
      await userService.banUser(user.id!);
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'User Banned',
        life: 3000,
      });
      return true;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to ban user',
        life: 3000,
      });
      return false;
    }
  };

  const unbanUser = async (user: User) => {
    try {
      await userService.unbanUser(user.id!);
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'User Unbanned',
        life: 3000,
      });
      return true;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to unban user',
        life: 3000,
      });
      return false;
    }
  };

  return {
    users,
    loading,
    fetchUsers,
    saveUser,
    deleteUser,
    banUser,
    unbanUser,
  };
}
