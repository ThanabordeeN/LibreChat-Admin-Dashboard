import api from './api';

const API_URL = '/admin/user-stats';

export interface Stats {
  totalUsers: number;
  activeUsers: number;
  newUsers24h: number;
  bannedUsers: number;
  verifiedEmails: number;
  unverifiedEmails: number;
}

export const getStats = async (): Promise<Stats> => {
  const response = await api.get(API_URL);
  return response.data;
};

export const statsService = {
  getStats,
};