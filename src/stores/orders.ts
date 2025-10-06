import { defineStore } from 'pinia'
import type { Order } from '@/types/order'
import { getOrders, updateOrderStatus, updateOrder, addOrder } from '@/api/orders'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [] as Order[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchOrders(month: number, year: number) {
      this.loading = true
      try {
        this.orders = await getOrders(month, year)
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch orders'
      } finally {
        this.loading = false
      }
    },

    async updateOrderStatus(rowIndex: number, status: string, selectedDate: Date) {
      try {
        await updateOrderStatus(rowIndex, status, selectedDate)
        const order = this.orders.find(o => o.rowIndex === rowIndex)
        if (order) {
          order.status = status
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update order status'
        throw err
      }
    },

    async updateOrder(order: Order) {
      try {
        await updateOrder(order)
        const index = this.orders.findIndex(o => o.rowIndex === order.rowIndex)
        if (index !== -1) {
          this.orders[index] = order
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update order'
        throw err
      }
    },

    async addOrder(order: Omit<Order, 'rowIndex'>) {
      try {
        await addOrder(order)
        const rowIndex = this.orders.length + 1;
        this.orders.push({...order, ...{rowIndex}})
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to add order'
        throw err
      }
    }
  }
}) 