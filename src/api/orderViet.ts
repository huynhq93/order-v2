import axios from 'axios'
import { getAuthHeaders } from '@/api/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5176',
})

// Add auth headers to all requests
api.interceptors.request.use((config) => {
  const authHeaders = getAuthHeaders()
  Object.assign(config.headers, authHeaders)
  return config
})

export interface OrderVietBill {
  rowIndex: number
  billCode: string
  imageUrl: string
  status: string
  quantity: string
  total: string
  note: string
}

export interface CreateOrderVietBillData {
  imageUrl: string
  status: string
  quantity: string
  total: string
  note: string
  month: number
  year: number
}

export interface UpdateOrderVietBillData {
  billCode: string
  imageUrl: string
  status: string
  quantity: string
  total: string
  note: string
  month: number
  year: number
  rowIndex: number
}

export interface HangVietOrder {
  rowIndex: number
  date: string
  customerName: string
  productImage: string
  productName: string
  color: string
  size: string
  quantity: string
  total: string
  status: string
  linkFb: string
  contactInfo: string
  note: string
  month: string
  sheetType: string
}

export interface OrderProcessData {
  rowIndex: number
  month: string
  sheetType: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

// Get all bills for a specific month/year
export const getOrderVietBills = async (month: number, year: number): Promise<OrderVietBill[]> => {
  const response = await api.get(`/sheets/ordviet/bills`, {
    params: { month, year },
  })
  return response.data.data || []
}

// Create a new bill
export const createOrderVietBill = async (
  data: CreateOrderVietBillData,
): Promise<ApiResponse<OrderVietBill>> => {
  const response = await api.post(`/sheets/ordviet/bills`, data)
  return response.data
}

// Update a bill
export const updateOrderVietBill = async (
  data: UpdateOrderVietBillData,
): Promise<ApiResponse<OrderVietBill>> => {
  const response = await api.put(`/sheets/ordviet/bills/${data.billCode}`, data)
  return response.data
}

// Get orders with "HÀNG VIỆT" status
export const getHangVietOrders = async (months: string[]): Promise<HangVietOrder[]> => {
  const response = await api.get(`/sheets/ordviet/hang-viet-orders`, {
    params: { months },
    paramsSerializer: (params) => {
      return `months=${params.months.join('&months=')}`
    },
  })
  return response.data.data || []
}

// Process orders: update status to "HÀNG VỀ" and add bill code
export const processHangVietOrders = async (
  orders: OrderProcessData[],
  billCode: string,
): Promise<ApiResponse<unknown>> => {
  const response = await api.post(`/sheets/ordviet/process-orders`, {
    orders,
    billCode,
  })
  return response.data
}
