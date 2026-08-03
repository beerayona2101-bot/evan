import { api } from './api';
import { Review } from '../types';

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  comment: string;
}

export const reviewApi = {
  getProductReviews: async (productId: string): Promise<Review[]> => {
    const response = await api.get(`/reviews/${productId}`);
    return response.data;
  },

  createReview: async (payload: CreateReviewPayload): Promise<Review> => {
    const response = await api.post('/reviews', payload);
    return response.data;
  },

  deleteReview: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
};
