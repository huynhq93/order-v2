<template>
  <el-card class="w-full orders-table-card">
    <template #header>
      <!-- Mobile Toggle Button -->
      <div class="mobile-header-toggle" v-if="isMobile">
        <el-button 
          type="primary" 
          :icon="showMobileHeader ? ArrowUp : ArrowDown"
          @click="toggleMobileHeader"
          size="small"
          class="toggle-button"
          circle
          :title="showMobileHeader ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'"
        >
        </el-button>
      </div>

      <div class="header-container" :class="{ 'mobile-hidden': isMobile && !showMobileHeader }">
        <!-- Top Row: Title + Customer Type + Add Button -->
        <div class="top-row">
          <div class="title-section">
            <!-- <h2 class="text-2xl font-bold">Danh sách đơn hàng</h2> -->
            
            <!-- Customer Type Radio + Add Button Row (mobile) -->
            <div class="customer-type-row">
              <el-radio-group v-model="customerType" size="default" class="customer-type-radio">
                <el-radio-button label="customer">Khách</el-radio-button>
                <el-radio-button label="ctv">CTV</el-radio-button>
              </el-radio-group>
              
              <el-button type="primary" @click="showAddDialog = true" class="add-button mobile-add-button">
                Thêm đơn hàng
              </el-button>
            </div>
          </div>
          
          <!-- Desktop Add Button -->
          <el-button type="primary" @click="showAddDialog = true" class="add-button desktop-add-button">
            Thêm đơn hàng
          </el-button>
        </div>
        
        <!-- Filter Row: Customer Select + Status Select -->
        <div class="filter-row">
          <!-- Filter by Customer -->
          <el-select
            :model-value="filters.customerName"
            @update:model-value="updateCustomerFilter"
            placeholder="Chọn khách hàng"
            clearable
            filterable
            :loading="isFiltering"
            class="filter-select"
          >
            <template #prefix>
              <el-icon v-if="isFiltering">
                <Loading />
              </el-icon>
            </template>
            <el-option
              key="all"
              label="Tất cả"
              value=""
            />
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
            class="filter-select"
          >
            <el-option
              v-for="status in statusOptions"
              :key="status"
              :label="status"
              :value="status"
            />
          </el-select>
        </div>
      </div>
    </template>

    <div class="relative">
      <el-table
        ref="tableRef"
        :data="filteredOrders"
        style="width: 100%"
        :height="tableHeight"
        v-loading="loading"
        row-key="rowIndex"
        :show-overflow-tooltip="true"
        :virtualized="filteredOrders.length > 100"
        :estimated-row-height="60"
      >
        <template #empty>
          <div class="text-center py-8">
            <div v-if="hasError" class="text-red-500">
              <el-icon size="48" class="mb-4">
                <Warning />
              </el-icon>
              <p class="text-lg font-medium mb-2">Lỗi khi tải dữ liệu</p>
              <p class="text-sm text-gray-500">{{ store.error }}</p>
            </div>
            <div v-else class="text-gray-500">
              <el-icon size="48" class="mb-4">
                <Document />
              </el-icon>
              <p class="text-lg font-medium mb-2">Không có đơn hàng</p>
              <p class="text-sm">Chưa có đơn hàng nào trong tháng {{ selectedDate.month }}/{{ selectedDate.year }}</p>
            </div>
          </div>
        </template>
        <el-table-column prop="date" label="DATE"  width="70" />
        <el-table-column prop="customerName" label="TÊN KH" min-width="170">
          <template #default="{ row }">
            <span class="customer-name-cell cursor-pointer">{{ row.customerName }}</span>
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
              lazy
              loading="lazy"
            />
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="SẢN PHẨM" min-width="100" />
        <el-table-column prop="orderCode" label="MÃ ĐH" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.orderCode" type="success" size="small">
              {{ row.orderCode }}
            </el-tag>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="color" label="MÀU SẮC" min-width="90" />
        <el-table-column prop="size" label="SIZE" />
        <el-table-column prop="quantity" label="SL" />
        <el-table-column label="TỔNG" min-width="100">
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
              <el-option label="HÀNG VIỆT" value="HÀNG VIỆT" />
              <el-option label="THÀNH CÔNG" value="THÀNH CÔNG" />
              <el-option label="HUỶ ĐƠN" value="HUỶ ĐƠN" />
              <el-option label="HOÀN HÀNG" value="HOÀN HÀNG" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="" width="120">
          <template #default="{ row }">
            <div class="flex gap-1 justify-center">
              <el-button
                type="primary"
                :icon="View"
                circle
                size="small"
                @click="showOrderDetails(row)"
                title="Chi tiết"
              />
              <el-button
                type="success"
                :icon="CopyDocument"
                circle
                size="small"
                @click="duplicateOrder(row)"
                title="Duplicate"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- Pagination -->
      <div class="pagination-container">
        <div class="pagination-info">
          <span>Hiển thị {{ filteredOrders.length }} trong {{ totalCount }} đơn hàng</span>
          <el-icon v-if="pageChanging" class="is-loading">
            <Loading />
          </el-icon>
        </div>
        
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[25, 50, 100, 200, 500, 1000]"
          :total="totalCount"
          :layout="paginationLayout"
          :pager-count="pagerCount"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          :disabled="pageChanging"
          :small="isMobile"
        />
      </div>
    </div>

    <!-- Add Order Dialog -->
    <el-dialog
      v-model="showAddDialog"
      :title="`Thêm đơn hàng mới - ${customerType === 'customer' ? 'Khách hàng' : 'CTV'}`"
      :width="addOrderDialogWidth"
      :close-on-click-modal="false"
      :class="{ 'mobile-dialog': isMobile, 'add-order-dialog': true }"
    >
      <add-order-form
        ref="addOrderFormRef"
        :selected-date="selectedDate"
        :customer-type="customerType"
        @order-added="handleOrderAdded"
        @cancel="showAddDialog = false"
      />
    </el-dialog>

    <!-- Order Details Dialog -->
    <el-dialog
      v-model="showDetailsDialog"
      :title="`CHI TIẾT ĐƠN HÀNG - ${selectedOrder?.customerName || 'Không xác định'}`"
      :width="dialogWidth"
      :close-on-click-modal="false"
      :class="{ 'mobile-dialog': isMobile }"
      @close="handleDetailsDialogClose"
    >
      <order-details
        v-if="selectedOrder"
        ref="orderDetailsRef"
        :order="selectedOrder"
        :selected-date="selectedDate"
        @update="handleOrderUpdated"
      />
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, shallowRef, onUnmounted, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { formatCurrency } from '@/utils/format'
import type { Order } from '@/types/order'
import AddOrderForm from './AddOrderForm.vue'
import OrderDetails from './OrderDetails.vue'
import { ElMessage } from 'element-plus'
import { Loading, View, CopyDocument, Warning, Document, ArrowUp, ArrowDown } from '@element-plus/icons-vue'

