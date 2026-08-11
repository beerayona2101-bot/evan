import { api } from './api';

export interface AddToCartPayload {
  productId: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  variantId?: string;
  variantImage?: string;
  sku?: string;
  hexColor?: string;
}

export const cartApi = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  addToCart: async (payload: AddToCartPayload) => {
    const response = await api.post('/cart/add', payload);
    return response.data;
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    const response = await api.put(`/cart/update/${itemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (itemId: string) => {
    const response = await api.delete(`/cart/remove/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },

  saveForLater: async (itemId: string) => {
    const response = await api.post('/cart/save-for-later', { itemId });
    return response.data;
  },

  moveToCart: async (itemId: string) => {
    const response = await api.post('/cart/move-to-cart', { itemId });
    return response.data;
  },

  mergeCart: async (guestItems: AddToCartPayload[]) => {
    const response = await api.post('/cart/sync', { localItems: guestItems });
    return response.data;
  },
};
