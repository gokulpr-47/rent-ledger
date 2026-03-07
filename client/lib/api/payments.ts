import api from '../axios';
import { Payment } from '../types';

export interface AddPaymentPayload {
  rentalId: string;
  amount: number;
}

export const addPayment = async (
  payload: AddPaymentPayload
): Promise<Payment> => {
  const res = await api.post('/payments', payload);
  return res.data.data;
};
