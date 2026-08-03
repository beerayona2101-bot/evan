import { api } from './api';

export interface Coupon {
  _id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  minPurchase: number;
  expirationDate: string;
  isActive: boolean;
}

export const couponApi = {
  getCoupons: async (): Promise<Coupon[]> => {
    const response = await api.get('/coupons');
    return response.data;
  },

  validateCoupon: async (code: string, cartTotal: number) => {
    const response = await api.post('/coupons/validate', { code, cartTotal });
    return response.data;
  },

  createCoupon: async (coupon: Partial<Coupon>): Promise<Coupon> => {
    const response = await api.post('/coupons', coupon);
    return response.data;
  },

  deleteCoupon: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },
};
