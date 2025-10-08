<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Quản lý đơn hàng</h1>
      <MonthSelector v-model="selectedDate" />
    </div>

    <OrdersTable
      :selected-date="selectedDate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import OrdersTable from '@/components/OrdersTable.vue'
import MonthSelector from '@/components/MonthSelector.vue'

const selectedDate = ref({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear()
})
</script> 