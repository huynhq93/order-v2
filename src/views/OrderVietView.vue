<template>
  <div class="order-viet">
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

        <el-form-item v-if="selectedBillCode">
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
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xử lý ${selectedOrders.value.length} đơn hàng?
      - Cập nhật status thành "HÀNG VỀ"
      - Thêm mã bill: ${selectedBillCode.value}`,
      'Xác Nhận Xử Lý',
      {
        confirmButtonText: 'Xác Nhận',
        cancelButtonText: 'Huỷ',
        type: 'warning',
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
</style>
