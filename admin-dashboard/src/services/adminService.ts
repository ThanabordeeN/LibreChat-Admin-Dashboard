import api from './api';

export const adminService = {
  createUser(data: { email: string; password: string; name: string; username: string; emailVerified?: boolean }) {
    return api.post('/admin/create-user', data);
  },
  banUser(data: { email: string; duration: number }) {
    return api.post('/admin/ban-user', data);
  },
  updateBanner(data: { displayFrom?: string | null; displayTo?: string | null; message: string; isPublic?: boolean }) {
    return api.post('/admin/update-banner', data);
  }
};
