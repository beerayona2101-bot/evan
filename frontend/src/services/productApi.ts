import { api } from './api';
import { Product } from '../types';

export interface ProductQueryParams {
  search?: string;
  category?: string;
  fabric?: string;
  sort?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
}

export const productApi = {
  getProducts: async (params?: ProductQueryParams) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProductById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data as Product;
  },

  createProduct: async (productData: Partial<Product>) => {
    const response = await api.post('/products', productData);
    return response.data as Product;
  },

  updateProduct: async (id: string, productData: Partial<Product>) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data as Product;
  },

  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};
