<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Quản lý đơn hàng</h1>
      <MonthSelector v-model="selectedDate" />
    </div>

    <OrdersTable
      :orders="orders"
      :loading="loading"
      :selected-date="selectedDate"
      @update-status="handleUpdateStatus"
      @update-order="handleUpdateOrder"
      @add-order="handleAddOrder"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import OrdersTable from '@/components/OrdersTable.vue'
import MonthSelector from '@/components/MonthSelector.vue'
import type { Order } from '@/types/order'

const store = useOrdersStore()
const orders = ref<Order[]>([])
const loading = ref(false)
const selectedDate = ref({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear()
})

onMounted(async () => {
  await fetchOrders()
})

// Watch for selectedDate changes and fetch new data
watch(selectedDate, async () => {
  await fetchOrders()
}, { deep: true })

const fetchOrders = async () => {
  loading.value = true
  try {
    await store.fetchOrders(selectedDate.value.month, selectedDate.value.year)
    orders.value = store.orders
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  } finally {
    loading.value = false
  }
}

const handleUpdateStatus = async (rowIndex: number, status: string) => {
  try {
    await store.updateOrderStatus(rowIndex, status, selectedDate.value)
    await fetchOrders()
  } catch (error) {
    console.error('Failed to update order status:', error)
  }
}

const handleUpdateOrder = async (order: Order) => {
  try {
    await store.updateOrder(order)
    await fetchOrders()
  } catch (error) {
    console.error('Failed to update order:', error)
  }
}

const handleAddOrder = async (order: Omit<Order, 'rowIndex'>) => {
  try {
    await store.addOrder(order)
    await fetchOrders()
  } catch (error) {
    console.error('Failed to add order:', error)
  }
}
</script> 