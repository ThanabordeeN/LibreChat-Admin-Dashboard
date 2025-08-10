import api from './api'; // Configured axios instance

export interface Balance {
  id?: string;
  email: string;
  balance: number;
}


const getBalances = async (): Promise<Balance[]> => {
  const response = await api.get<Balance[]>('/admin/balances');
  console.log('Fetched balances:', response.data);
  return response.data;
};
// Add relative amount (can be negative except zero) -> backend validates
const addBalance = async (id: string, amount: number): Promise<void> => {
  await api.post(`/admin/balances/${id}/add`, { amount });
};
// Set absolute amount (non-negative)
const setBalance = async (id: string, amount: number): Promise<void> => {
  await api.post(`/admin/balances/${id}/set`, { amount });
};

export const balanceService = {
  getBalances,
  addBalance,
  setBalance,
};