import api from './api'; // Adjust the import path as necessary

const API_URL = '/banners';

export interface Banner {
  bannerId?: string; // Maps to the user ID being banned
  message: string; // The reason for the ban
  duration: number; // (in minutes)
}

const getBanners = async (): Promise<Banner[]> => {
  const response = await api.get<Banner[]>(API_URL);
  return response.data;
};

const createBanner = async (banner: Banner): Promise<Banner> => {
  const response = await api.post<Banner>(API_URL, banner);
  return response.data;
};

const updateBanner = async (id: string, banner: Banner): Promise<void> => {
  await api.put(`${API_URL}/${id}`, banner);
};

const deleteBanner = async (id: string): Promise<void> => {
  await api.delete(`${API_URL}/${id}`);
};

export const bannerService = {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};