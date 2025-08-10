import api from './api';

// Backend expects: POST /admin/users/:id/reset-password { newPassword }
export const resetPassword = async (userId: string, newPassword: string): Promise<void> => {
  await api.post(`/admin/users/${userId}/reset-password`, { newPassword });
};