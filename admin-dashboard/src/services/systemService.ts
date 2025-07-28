import axios from 'axios';

const API_URL = '/system';

export const getSystemInfo = async (): Promise<any> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const stopBackend = async (): Promise<any> => {
  const response = await axios.post(`${API_URL}/stop`);
  return response.data;
};

export const deployedUpdate = async (): Promise<any> => {
  const response = await axios.post(`${API_URL}/deployed-update`);
  return response.data;
};

export const prepareUpdate = async (): Promise<any> => {
  const response = await axios.post(`${API_URL}/prepare-update`);
  return response.data;
};

export const systemService = {
  getSystemInfo,
  stopBackend,
  deployedUpdate,
  prepareUpdate,
};