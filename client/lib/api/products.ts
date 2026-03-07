import api from '../axios';
import { Product, PaginatedResponse } from '../types';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

export const getProducts = async (
  params: GetProductsParams = {}
): Promise<PaginatedResponse<Product>> => {
  const res = await api.get('/products', { params });
  return res.data;
};

export const getAllProducts = async (): Promise<Product[]> => {
  const res = await api.get('/products', { params: { limit: 100 } });
  return res.data.data;
};

export const createProduct = async (
  data: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Product> => {
  const res = await api.post('/products', data);
  return res.data.data;
};

export const updateProduct = async (
  id: string,
  data: Partial<Omit<Product, '_id' | 'createdAt' | 'updatedAt'>>
): Promise<Product> => {
  const res = await api.put(`/products/${id}`, data);
  return res.data.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};
