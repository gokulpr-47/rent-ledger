import api from "../axios";
import { DashboardSummary } from "../types";

export interface OpenRental {
  rentalId: string;
  customerId: string;
  customerName: string;
  rentalDate: string;
  totalAmount: number;
  outstandingBalance: number;
  itemCount: number;
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const res = await api.get("/dashboard/summary");
  return res.data.data;
};

export const getOpenRentals = async (): Promise<OpenRental[]> => {
  const res = await api.get("/dashboard/open-rentals");
  return res.data.data;
};
