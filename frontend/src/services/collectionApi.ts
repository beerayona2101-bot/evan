import { api } from './api';
import { Collection } from '../types';

export const collectionApi = {
  getCollections: async (params?: { status?: string; featured?: boolean; includeArchived?: boolean }): Promise<Collection[]> => {
    const res = await api.get('/collections', { params });
    return res.data;
  },

  getCollectionById: async (id: string): Promise<Collection> => {
    const res = await api.get(`/collections/${id}`);
    return res.data;
  },

  createCollection: async (data: Partial<Collection>): Promise<Collection> => {
    const res = await api.post('/collections', data);
    return res.data;
  },

  updateCollection: async (id: string, data: Partial<Collection>): Promise<Collection> => {
    const res = await api.put(`/collections/${id}`, data);
    return res.data;
  },

  deleteCollection: async (id: string): Promise<{ message: string; collection?: Collection }> => {
    const res = await api.delete(`/collections/${id}`);
    return res.data;
  },
};
