import { api } from './api';
import { Category } from '../types';

export const categoryApi = {
  getCategories: async (params?: {
    status?: string;
    featured?: boolean;
    isLive?: boolean;
    search?: string;
    sort?: string;
    includeArchived?: boolean;
    includeDeleted?: boolean;
  }): Promise<Category[]> => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  patchCategoryStatus: async (
    id: string,
    data: { status?: string; isLive?: boolean; featured?: boolean }
  ): Promise<Category> => {
    const response = await api.patch(`/categories/${id}/status`, data);
    return response.data;
  },

  deleteCategory: async (id: string, force = false): Promise<any> => {
    const response = await api.delete(`/categories/${id}${force ? '?force=true' : ''}`);
    return response.data;
  },

  restoreCategory: async (id: string): Promise<{ message: string; category: Category }> => {
    const response = await api.post(`/categories/${id}/restore`);
    return response.data;
  },

  permanentDeleteCategory: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/categories/${id}/permanent`);
    return response.data;
  },

  uploadImage: async (image: string): Promise<{ imageUrl: string; success: boolean }> => {
    const response = await api.post('/categories/upload-image', { image });
    return response.data;
  },

  bulkAction: async (
    ids: string[],
    action: 'delete' | 'status' | 'live',
    value?: any
  ): Promise<{ message: string }> => {
    const response = await api.post('/categories/bulk-action', { ids, action, value });
    return response.data;
  },
};
