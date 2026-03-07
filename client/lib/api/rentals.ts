import api from "../axios";
import { CustomerRentalData, RentalItem } from "../types";

export interface RentalItemInput {
  productId: string;
  quantity: number;
  takenTime: string;
  returnedTime?: string | null;
  notes?: string;
  pricePerDay?: number;
}

export interface AddItemsPayload {
  customerId: string;
  items: RentalItemInput[];
}

export const addItemsToRental = async (payload: AddItemsPayload) => {
  const res = await api.post("/rentals", payload);
  return res.data.data;
};

export const getCustomerOpenRental = async (
  customerId: string,
): Promise<CustomerRentalData | null> => {
  try {
    const res = await api.get(`/rentals/${customerId}/rental-items`);
    return res.data.data;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
};

export const getAllCustomerRentals = async (
  customerId: string,
): Promise<CustomerRentalData[]> => {
  const res = await api.get(`/rentals/${customerId}/rentals`);
  return res.data.data;
};

export const updateReturnedTime = async (
  rentalItemId: string,
  returnedTime: string,
): Promise<{ item: RentalItem }> => {
  const res = await api.patch(`/rentals/item/${rentalItemId}/return`, {
    returnedTime,
  });
  return res.data.data;
};

export const updateRentalItemPrice = async (
  rentalItemId: string,
  price: number,
): Promise<RentalItem> => {
  const res = await api.patch(`/rentals/item/${rentalItemId}/price`, { price });
  return res.data.data;
};

export const closeRental = async (
  rentalId: string,
  discount?: number,
): Promise<void> => {
  await api.patch(`/rentals/${rentalId}/close`, { discount: discount || 0 });
};
