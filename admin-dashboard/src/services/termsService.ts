import api from './api';

const API_URL = '/admin/users/reset-terms';

export const resetTerms = async (): Promise<void> => {
  await api.post(API_URL, {});
};