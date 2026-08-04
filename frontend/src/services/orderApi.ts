import { api } from './api';
import { Order } from '../types';

export interface CreateOrderPayload {
  orderItems: Array<{
    name: string;
    qty: number;
    image: string;
    price: number;
    size: string;
    color: string;
    product: string;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}

export const orderApi = {
  createOrder: async (orderPayload: CreateOrderPayload): Promise<Order> => {
    const response = await api.post('/orders', orderPayload);
    return response.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders/myorders');
    return response.data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  getAllOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string, reason?: string): Promise<Order> => {
    const response = await api.put(`/orders/${id}/status`, { status, reason });
    return response.data;
  },

  cancelOrder: async (id: string, reason?: string): Promise<Order> => {
    const response = await api.put(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  requestReturn: async (id: string): Promise<Order> => {
    const response = await api.put(`/orders/${id}/return`);
    return response.data;
  },

  deleteOrder: async (id: string): Promise<any> => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};
