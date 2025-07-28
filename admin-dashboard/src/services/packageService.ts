import axios from 'axios';

const API_URL = '/packages';

export interface Package {
  id?: string;
  name: string;
  credits: number;
  price: number;
}

const getPackages = async (): Promise<Package[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

const createPackage = async (pkg: Package): Promise<Package> => {
  const response = await axios.post(API_URL, pkg);
  return response.data;
};

const updatePackage = async (id: string, pkg: Package): Promise<void> => {
  await axios.put(`${API_URL}/${id}`, pkg);
};

const deletePackage = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};

export const packageService = {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
};