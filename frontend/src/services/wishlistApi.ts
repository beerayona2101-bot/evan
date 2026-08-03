import { api } from './api';
import { Product } from '../types';

export const wishlistApi = {
  getWishlist: async (): Promise<Product[]> => {
    const response = await api.get('/wishlist');
    return response.data;
  },

  toggleWishlist: async (productId: string): Promise<Product[]> => {
    const response = await api.post('/wishlist/toggle', { productId });
    return response.data;
  },

  removeFromWishlist: async (productId: string): Promise<Product[]> => {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  },
};
