import api from './api';

// Backend treats banner as singleton: POST /admin/banner (create or update), GET /admin/banner, DELETE /admin/banner
export interface Banner {
  bannerId?: string;
  message: string;
  displayFrom?: string | Date | null;
  displayTo?: string | Date | null;
  isPublic?: boolean;
}

const getBanner = async (): Promise<Banner | null> => {
  try {
    const response = await api.get<Banner>('/admin/banner');
    return response.data;
  } catch (e: any) {
    if (e.response?.status === 404) return null;
    throw e;
  }
};

const upsertBanner = async (banner: Banner): Promise<Banner> => {
  const response = await api.post<Banner>('/admin/banner', banner);
  return response.data;
};

const deleteBanner = async (): Promise<void> => {
  await api.delete('/admin/banner');
};

export const bannerService = {
  getBanner,
  upsertBanner,
  deleteBanner,
};