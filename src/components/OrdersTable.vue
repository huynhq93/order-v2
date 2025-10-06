<template>
  <el-card class="w-full">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Danh sách đơn hàng</h2>
        <!-- Filter Section -->
        <div class="mb-4 flex items-center gap-4">
          <!-- Filter by Customer -->
          <el-select
            v-model="filters.customerName"
            placeholder="Chọn khách hàng"
            clearable
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
            v-model="filters.statuses"
            multiple
            placeholder="Chọn trạng thái"
            collapse-tags
            clearable
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
        style="width: 100%"
        height="450"
        v-loading="loading"
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
              @change="(value) => handleStatusChange(row.rowIndex, value)"
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
import { ref, computed } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { formatCurrency } from '@/utils/format'
import type { Order } from '@/types/order'
import AddOrderForm from './AddOrderForm.vue'
import OrderDetails from './OrderDetails.vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  selectedDate: Date
}>()

const store = useOrdersStore()
const showAddDialog = ref(false)
const showDetailsDialog = ref(false)
const selectedOrder = ref<Order | null>(null)
const statusUpdating = ref<Record<number, boolean>>({})
  const filters = ref({
  customerName: '',
  statuses: ['ĐANG CHỜ GIAO', 'ĐANG GIAO'] as string[],
})


const statusOptions = [
  'NHẬN ĐƠN',
  'ĐANG GIAO',
  'ĐANG CHỜ GIAO',
  'HOÀN THÀNH',
  'Hủy',
]

const uniqueCustomerNames = computed(() => {
  const names = orders.value.map(o => o.customerName)
  return [...new Set(names)]
})

const orders = computed(() => store.orders)
const loading = computed(() => store.loading)

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const matchesCustomer =
      !filters.value.customerName ||
      order.customerName === filters.value.customerName

    const matchesStatus =
      filters.value.statuses.length === 0 ||
      filters.value.statuses.includes(order.status)

    return matchesCustomer && matchesStatus
  })
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

const handleStatusChange = async (rowIndex: number, newStatus: string) => {
  statusUpdating.value[rowIndex] = true
  try {
    await store.updateOrderStatus(rowIndex, newStatus, props.selectedDate)
    ElMessage.success('Đã cập nhật trạng thái đơn hàng')
  } catch (error) {
    ElMessage.error('Không thể cập nhật trạng thái')
  } finally {
    statusUpdating.value[rowIndex] = false
  }
}

const handleOrderAdded = async (newOrder: Order) => {
  // await store.addOrder(newOrder)
  // orders.value.push(newOrder)
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