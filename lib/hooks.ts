import useSWR from 'swr'
import { apiClient } from './api-client'
import { Customer, Product, Rental, Payment, DashboardMetrics } from './types'

const fetcher = async (url: string) => {
  try {
    return await apiClient[url as keyof typeof apiClient]()
  } catch (error) {
    throw error
  }
}

// Dashboard
export function useDashboardMetrics() {
  const { data, error, isLoading, mutate } = useSWR(
    'getDashboardMetrics',
    fetcher,
    { revalidateOnFocus: false }
  )

  return {
    metrics: data as DashboardMetrics | undefined,
    isLoading,
    isError: !!error,
    mutate,
  }
}

// Customers
export function useCustomers() {
  const { data, error, isLoading, mutate } = useSWR(
    'getCustomers',
    fetcher,
    { revalidateOnFocus: false }
  )

  return {
    customers: data as Customer[] | undefined,
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useCustomer(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['getCustomer', id] : null,
    () => apiClient.getCustomer(id),
    { revalidateOnFocus: false }
  )

  return {
    customer: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}

// Products
export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR(
    'getProducts',
    fetcher,
    { revalidateOnFocus: false }
  )

  return {
    products: data as Product[] | undefined,
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useProduct(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['getProduct', id] : null,
    () => apiClient.getProduct(id),
    { revalidateOnFocus: false }
  )

  return {
    product: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}

// Rentals
export function useRentals() {
  const { data, error, isLoading, mutate } = useSWR(
    'getRentals',
    fetcher,
    { revalidateOnFocus: false }
  )

  return {
    rentals: data as Rental[] | undefined,
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useRental(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['getRental', id] : null,
    () => apiClient.getRental(id),
    { revalidateOnFocus: false }
  )

  return {
    rental: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}

// Payments
export function usePayments() {
  const { data, error, isLoading, mutate } = useSWR(
    'getPayments',
    fetcher,
    { revalidateOnFocus: false }
  )

  return {
    payments: data as Payment[] | undefined,
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function usePayment(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['getPayment', id] : null,
    () => apiClient.getPayment(id),
    { revalidateOnFocus: false }
  )

  return {
    payment: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}
