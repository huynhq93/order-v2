<template>
  <el-card class="w-full">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Danh sách đơn hàng</h2>
        <!-- Filter Section -->
        <div class="mb-4 flex items-center gap-4">
          <!-- Filter by Customer -->
          <el-select
            :model-value="filters.customerName"
            @update:model-value="updateCustomerFilter"
            placeholder="Chọn khách hàng"
            clearable
            :loading="isFiltering"
            class="w-100!"
          >
            <el-option
              v-for="name in uniqueCustomerNames"
              :key="name"
              :label="name"
              :value="name"
            />
          </el-select>

          <!-- Filter by Status -->
          <el-select
            :model-value="filters.statuses"
            @update:model-value="updateStatusFilter"
            multiple
            placeholder="Chọn trạng thái"
            collapse-tags
            clearable
            :loading="isFiltering"
            class="w-100"
          >
            <el-option
              v-for="status in statusOptions"
              :key="status"
              :label="status"
              :value="status"
            />
          </el-select>
        </div>
        <el-button type="primary" @click="showAddDialog = true">
          Thêm đơn hàng
        </el-button>
      </div>
    </template>

    <div class="relative">
      <el-table
        :data="filteredOrders"
        :key="`table-infinity-${displayCount}`"
        style="width: 100%"
        height="450"
        v-loading="loading"
        row-key="rowIndex"
        :show-overflow-tooltip="true"
      >
        <el-table-column prop="date" label="DATE" />
        <el-table-column prop="customerName" label="TÊN KH" min-width="200">
          <template #default="{ row }">
            <span class="truncate cursor-pointer">{{ row.customerName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="HÌNH ẢNH" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.productImage"
              :src="row.productImage"
              :preview-src-list="[row.productImage]"
              fit="cover"
              class="w-10 h-10 rounded"
            />
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="SẢN PHẨM" />
        <el-table-column prop="color" label="MÀU SẮC" />
        <el-table-column prop="size" label="SIZE" />
        <el-table-column prop="quantity" label="SL" />
        <el-table-column label="TỔNG">
          <template #default="{ row }">
            {{ formatCurrency(row.total) }}
          </template>
        </el-table-column>
        <el-table-column label="TRẠNG THÁI" width="150">
          <template #default="{ row }">
            <el-select
              v-model="row.status"
              :loading="statusUpdating[row.rowIndex]"
              @change="(value: string) => handleStatusChange(row.rowIndex, value)"
              :class="getStatusColor(row.status)"
            >
              <el-option label="NHẬN ĐƠN" value="NHẬN ĐƠN" />
              <el-option label="ĐANG GIAO" value="ĐANG GIAO" />
              <el-option label="ĐANG CHỜ GIAO" value="ĐANG CHỜ GIAO" />
              <el-option label="HUỶ" value="Hủy" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="" width="100">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="showOrderDetails(row)"
            >
              Chi tiết
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- Infinity Loading Indicator -->
      <div class="flex flex-col items-center mt-4">
        <div class="text-sm text-gray-500 mb-2">
          Hiển thị {{ filteredOrders.length }} trong tổng số {{ totalItems }} đơn hàng
        </div>
        
        <!-- Load More Button -->
        <div v-if="hasMoreItems" class="flex items-center space-x-2">
          <el-button 
            @click="loadMore"
            :loading="loadingMore"
            type="primary"
            plain
          >
            {{ loadingMore ? 'Đang tải...' : `Tải thêm ${Math.min(loadIncrement, totalItems - displayCount)} đơn hàng` }}
          </el-button>
          <span class="text-xs text-gray-400">
            hoặc cuộn xuống để tự động tải
          </span>
        </div>
        
        <!-- All loaded message -->
        <div v-else-if="totalItems > 0" class="text-sm text-green-600">
          ✓ Đã tải tất cả đơn hàng
        </div>
      </div>
    </div>

    <!-- Add Order Dialog -->
    <el-dialog
      v-model="showAddDialog"
      title="Thêm đơn hàng mới"
      width="600px"
    >
      <add-order-form
        :selected-date="selectedDate"
        @order-added="handleOrderAdded"
        @cancel="showAddDialog = false"
      />
    </el-dialog>

    <!-- Order Details Dialog -->
    <el-dialog
      v-model="showDetailsDialog"
      title="Chi tiết đơn hàng"
      width="600px"
    >
      <order-details
        v-if="selectedOrder"
        :order="selectedOrder"
        @update="handleOrderUpdated"
      />
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, shallowRef } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { formatCurrency } from '@/utils/format'
import type { Order } from '@/types/order'
import AddOrderForm from './AddOrderForm.vue'
import OrderDetails from './OrderDetails.vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  selectedDate: { month: number; year: number }
}>()

