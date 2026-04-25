import api from "../axios";
import { Payment } from "../types";

export interface AddPaymentPayload {
  rentalId: string;
  amount: number;
  isAdvance?: boolean;
  notes?: string;
}

export const addPayment = async (
  payload: AddPaymentPayload,
): Promise<Payment> => {
  const res = await api.post("/payments", payload);
  return res.data.data;
};

export const applyCreditToRental = async (
  rentalId: string,
): Promise<{
  appliedAmount: number;
  remainingBalance: number;
  customerCredit: number;
}> => {
  const res = await api.post("/payments/apply-credit", { rentalId });
  return res.data.data;
};
