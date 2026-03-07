import api from '../axios';
import { Customer, PaginatedResponse, CustomerRunningCredit } from '../types';

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

export const getCustomers = async (
  params: GetCustomersParams = {}
): Promise<PaginatedResponse<Customer>> => {
  const res = await api.get('/customers', { params });
  return res.data;
};

export const createCustomer = async (
  data: Omit<Customer, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Customer> => {
  const res = await api.post('/customers', data);
  return res.data.data;
};

export const updateCustomer = async (
  id: string,
  data: Partial<Omit<Customer, '_id' | 'createdAt' | 'updatedAt'>>
): Promise<Customer> => {
  const res = await api.put(`/customers/${id}`, data);
  return res.data.data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await api.delete(`/customers/${id}`);
};

export const getCustomerRunningCredit = async (
  customerId: string
): Promise<CustomerRunningCredit> => {
  const res = await api.get(`/customers/${customerId}/running-credit`);
  return res.data.data;
};

export const getAllCustomers = async (): Promise<Customer[]> => {
  const res = await api.get('/customers', { params: { limit: 100 } });
  return res.data.data;
};