const props = defineProps<{
  selectedDate: { month: number; year: number }
}>()

const store = useOrdersStore()
const showAddDialog = ref(false)
const showDetailsDialog = ref(false)
const selectedOrder = ref<Order | null>(null)
const orderDetailsRef = ref()
const addOrderFormRef = ref()
const statusUpdating = ref<Record<number, boolean>>({})

// Customer type selection
const customerType = ref<'customer' | 'ctv'>('customer')

// Mobile header toggle
const showMobileHeader = ref(false)

// Responsive dialog
const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWindowWidth)
})

const isMobile = computed(() => windowWidth.value <= 768)

// Toggle mobile header function
const toggleMobileHeader = () => {
  showMobileHeader.value = !showMobileHeader.value
}

// Dynamic table height calculation
const tableHeight = computed(() => {
  if (!isMobile.value) {
    return 600 // Desktop default
  }
  
  // Mobile: Use similar approach to desktop but with mobile constraints
  const baseHeight = windowHeight.value
  const headerHeight = showMobileHeader.value ? 200 : 50
  const paginationHeight = 80 // Reduced for mobile
  const reservedSpace = 60 // Space for safe area and padding
  
  const calculatedHeight = baseHeight - headerHeight - paginationHeight - reservedSpace
  
  // Use fixed height similar to desktop approach
  return Math.max(calculatedHeight, 400) // Ensure reasonable minimum
})

