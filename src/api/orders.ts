import axios from 'axios'
import type { Order } from '@/types/order'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5176/api'
})

export const getOrders = async (month: number, year: number) => {
  const response = await api.get(`/sheets?type=ORDERS&month=${month}&year=${year}`)
  console.log(response.data.data)
  return response.data.data
}

export const updateOrderStatus = async (rowIndex: number, status: string, selectedDate: {month: number; year: number}) => {
  const response = await api.put('/orders', {
    rowIndex,
    status,
    selectedDate
  })
  return response.data
}

export const updateOrder = async (order: Order) => {
  const response = await api.put(`/orders/${order.rowIndex}`, order)
  return response.data
}

export const addOrder = async (order: Omit<Order, 'rowIndex'>) => {
  const response = await api.post('/sheets?type=ORDERS', order)
  return response.data
} 