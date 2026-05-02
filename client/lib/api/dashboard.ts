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

export const getOpenRentals = async (
  sortField: string = "outstandingBalance",
  sortOrder: string = "desc",
): Promise<OpenRental[]> => {
  const res = await api.get("/dashboard/open-rentals", {
    params: { sortField, sortOrder },
  });
  return res.data.data;
};
