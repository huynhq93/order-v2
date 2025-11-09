<template>
  <div class="order-viet">
    <!-- Navigation Menu -->
    <NavigationMenu active-menu-item="order-viet" />

    <el-card class="header-card">
      <h1>Xử Lý Hàng Việt</h1>

      <!-- Month/Year Selector -->
      <div class="month-selector">
        <el-select
          v-model="selectedMonths"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="Chọn các tháng cần xem"
          style="width: 300px"
        >
          <el-option
            v-for="month in availableMonths"
            :key="month.value"
            :label="month.label"
            :value="month.value"
          />
        </el-select>
        <el-button type="primary" @click="loadOrders">Tải Đơn Hàng</el-button>
      </div>
    </el-card>

    <!-- Bill Selector and Actions -->
    <el-card v-if="orders.length > 0" class="action-card">
      <h2>Chọn Bill và Orders</h2>

      <el-form label-width="120px" label-position="left">
        <el-form-item label="Chọn Bill">
          <el-select
            v-model="selectedBillCode"
            placeholder="Chọn bill (chỉ bill đang vận chuyển)"
            style="width: 100%"
            @change="handleBillChange"
          >
            <el-option
              v-for="bill in availableBills"
              :key="bill.billCode"
              :label="`${bill.billCode} - SL: ${bill.quantity}`"
              :value="bill.billCode"
              style="height: 70px"
            >
              <div style="display: flex; align-items: center; gap: 12px">
                <img 
                  v-if="bill.imageUrl" 
                  :src="bill.imageUrl" 
                  style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px" 
                  alt="Bill"
                />
                <div style="flex: 1">
                  <div style="font-weight: 600">{{ bill.billCode }}</div>
                  <div style="color: #8492a6; font-size: 12px">
                    Số lượng: {{ bill.quantity }}{{ bill.note ? ` | ${bill.note}` : '' }}
                  </div>
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- Bill Image Preview -->
        <el-form-item v-if="selectedBill && selectedBill.imageUrl" label="Hình Ảnh Bill">
          <div class="bill-image-preview">
            <el-image
              :key="selectedBill.billCode"
              :src="selectedBill.imageUrl"
              fit="scale-down"
              style="width: 100%; max-width: 600px; min-height: 300px; cursor: pointer"
              :preview-src-list="[selectedBill.imageUrl]"
              :initial-index="0"
              :z-index="9999"
              :preview-teleported="true"
            >
              <template #placeholder>
                <div class="image-loading">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <span>Đang tải...</span>
                </div>
              </template>
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                  <span>Không thể tải ảnh</span>
                </div>
              </template>
            </el-image>
            <div class="image-hint">
              <el-icon><ZoomIn /></el-icon>
              <span>Nhấp vào ảnh để phóng to xem chi tiết</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item v-if="selectedBillCode">
          <div style="width: 100%">
            <!-- Quantity Warning -->
            <el-alert
              v-if="selectedOrders.length > 0 && !quantitiesMatch"
              type="warning"
              :closable="false"
              style="margin-bottom: 15px"
            >
              <template #title>
                <strong>⚠️ Cảnh báo số lượng không khớp!</strong>
              </template>
              <div style="margin-top: 8px">
                Tổng số lượng đơn hàng đã chọn: <strong>{{ selectedOrdersQuantity }}</strong>
                <br />
                Số lượng của Bill {{ selectedBillCode }}: <strong>{{ selectedBill?.quantity }}</strong>
                <br />
                <span style="color: #e6a23c">
                  Vui lòng kiểm tra lại để tránh chọn sai đơn hàng!
                </span>
              </div>
            </el-alert>

            <!-- Success Info -->
            <el-alert
              v-if="selectedOrders.length > 0 && quantitiesMatch"
              type="success"
              :closable="false"
              style="margin-bottom: 15px"
            >
              <div>
                ✓ Số lượng khớp: <strong>{{ selectedOrdersQuantity }}</strong> đơn hàng
              </div>
            </el-alert>

            <el-button
              type="success"
              :disabled="selectedOrders.length === 0"
              :loading="processing"
              @click="processOrders"
            >
              Xử Lý {{ selectedOrders.length }} Đơn Hàng
            </el-button>
            <span style="margin-left: 10px; color: #909399">
              (Cập nhật status thành "HÀNG VỀ" và thêm mã bill)
            </span>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Orders Table -->
    <el-card class="table-card">
      <h2>Danh Sách Orders "HÀNG VIỆT"</h2>

      <el-table
        :data="orders"
        border
        stripe
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" :selectable="isSelectable" />

        <el-table-column prop="date" label="Ngày" width="80" />

        <el-table-column prop="customerName" label="Khách Hàng" width="150" />

        <el-table-column label="Hình Ảnh" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.productImage"
              :src="row.productImage"
              fit="cover"
              style="width: 60px; height: 60px; cursor: pointer"
              :preview-src-list="[row.productImage]"
            />
          </template>
        </el-table-column>

        <el-table-column prop="productName" label="Sản Phẩm" min-width="200" />

        <el-table-column label="Màu/Size" width="120">
          <template #default="{ row }">
            <div>{{ row.color }}</div>
            <div style="color: #909399; font-size: 12px">{{ row.size }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="quantity" label="SL" width="60" align="center" />

        <el-table-column label="Tổng" width="120">
          <template #default="{ row }">
            {{ formatCurrency(row.total) }}
          </template>
        </el-table-column>

        <el-table-column label="Liên Hệ" width="150">
          <template #default="{ row }">
            <div style="font-size: 12px">
              <div>{{ row.contactInfo }}</div>
              <el-link
                v-if="row.linkFb"
                :href="row.linkFb"
                target="_blank"
                type="primary"
                style="font-size: 12px"
              >
                Facebook
              </el-link>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Nguồn" width="100">
          <template #default="{ row }">
            <el-tag :type="row.sheetType === 'ORDERS' ? 'primary' : 'success'" size="small">
              {{ row.sheetType === 'ORDERS' ? 'BÁN HÀNG' : 'CTV' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="month" label="Tháng" width="100" />

        <el-table-column prop="note" label="Ghi Chú" min-width="150" />
      </el-table>

      <div v-if="orders.length === 0 && !loading" class="empty-state">
        <p>Không có đơn hàng "HÀNG VIỆT" nào</p>
        <p style="color: #909399; font-size: 14px">Vui lòng chọn tháng và tải đơn hàng</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ZoomIn, Picture, Loading } from '@element-plus/icons-vue'
import NavigationMenu from '@/components/NavigationMenu.vue'
import {
  getHangVietOrders,
  processHangVietOrders,
  getOrderVietBills,
  type HangVietOrder,
  type OrderVietBill,
} from '@/api/orderViet'

// State
const selectedMonths = ref<string[]>([])
const orders = ref<HangVietOrder[]>([])
const selectedOrders = ref<HangVietOrder[]>([])
const selectedBillCode = ref('')
const availableBills = ref<OrderVietBill[]>([])
const loading = ref(false)
const processing = ref(false)

// Generate available months (last 6 months)
const availableMonths = computed(() => {
  const months = []
  const now = new Date()

  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = date.getMonth() + 1
    const year = date.getFullYear()

    months.push({
      value: `${month}_${year}`,
      label: `Tháng ${month}/${year}`,
    })
  }

  return months
})

// Load orders with "HÀNG VIỆT" status
async function loadOrders() {
  if (selectedMonths.value.length === 0) {
    ElMessage.warning('Vui lòng chọn ít nhất 1 tháng')
    return
  }

  try {
    loading.value = true
    orders.value = await getHangVietOrders(selectedMonths.value)

    // Load available bills (only "ĐANG VẬN CHUYỂN" status)
    await loadAvailableBills()

    if (orders.value.length === 0) {
      ElMessage.info('Không có đơn hàng "HÀNG VIỆT" trong các tháng đã chọn')
    } else {
      ElMessage.success(`Đã tải ${orders.value.length} đơn hàng`)
    }
  } catch (error) {
    console.error('Error loading orders:', error)
    ElMessage.error('Không thể tải danh sách đơn hàng')
  } finally {
    loading.value = false
  }
}

// Load available bills from selected months
async function loadAvailableBills() {
  try {
    const allBills: OrderVietBill[] = []

    for (const monthYear of selectedMonths.value) {
      const [month, year] = monthYear.split('_')
      const bills = await getOrderVietBills(parseInt(month), parseInt(year))

      // Only include bills with "ĐANG VẬN CHUYỂN" status
      const activeBills = bills.filter((bill) => bill.status === 'ĐANG VẬN CHUYỂN')
      allBills.push(...activeBills)
    }

    availableBills.value = allBills
  } catch (error) {
    console.error('Error loading bills:', error)
  }
}

// Handle bill selection change
function handleBillChange() {
  // Reset selected orders when bill changes
  selectedOrders.value = []
}

// Handle order selection change
function handleSelectionChange(selection: HangVietOrder[]) {
  selectedOrders.value = selection
}

// Check if row is selectable (only if bill is selected)
function isSelectable() {
  return !!selectedBillCode.value
}

// Calculate total quantity of selected orders
const selectedOrdersQuantity = computed(() => {
  return selectedOrders.value.reduce((sum, order) => sum + parseInt(order.quantity), 0)
})

// Get selected bill details
const selectedBill = computed(() => {
  return availableBills.value.find((bill) => bill.billCode === selectedBillCode.value)
})

// Check if quantities match
const quantitiesMatch = computed(() => {
  if (!selectedBill.value || selectedOrders.value.length === 0) return true
  return selectedOrdersQuantity.value === parseInt(selectedBill.value.quantity)
})

// Process selected orders
async function processOrders() {
  if (!selectedBillCode.value) {
    ElMessage.warning('Vui lòng chọn bill')
    return
  }

  if (selectedOrders.value.length === 0) {
    ElMessage.warning('Vui lòng chọn ít nhất 1 đơn hàng')
    return
  }

  try {
    // Show warning if quantities don't match
    const quantityWarning = !quantitiesMatch.value
      ? `\n\n⚠️ CẢNH BÁO: Số lượng không khớp!\nĐã chọn: ${selectedOrdersQuantity.value} | Bill: ${selectedBill.value?.quantity}`
      : ''

    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xử lý ${selectedOrders.value.length} đơn hàng?
      - Cập nhật status thành "HÀNG VỀ"
      - Thêm mã bill: ${selectedBillCode.value}${quantityWarning}`,
      'Xác Nhận Xử Lý',
      {
        confirmButtonText: 'Xác Nhận',
        cancelButtonText: 'Huỷ',
        type: quantitiesMatch.value ? 'warning' : 'error',
      },
    )

    processing.value = true

    // Prepare order data for processing
    const orderData = selectedOrders.value.map((order) => ({
      rowIndex: order.rowIndex,
      month: order.month,
      sheetType: order.sheetType,
    }))

    await processHangVietOrders(orderData, selectedBillCode.value)

    ElMessage.success('Xử lý đơn hàng thành công!')

    // Reload orders
    await loadOrders()

    // Reset selections
    selectedBillCode.value = ''
    selectedOrders.value = []
  } catch (error: unknown) {
    if (error === 'cancel') {
      return
    }
    console.error('Error processing orders:', error)
    ElMessage.error('Có lỗi xảy ra khi xử lý đơn hàng')
  } finally {
    processing.value = false
  }
}

// Format currency
function formatCurrency(value: string | number) {
  const num = typeof value === 'string' ? parseInt(value) : value
  if (isNaN(num)) return '0đ'
  return num.toLocaleString('vi-VN') + 'đ'
}

// On mounted
onMounted(() => {
  // Auto select current month
  const now = new Date()
  const currentMonth = `${now.getMonth() + 1}_${now.getFullYear()}`
  selectedMonths.value = [currentMonth]
  
  // Auto load orders
  loadOrders()
})
</script>

<style scoped>
.order-viet {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;
}

.header-card h1 {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #303133;
}

.month-selector {
  display: flex;
  gap: 10px;
  align-items: center;
}

.action-card {
  margin-bottom: 20px;
}
.action-card h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #303133;
}

.bill-image-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}

.bill-image-preview :deep(.el-image) {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  background: #ffffff;
}

.bill-image-preview :deep(.el-image:hover) {
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.bill-image-preview :deep(.el-image__inner) {
  object-fit: scale-down;
}

.image-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 300px;
  color: #909399;
}

.image-loading .el-icon {
  font-size: 32px;
}

.image-loading .is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.image-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 13px;
  margin-top: 4px;
}

.image-hint .el-icon {
  font-size: 16px;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 200px;
  color: #909399;
}

.image-error .el-icon {
  font-size: 48px;
}

.table-card h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #303133;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.empty-state p:first-child {
  font-size: 16px;
  margin-bottom: 10px;
}

/* Bill dropdown option styling */
:deep(.el-select-dropdown__item) {
  height: auto !important;
  min-height: 60px !important;
  padding: 8px 20px !important;
  line-height: normal !important;
}

:deep(.el-select-dropdown__item img) {
  flex-shrink: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .order-viet {
    padding: 12px;
  }

  .header-card h1,
  .action-card h2,
  .table-card h2 {
    font-size: 18px;
    margin-bottom: 16px;
  }

  /* Bill image preview */
  .bill-image-preview {
    padding: 10px;
  }

  .bill-image-preview :deep(.el-image) {
    max-width: 100% !important;
  }

  .image-hint {
    font-size: 12px;
  }

  .month-selector {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .month-selector :deep(.el-select) {
    width: 100% !important;
  }

  .month-selector :deep(.el-button) {
    width: 100%;
  }

  /* Form adjustments */
  :deep(.el-form) {
    font-size: 14px;
  }

  :deep(.el-form-item__label) {
    font-size: 13px;
    padding-right: 8px;
  }

  :deep(.el-select) {
    width: 100% !important;
  }

  /* Alert adjustments */
  :deep(.el-alert) {
    padding: 10px;
    font-size: 13px;
  }

  :deep(.el-alert__title) {
    font-size: 14px;
  }

  /* Bill dropdown image size */
  :deep(.el-select-dropdown__item) {
    min-height: 50px !important;
    padding: 6px 12px !important;
  }

  :deep(.el-select-dropdown__item img) {
    width: 30px !important;
    height: 30px !important;
  }

  :deep(.el-select-dropdown__item .el-option__label) {
    font-size: 13px;
  }

  /* Table adjustments */
  :deep(.el-table) {
    font-size: 12px;
  }

  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 8px 4px;
  }

  :deep(.el-table .cell) {
    padding: 0 4px;
    word-break: break-word;
  }

  :deep(.el-image) {
    width: 50px !important;
    height: 50px !important;
  }

  :deep(.el-tag) {
    font-size: 11px;
    padding: 0 5px;
    height: 20px;
    line-height: 20px;
  }

  :deep(.el-link) {
    font-size: 11px !important;
  }

  :deep(.el-button) {
    padding: 6px 12px;
    font-size: 13px;
  }

  .empty-state {
    padding: 30px 20px;
  }

  .empty-state p:first-child {
    font-size: 14px;
  }

  .empty-state p {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .order-viet {
    padding: 8px;
  }

  .header-card,
  .action-card,
  .table-card {
    margin-bottom: 12px;
  }

  .header-card h1,
  .action-card h2,
  .table-card h2 {
    font-size: 16px;
    margin-bottom: 12px;
  }

  :deep(.el-form-item__label) {
    font-size: 12px;
    min-width: 80px !important;
  }

  /* Make button text smaller */
  :deep(.el-button span) {
    font-size: 12px;
  }

  /* Alert adjustments */
  :deep(.el-alert) {
    padding: 8px;
    font-size: 12px;
  }

  :deep(.el-alert__title) {
    font-size: 13px;
  }

  /* Bill dropdown */
  :deep(.el-select-dropdown__item) {
    min-height: 45px !important;
    padding: 5px 10px !important;
  }

  :deep(.el-select-dropdown__item img) {
    width: 25px !important;
    height: 25px !important;
  }

  :deep(.el-select-dropdown__item .el-option__label) {
    font-size: 12px;
  }

  /* Table adjustments */
  :deep(.el-table) {
    font-size: 11px;
  }

  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 6px 2px;
  }

  :deep(.el-image) {
    width: 40px !important;
    height: 40px !important;
  }

  /* Hide less critical columns on very small screens */
  :deep(.el-table__column:nth-child(9)),  /* Nguồn column */
  :deep(.el-table__column:nth-child(10))  /* Tháng column */
  {
    display: none;
  }

  .empty-state {
    padding: 20px 15px;
  }
}
</style>