const dialogWidth = computed(() => {
  if (windowWidth.value <= 480) return '95vw'
  if (windowWidth.value <= 768) return '90vw'
  return '1000px'
})

const addOrderDialogWidth = computed(() => {
  if (windowWidth.value <= 480) return '95vw'
  if (windowWidth.value <= 768) return '90vw'
  return '1200px'
})

// Responsive pagination
const paginationLayout = computed(() => {
  return 'sizes, prev, pager, next, jumper'
})

const pagerCount = computed(() => {
  if (windowWidth.value <= 480) return 3
  if (windowWidth.value <= 768) return 5
  return 7
})

// Use shallowRef for better performance on filter changes
const filters = shallowRef({
  customerName: '',
  statuses: ['NHẬN ĐƠN', 'ĐÃ ĐẶT HÀNG', 'HÀNG VỀ', 'ĐANG CHỜ GIAO', 'ĐANG GIAO'] as string[],
})

// Pagination state
const currentPage = ref(1)
const pageSize = ref(50) // 50 items per page
const pageChanging = ref(false) // Loading state for page changes

// Debouncing state
const filterTimeout = ref<number | null>(null)
const isFiltering = ref(false)


const statusOptions = [
  'NHẬN ĐƠN',
  'HÀNG VIỆT',
  'ĐÃ ĐẶT HÀNG',
  'HÀNG VỀ',
  'ĐANG CHỜ GIAO',
  'ĐANG GIAO',
  'THÀNH CÔNG',
  'HUỶ ĐƠN',
  'HOÀN HÀNG'
]


// Watch customer type changes and reload data
watch(customerType, async (newType) => {
  // Reset pagination
  currentPage.value = 1
  
  // Reload orders with new sheet type
  await store.fetchOrders(props.selectedDate, newType)
  
  // Show error message if there's an error
  if (store.error) {
    ElMessage.error(`Lỗi khi tải dữ liệu ${newType === 'customer' ? 'Khách hàng' : 'CTV'}: ${store.error}`)
  }
}, { immediate: false })

// Watch selectedDate changes and reload data with current customer type
watch(() => props.selectedDate, async (newDate) => {
  // Reset pagination
  currentPage.value = 1
  
  // Reload orders with current customer type and new date
  await store.fetchOrders(newDate, customerType.value)
  
  // Show error message if there's an error
  if (store.error) {
    ElMessage.error(`Lỗi khi tải dữ liệu tháng ${newDate.month}/${newDate.year}: ${store.error}`)
  }
}, { deep: true, immediate: true })

// Watch showAddDialog to refresh form data when dialog opens
watch(showAddDialog, async (isOpen) => {
  if (isOpen && addOrderFormRef.value?.refreshFormData) {
    // Refresh form data when dialog opens to get latest products and customers
    await addOrderFormRef.value.refreshFormData()
  }
})

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
const loading = computed(() => store.loading || isFiltering.value || pageChanging.value)
const hasError = computed(() => !!store.error)

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

