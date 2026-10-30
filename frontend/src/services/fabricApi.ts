import { api } from './api';
import { Fabric } from '../types';

export const fabricApi = {
  getFabrics: async (params?: { status?: string; featured?: boolean; search?: string; sort?: string; includeArchived?: boolean }): Promise<Fabric[]> => {
    const res = await api.get('/fabrics', { params });
    return res.data;
  },

  getFabricById: async (id: string): Promise<Fabric> => {
    const res = await api.get(`/fabrics/${id}`);
    return res.data;
  },

  createFabric: async (data: Partial<Fabric>): Promise<Fabric> => {
    const res = await api.post('/fabrics', data);
    return res.data;
  },

  updateFabric: async (id: string, data: Partial<Fabric>): Promise<Fabric> => {
    const res = await api.put(`/fabrics/${id}`, data);
    return res.data;
  },

  deleteFabric: async (id: string): Promise<{ message: string; fabric?: Fabric }> => {
    const res = await api.delete(`/fabrics/${id}`);
    return res.data;
  },
};
