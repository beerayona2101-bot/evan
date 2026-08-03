import { Response } from 'express';

export interface ApiResponseOptions {
  success: boolean;
  message: string;
  data?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  errors?: any;
}

export const sendApiResponse = (
  res: Response,
  statusCode: number,
  options: ApiResponseOptions
): Response => {
  return res.status(statusCode).json({
    success: options.success,
    message: options.message,
    data: options.data ?? null,
    pagination: options.pagination ?? null,
    errors: options.errors ?? null,
  });
};
