import axios, { AxiosInstance, AxiosError } from 'axios'
import { Customer, Product, Rental, Payment, DashboardMetrics, ApiError } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  // Dashboard
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await this.client.get('/dashboard/metrics')
    return response.data
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const response = await this.client.get('/customers')
    return response.data
  }

  async getCustomer(id: string): Promise<Customer> {
    const response = await this.client.get(`/customers/${id}`)
    return response.data
  }

  async createCustomer(data: Omit<Customer, '_id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const response = await this.client.post('/customers', data)
    return response.data
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const response = await this.client.put(`/customers/${id}`, data)
    return response.data
  }

  async deleteCustomer(id: string): Promise<void> {
    await this.client.delete(`/customers/${id}`)
  }

  // Products
  async getProducts(): Promise<Product[]> {
    const response = await this.client.get('/products')
    return response.data
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.client.get(`/products/${id}`)
    return response.data
  }

  async createProduct(data: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const response = await this.client.post('/products', data)
    return response.data
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const response = await this.client.put(`/products/${id}`, data)
    return response.data
  }

  async deleteProduct(id: string): Promise<void> {
    await this.client.delete(`/products/${id}`)
  }

  // Rentals
  async getRentals(): Promise<Rental[]> {
    const response = await this.client.get('/rentals')
    return response.data
  }

  async getRental(id: string): Promise<Rental> {
    const response = await this.client.get(`/rentals/${id}`)
    return response.data
  }

  async createRental(data: Omit<Rental, '_id' | 'createdAt' | 'updatedAt'>): Promise<Rental> {
    const response = await this.client.post('/rentals', data)
    return response.data
  }

  async updateRental(id: string, data: Partial<Rental>): Promise<Rental> {
    const response = await this.client.put(`/rentals/${id}`, data)
    return response.data
  }

  async deleteRental(id: string): Promise<void> {
    await this.client.delete(`/rentals/${id}`)
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    const response = await this.client.get('/payments')
    return response.data
  }

  async getPayment(id: string): Promise<Payment> {
    const response = await this.client.get(`/payments/${id}`)
    return response.data
  }

  async createPayment(data: Omit<Payment, '_id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const response = await this.client.post('/payments', data)
    return response.data
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    const response = await this.client.put(`/payments/${id}`, data)
    return response.data
  }

  async deletePayment(id: string): Promise<void> {
    await this.client.delete(`/payments/${id}`)
  }

  // Error handling
  handleError(error: AxiosError): ApiError {
    const message = error.response?.data?.message || error.message || 'An error occurred'
    return {
      message,
      code: error.code,
      details: error.response?.data,
    }
  }
}

export const apiClient = new ApiClient()