// Displayed orders với pagination
const filteredOrders = computed(() => {
  const filtered = preFilteredOrders.value
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

// Total count
const totalCount = computed(() => preFilteredOrders.value.length)

const getStatusColor = (status: string) => {
  switch (status) {
    case 'NHẬN ĐƠN':
      return 'bg-blue-100 text-blue-800'
    case 'ĐÃ ĐẶT HÀNG':
      return 'bg-purple-100 text-purple-800'
    case 'HÀNG VỀ':
      return 'bg-indigo-100 text-indigo-800'
    case 'ĐANG CHỜ GIAO':
      return 'bg-orange-100 text-orange-800'
    case 'ĐANG GIAO':
      return 'bg-yellow-100 text-yellow-800'
    case 'THÀNH CÔNG':
      return 'bg-green-100 text-green-800'
    case 'HUỶ ĐƠN':
      return 'bg-red-100 text-red-800'
    case 'HOÀN HÀNG':
      return 'bg-pink-100 text-pink-800'
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
    resetFilters() // Reset to page 1
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
    resetFilters() // Reset to page 1
    isFiltering.value = false
  }, 200) // 200ms debounce for status (usually faster)
}

// Pagination handlers
const handlePageChange = async (page: number) => {
  pageChanging.value = true
  // Add small delay for better UX
  await new Promise(resolve => setTimeout(resolve, 200))
  currentPage.value = page
  pageChanging.value = false
}

const handleSizeChange = async (size: number) => {
  pageChanging.value = true
  // Add small delay for better UX
  await new Promise(resolve => setTimeout(resolve, 200))
  pageSize.value = size
  currentPage.value = 1 // Reset to first page
  pageChanging.value = false
}

// Reset page when filters change
const resetFilters = () => {
  currentPage.value = 1
}

onUnmounted(() => {
  if (filterTimeout.value) {
    clearTimeout(filterTimeout.value)
  }
})

const handleStatusChange = async (rowIndex: number, newStatus: string) => {
  statusUpdating.value[rowIndex] = true
  try {
    await store.updateOrderStatus(rowIndex, newStatus, props.selectedDate, customerType.value)
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
  store.updateOrder(updatedOrder, customerType.value)
  showDetailsDialog.value = false
  ElMessage.success('Đã cập nhật thông tin đơn hàng')
}

const handleDetailsDialogClose = () => {
  // Reset editing state when dialog is closed
  if (orderDetailsRef.value && orderDetailsRef.value.resetEditingState) {
    orderDetailsRef.value.resetEditingState()
  }
}

const showOrderDetails = (order: Order) => {
  selectedOrder.value = order
  showDetailsDialog.value = true
}

const duplicateOrder = (order: Order) => {
  // Show add dialog first
  showAddDialog.value = true
  
  // Wait for next tick to ensure the form is mounted
  nextTick(() => {
    if (addOrderFormRef.value && addOrderFormRef.value.populateForm) {
      // Populate form with order data
      addOrderFormRef.value.populateForm({
        customerName: order.customerName,
        productName: order.productName,
        productCode: order.productCode,
        color: order.color,
        size: order.size,
        quantity: order.quantity,
        total: order.total,
        productImage: order.productImage,
        linkFb: order.linkFb,
        contactInfo: order.contactInfo,
        note: order.note || ''
      })
    }
  })
}
</script>

<style scoped>
/* Orders Table Card Layout */
.orders-table-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.orders-table-card .el-card__body) {
  flex: 1;
  padding: 0;
  overflow: hidden;
}

/* Mobile Header Toggle */
.mobile-header-toggle {
  display: flex;
  justify-content: center;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.toggle-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Header Layout */
.header-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease;
}

.header-container.mobile-hidden {
  display: none;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.customer-type-radio {
  margin-left: 8px;
}

.customer-type-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.add-button {
  flex-shrink: 0;
}

/* Show/hide buttons based on screen size */
.mobile-add-button {
  display: none;
}

.desktop-add-button {
  display: block;
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.filter-select {
  width: 200px;
}

.el-select {
  width: 100%;
}

/* Customer name cell styling */
.customer-name-cell {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  max-height: calc(1.4em * 2);
  word-break: break-word;
}

/* Mobile dialog optimization */
:deep(.mobile-dialog .el-dialog) {
  margin: 5vh auto !important;
}

:deep(.mobile-dialog .el-dialog__body) {
  padding: 10px !important;
}

/* Desktop styling */
@media (min-width: 769px) {
  .mobile-header-toggle {
    display: none;
  }
  
  /* Pagination container for desktop */
  .pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 0 16px;
    position: static;
    background: transparent;
    border-top: none;
  }
  
  .pagination-info {
    font-size: 14px;
    color: #606266;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

@media (max-width: 768px) {
  /* Mobile specific styling */
  .orders-table-card {
    height: 100vh;
    margin: 0;
    border-radius: 0;
    position: relative;
    width: 100%;
  }
  
  :deep(.orders-table-card .el-card__header) {
    padding: 0;
    flex-shrink: 0;
  }
  
  :deep(.orders-table-card .el-card__body) {
    padding: 0 8px 0 8px;
    display: flex;
    flex-direction: column;
    height: calc(100vh - var(--header-height, 50px));
    overflow: visible;
  }
  
  /* Header responsive */
  .header-container {
    padding: 12px;
    background: #f5f7fa;
  }
  
  .top-row {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .title-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .title-section h2 {
    margin: 0;
  }
  
  .customer-type-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  .customer-type-radio {
    margin-left: 0;
  }
  
  /* Toggle button visibility */
  .mobile-add-button {
    display: block !important;
    min-width: auto;
    padding: 0 12px;
    font-size: 14px;
  }
  
  .desktop-add-button {
    display: none !important;
  }
  
  .filter-row {
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
  
  .filter-select {
    width: 100%;
  }
  
  /* Table container optimization - Simplified like desktop */
  .relative {
    flex: 1;
    display: block;
    overflow: visible;
  }
  
  /* Remove complex CSS that might interfere with table scroll */
  :deep(.el-table) {
    width: 100%;
    /* Let Element Plus handle the scrolling naturally */
  }
  
  /* Pagination mobile styling - Simplified */
  .pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 8px;
    background: #f9f9f9;
    border-top: 1px solid #ebeef5;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .pagination-info {
    font-size: 12px;
    order: 2;
    width: 100%;
    text-align: center;
  }
  
  :deep(.el-pagination) {
    order: 1;
    justify-content: center;
    flex-wrap: wrap;
    margin: 0 auto;
  }
  
  .pagination-info {
    font-size: 12px;
  }
  
  :deep(.el-pagination) {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  :deep(.el-pagination .el-pager) {
    margin: 0 2px;
  }
  
  :deep(.el-pagination .btn-prev),
  :deep(.el-pagination .btn-next) {
    margin: 0 2px;
  }
  
  :deep(.el-dialog) {
    margin: 5vh auto !important;
  }
  
  :deep(.el-dialog__header) {
    padding: 15px 15px 10px !important;
    text-align: center !important;
  }
  
  :deep(.el-dialog__body) {
    padding: 10px 15px 20px !important;
  }
  
  :deep(.el-dialog__title) {
    font-size: 1.1rem !important;
    font-weight: bold !important;
  }
}

@media (max-width: 480px) {
  :deep(.el-dialog) {
    margin: 2vh auto !important;
  }
  
  :deep(.el-dialog__header) {
    padding: 12px 12px 8px !important;
    text-align: center !important;
  }
  
  :deep(.el-dialog__body) {
    padding: 8px 12px 15px !important;
  }
  
  :deep(.el-dialog__title) {
    font-size: 1rem !important;
    font-weight: bold !important;
  }
}

/* Desktop dialog styling */
:deep(.el-dialog__header) {
  text-align: center !important;
}

:deep(.el-dialog__title) {
  font-weight: bold !important;
}

/* Desktop dialog height optimization */
:deep(.el-dialog) {
  max-height: 120vh !important;
  margin: 2vh auto !important;
}

:deep(.el-dialog__body) {
  max-height: calc(120vh - 120px) !important;
  overflow-y: auto !important;
}

/* Add Order Dialog specific styling */
:deep(.add-order-dialog .el-dialog) {
  max-height: 95vh !important;
  margin: 2.5vh auto !important;
}

:deep(.add-order-dialog .el-dialog__body) {
  max-height: calc(95vh - 120px) !important;
  overflow-y: auto !important;
  padding: 0 !important;
}

/* Mobile styling for Add Order Dialog */
@media (max-width: 768px) {
  :deep(.add-order-dialog.mobile-dialog .el-dialog) {
    margin: 5vh auto !important;
    max-height: 90vh !important;
  }
  
  :deep(.add-order-dialog.mobile-dialog .el-dialog__body) {
    max-height: calc(90vh - 100px) !important;
    padding: 0 !important;
  }
  
  /* Mobile pagination styling */
  .flex.justify-between.items-center.mt-4 {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
  
  :deep(.el-pagination) {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  :deep(.el-pagination .el-pager) {
    margin: 0 4px;
  }
  
  :deep(.el-pagination .btn-prev),
  :deep(.el-pagination .btn-next) {
    margin: 0 4px;
  }
}

@media (max-width: 480px) {
  /* Extra small mobile pagination */
  :deep(.el-pagination) {
    font-size: 12px;
  }
  
  :deep(.el-pagination .el-pager li) {
    min-width: 28px;
    height: 28px;
    line-height: 28px;
    font-size: 12px;
  }
  
  :deep(.el-pagination .btn-prev),
  :deep(.el-pagination .btn-next) {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}
</style> 