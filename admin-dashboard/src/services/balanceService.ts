import api from './api'; // Import the configured axios instance

export interface Balance {
  id?: string;
  email: string;
  balance: number;
}


const getBalances = async (): Promise<Balance[]> => {
  const response = await api.get<Balance[]>('/balances');
  console.log('Fetched balances:', response.data);
  return response.data;
};

const updateBalance = async (id: string, balance: number): Promise<void> => {
  await api.put(`/balances/${id}`, { tokenCredits: balance });
};

export const balanceService = {
  getBalances,
  updateBalance,
};