import axios from 'axios';

const API_URL = '/reset-terms';

export const resetTerms = async (email: string): Promise<void> => {
  await axios.post(API_URL, { email });
};