const store = useOrdersStore()
const showAddDialog = ref(false)
const showDetailsDialog = ref(false)
const selectedOrder = ref<Order | null>(null)
const statusUpdating = ref<Record<number, boolean>>({})

// Infinity loading state
const displayCount = ref(50) // Start with 50 items
const loadingMore = ref(false)
const loadIncrement = 25 // Load 25 more items each time

// Use shallowRef for better performance on filter changes
const filters = shallowRef({
  customerName: '',
  statuses: ['ĐANG CHỜ GIAO', 'ĐANG GIAO'] as string[],
})

// Debouncing state
const filterTimeout = ref<number | null>(null)
const isFiltering = ref(false)


const statusOptions = [
  'NHẬN ĐƠN',
  'ĐANG GIAO',
  'ĐANG CHỜ GIAO',
  'HOÀN THÀNH',
  'Hủy',
]

// Optimized computed for unique customer names with memoization
const uniqueCustomerNames = computed(() => {
  const ordersData = orders.value
  if (!ordersData.length) return []
  
  const names = new Set<string>()
  for (const order of ordersData) {
    if (order.customerName) {
      names.add(order.customerName)
    }
  }
  return Array.from(names).sort()
})

const orders = computed(() => store.orders)
const loading = computed(() => store.loading || isFiltering.value)

// Fast pre-filtered orders (without pagination)
const preFilteredOrders = computed(() => {
  const ordersData = orders.value
  if (!ordersData.length) return []
  
  const { customerName, statuses } = filters.value
  
  // If no filters applied, return all orders
  if (!customerName && statuses.length === 0) {
    return ordersData
  }
  
  // Use optimized filtering
  const filtered = []
  for (let i = 0; i < ordersData.length; i++) {
    const order = ordersData[i]
    
    // Check customer name first (usually more selective)
    if (customerName && order.customerName !== customerName) {
      continue
    }
    
    // Check status
    if (statuses.length > 0 && !statuses.includes(order.status)) {
      continue
    }
    
    filtered.push(order)
  }
  
  return filtered
})

// Total items for display info
const totalItems = computed(() => preFilteredOrders.value.length)

// Displayed orders with infinity loading
const filteredOrders = computed(() => {
  const filtered = preFilteredOrders.value
  return filtered.slice(0, displayCount.value)
})

// Check if there are more items to load
const hasMoreItems = computed(() => {
  return displayCount.value < preFilteredOrders.value.length
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'NHẬN ĐƠN':
      return 'bg-blue-100 text-blue-800'
    case 'ĐANG GIAO':
      return 'bg-yellow-100 text-yellow-800'
    case 'ĐANG CHỜ GIAO':
      return 'bg-orange-100 text-orange-800'
    case 'HOÀN THÀNH':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Optimized filter update functions with debouncing
const updateCustomerFilter = (customerName: string) => {
  if (filterTimeout.value) {
    clearTimeout(filterTimeout.value)
  }
  
  isFiltering.value = true
  filterTimeout.value = window.setTimeout(() => {
    filters.value = { ...filters.value, customerName }
    displayCount.value = 50 // Reset display count when filter changes
    isFiltering.value = false
  }, 300) // 300ms debounce
}

const updateStatusFilter = (statuses: string[]) => {
  if (filterTimeout.value) {
    clearTimeout(filterTimeout.value)
  }
  
  isFiltering.value = true
  filterTimeout.value = window.setTimeout(() => {
    filters.value = { ...filters.value, statuses }
    displayCount.value = 50 // Reset display count when filter changes
    isFiltering.value = false
  }, 200) // 200ms debounce for status (usually faster)
}

// Infinity loading function
const loadMore = async () => {
  if (loadingMore.value || !hasMoreItems.value) return
  
  loadingMore.value = true
  
  // Add a small delay for better UX
  await new Promise(resolve => setTimeout(resolve, 300))
  
  displayCount.value += loadIncrement
  loadingMore.value = false
}

const handleStatusChange = async (rowIndex: number, newStatus: string) => {
  statusUpdating.value[rowIndex] = true
  try {
    await store.updateOrderStatus(rowIndex, newStatus, props.selectedDate)
    ElMessage.success('Đã cập nhật trạng thái đơn hàng')
  } catch {
    ElMessage.error('Không thể cập nhật trạng thái')
  } finally {
    statusUpdating.value[rowIndex] = false
  }
}

const handleOrderAdded = async () => {
  showAddDialog.value = false
  ElMessage.success('Đã thêm đơn hàng mới')
}

const handleOrderUpdated = (updatedOrder: Order) => {
  store.updateOrder(updatedOrder)
  showDetailsDialog.value = false
  ElMessage.success('Đã cập nhật thông tin đơn hàng')
}

const showOrderDetails = (order: Order) => {
  selectedOrder.value = order
  showDetailsDialog.value = true
}
</script>

<style scoped>
.el-select {
  width: 100%;
}
</style> 