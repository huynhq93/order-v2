import { defineStore } from 'pinia'
import type { Order } from '@/types/order'
import { getOrders, updateOrderStatus, updateOrder, addOrder } from '@/api/orders'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [] as Order[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchOrders(
      selectedDate: { month: number; year: number },
      customerType: 'customer' | 'ctv' = 'customer',
    ) {
      this.loading = true
      this.error = null // Clear previous error
      try {
        this.orders = await getOrders(selectedDate.month, selectedDate.year, customerType)
      } catch (err) {
        this.orders = [] // Clear orders on error
        this.error = err instanceof Error ? err.message : 'Failed to fetch orders'
      } finally {
        this.loading = false
      }
    },

    async updateOrderStatus(
      rowIndex: number,
      status: string,
      selectedDate: { month: number; year: number },
      customerType: 'customer' | 'ctv' = 'customer',
    ) {
      try {
        await updateOrderStatus(rowIndex, status, selectedDate, customerType)
        const order = this.orders.find((o) => o.rowIndex === rowIndex)
        if (order) {
          order.status = status
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update order status'
        throw err
      }
    },

    async updateOrder(order: Order, customerType: 'customer' | 'ctv' = 'customer') {
      try {
        await updateOrder(order, customerType)
        const index = this.orders.findIndex((o) => o.rowIndex === order.rowIndex)
        if (index !== -1) {
          this.orders[index] = order
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update order'
        throw err
      }
    },

    async addOrder(order: Omit<Order, 'rowIndex'>, customerType: 'customer' | 'ctv' = 'customer') {
      try {
        await addOrder(order, customerType)
        const rowIndex = this.orders.length + 1;
        this.orders.push({...order, ...{rowIndex}})
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to add order'
        throw err
      }
    },

    async updateOrderWithCode(
      rowIndex: number,
      orderCode: string,
      status: string,
      selectedDate: { month: number; year: number },
      customerType: 'customer' | 'ctv' = 'customer',
    ) {
      try {
        // Find the order to update
        const order = this.orders.find((o) => o.rowIndex === rowIndex)
        if (!order) {
          throw new Error('Order not found')
        }

        // Create updated order with orderCode and new status
        const updatedOrder = {
          ...order,
          orderCode,
          status,
          monthForUpdate: selectedDate.month,
          yearForUpdate: selectedDate.year,
        }

        // Update via API
        await updateOrder(updatedOrder, customerType)
        
        // Update local state
        const index = this.orders.findIndex((o) => o.rowIndex === rowIndex)
        if (index !== -1) {
          this.orders[index] = updatedOrder
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update order with code'
        throw err
      }
    },
  },
}) 