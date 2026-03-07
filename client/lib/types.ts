export interface Customer {
  _id: string;
  name: string;
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  pricePerDay: number;
  createdAt: string;
  updatedAt: string;
}

export interface RentalItem {
  _id: string;
  rental: string;
  product: { _id: string; name: string; pricePerDay: number } | string;
  productName: string;
  pricePerDay: number;
  quantity: number;
  takenTime: string;
  returnedTime?: string | null;
  notes?: string;
  total: number;
  createdAt?: string;
}

export interface Rental {
  _id: string;
  customer: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  rental: string;
  amount: number;
  createdAt: string;
}

export interface CustomerRentalData {
  rental: Rental;
  items: RentalItem[];
  payments: Payment[];
  totalPaid: number;
  remainingBalance: number;
}

export interface DashboardSummary {
  todaysRevenue: number;
  totalOutstanding: number;
  openRentalsCount: number;
  customersWithOutstanding: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CustomerRunningCredit {
  customerId: string;
  totalOutstanding: number;
  openRentals: number;
}
