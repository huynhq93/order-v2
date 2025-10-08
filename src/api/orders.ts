import axios from 'axios'
import type { Order } from '@/types/order'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5176',
})

export const getOrders = async (
  month: number,
  year: number,
  customerType: 'customer' | 'ctv' = 'customer',
) => {
  console.log('getOrders')
  console.log(import.meta.env.VITE_API_BASE_URL)
  const sheetType = customerType === 'customer' ? 'ORDERS' : 'CTV_ORDERS'
  const response = await api.get(`/sheets?type=${sheetType}&month=${month}&year=${year}`)
  console.log(response.data.data)
  return response.data.data
}

export const updateOrderStatus = async (
  rowIndex: number,
  status: string,
  selectedDate: { month: number; year: number },
  customerType: 'customer' | 'ctv' = 'customer',
) => {
  const sheetType = customerType === 'customer' ? 'ORDERS' : 'CTV_ORDERS'
  const response = await api.put('/sheets/status', {
    rowIndex,
    status,
    selectedDate,
    sheetType,
  })
  return response.data
}

export const updateOrder = async (order: Order, customerType: 'customer' | 'ctv' = 'customer') => {
  const sheetType = customerType === 'customer' ? 'ORDERS' : 'CTV_ORDERS'
  const response = await api.put(`/sheets/${order.rowIndex}`, { ...order, sheetType })
  return response.data
}

export const addOrder = async (
  order: Omit<Order, 'rowIndex'>,
  customerType: 'customer' | 'ctv' = 'customer',
) => {
  const sheetType = customerType === 'customer' ? 'ORDERS' : 'CTV_ORDERS'
  const response = await api.post(`/sheets?type=${sheetType}`, order)
  return response.data
} 