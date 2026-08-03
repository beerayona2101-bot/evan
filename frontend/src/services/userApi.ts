import { api } from './api';
import { User } from '../types';

export interface AddressPayload {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

export const userApi = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User> & { password?: string }): Promise<User> => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  getAddresses: async (): Promise<AddressPayload[]> => {
    const response = await api.get('/users/addresses');
    return response.data;
  },

  addAddress: async (address: AddressPayload): Promise<AddressPayload> => {
    const response = await api.post('/users/addresses', address);
    return response.data;
  },

  updateAddress: async (id: string, address: AddressPayload): Promise<AddressPayload> => {
    const response = await api.put(`/users/addresses/${id}`, address);
    return response.data;
  },

  deleteAddress: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/users/addresses/${id}`);
    return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },
};
