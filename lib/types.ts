export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rental {
  _id: string;
  customerId: string;
  productId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  rentalId: string;
  amount: number;
  method: 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalCustomers: number;
  totalProducts: number;
  activeRentals: number;
  totalRevenue: number;
  recentRentals?: Rental[];
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
