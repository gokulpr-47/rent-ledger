import api from '../axios';
import { DashboardSummary } from '../types';

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const res = await api.get('/dashboard');
  return res.data.data;
};
