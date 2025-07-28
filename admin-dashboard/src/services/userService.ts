import api from './api';
import type { User, ApiResponse } from '../types/user';

export const userService = {
  async getUsers(): Promise<User[]> {
    try {
      
      const response = await api.get<User[]>('/users');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    try {
      const response = await api.post<ApiResponse<User>>('/users', userData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put<ApiResponse<User>>(`/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>(`/users/${id}`);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },

  async banUser(id: string): Promise<User> {
    try {
      const response = await api.post<ApiResponse<User>>(`/users/${id}/ban`);
      return response.data;
    } catch (error: any) {
      console.error('Error banning user:', error);
      throw new Error(error.response?.data?.message || 'Failed to ban user');
    }
  },

  async unbanUser(id: string): Promise<User> {
    try {
      const response = await api.post<ApiResponse<User>>(`/users/${id}/unban`);
      return response.data;
    } catch (error: any) {
      console.error('Error unbanning user:', error);
      throw new Error(error.response?.data?.message || 'Failed to unban user');
    }
  },
};