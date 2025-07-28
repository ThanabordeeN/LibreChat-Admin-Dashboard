import axios from 'axios';

const API_URL = '/reset-password';

export const resetPassword = async (email: string): Promise<void> => {
  await axios.post(API_URL, { email });
};