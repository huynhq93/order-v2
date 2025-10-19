<template>
  <div class="order-code-view">
    <MonthSelector
      v-model="selectedDate"
      @update:model-value="handleDateChange"
      class="mb-6"
    />
    
    <ShippingCodeManager
      :selected-date="selectedDate"
      @updated="handleOrderUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MonthSelector from '@/components/MonthSelector.vue'
import ShippingCodeManager from '@/components/ShippingCodeManager.vue'

// Current date for initial selection
const currentDate = new Date()
const selectedDate = ref({
  month: currentDate.getMonth() + 1,
  year: currentDate.getFullYear()
})

const handleDateChange = (newDate: { month: number; year: number }) => {
  selectedDate.value = newDate
}

const handleOrderUpdated = () => {
  // Handle any additional actions when orders are updated
  console.log('Orders updated successfully')
}
</script>

<style scoped>
.order-code-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .order-code-view {
    padding: 16px;
  }
}
</style>
