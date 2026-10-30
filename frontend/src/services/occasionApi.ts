import { api } from './api';
import { Occasion } from '../types';

export const occasionApi = {
  getOccasions: async (params?: { status?: string; includeArchived?: boolean }): Promise<Occasion[]> => {
    const res = await api.get('/occasions', { params });
    return res.data;
  },

  getOccasionById: async (id: string): Promise<Occasion> => {
    const res = await api.get(`/occasions/${id}`);
    return res.data;
  },

  createOccasion: async (data: Partial<Occasion>): Promise<Occasion> => {
    const res = await api.post('/occasions', data);
    return res.data;
  },

  updateOccasion: async (id: string, data: Partial<Occasion>): Promise<Occasion> => {
    const res = await api.put(`/occasions/${id}`, data);
    return res.data;
  },

  deleteOccasion: async (id: string): Promise<{ message: string; occasion?: Occasion }> => {
    const res = await api.delete(`/occasions/${id}`);
    return res.data;
  },
};
