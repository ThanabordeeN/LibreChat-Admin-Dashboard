import api from './api';

export interface Translation {
  id?: string;
  key: string;
  en: string;
  es: string;
  fr: string;
}

export const translationService = {
  // Get all translations
  async getTranslations(): Promise<Translation[]> {
    const response = await api.get('/translations');
    return response.data;
  },

  // Create a new translation
  async createTranslation(translationData: Omit<Translation, 'id'>): Promise<Translation> {
    const response = await api.post('/translations', translationData);
    return response.data;
  },

  // Update an existing translation
  async updateTranslation(id: string, translationData: Partial<Translation>): Promise<Translation> {
    const response = await api.put(`/translations/${id}`, translationData);
    return response.data;
  },

  // Delete a translation
  async deleteTranslation(id: string): Promise<void> {
    await api.delete(`/translations/${id}`);
  },
};
