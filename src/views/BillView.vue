<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Navigation Menu -->
    <NavigationMenu active-menu-item="bill" />

    <!-- Hero Header -->
    <div class="hero-header">
      <h1 class="main-title">Tạo hóa đơn</h1>
      <p class="subtitle">Tạo hóa đơn báo khách hàng</p>
    </div>

    <!-- Form nhập thông tin -->
    <div class="bill-form-section">
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <span>Thông tin hóa đơn</span>
          </div>
        </template>
        <el-form :model="billForm" label-width="120px" class="bill-form">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="Tên khách hàng" required>
                <div class="customer-name-container">
                  <el-input
                    v-model="billForm.customerName"
                    placeholder="Nhập tên khách hàng"
                    clearable
                    class="customer-name-input"
                  />
                  <el-button
                    :icon="Search"
                    @click="openCustomerSearchModal"
                    title="Tìm kiếm khách hàng"
                    class="search-button"
                  />
                </div>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12">
              <el-form-item label="Loại khách hàng" required>
                <el-radio-group v-model="billForm.customerType">
                  <el-radio value="customer">Khách</el-radio>
                  <el-radio value="ctv">CTV</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="Tháng" required>
                <el-select
                  v-model="billForm.months"
                  multiple
                  placeholder="Chọn tháng"
                  style="width: 100%"
                  collapse-tags
                  collapse-tags-tooltip
                >
                  <el-option
                    v-for="month in monthOptions"
                    :key="month.value"
                    :label="month.label"
                    :value="month.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12">
              <el-form-item label="Năm" required>
                <el-select v-model="billForm.year" placeholder="Chọn năm" style="width: 100%">
                  <el-option v-for="year in yearOptions" :key="year" :label="year" :value="year" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="Phí ship" required>
                <el-input-number 
                  v-model="billForm.shippingFee"
                  :min="0"
                  :step="1000"
                  :precision="0"
                  controls-position="right"
                  placeholder="Nhập phí ship"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item>
            <div class="button-container">
              <el-button
                type="primary"
                @click="generateBill"
                :loading="loading"
                :disabled="!canGenerate"
              >
                Tạo hóa đơn
              </el-button>
              <el-button @click="resetForm">Reset</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- Bill Preview -->
    <div v-if="billData.length > 0" class="bill-preview-section">
      <el-card class="bill-card">
        <template #header>
          <div class="bill-header">
            <div class="bill-title">HÓA ĐƠN</div>
            <el-button type="primary" @click="printBill" icon="Download">Tải hóa đơn</el-button>
          </div>
        </template>

        <div class="bill-content" ref="billContent">
          <!-- Customer Info -->
          <div class="customer-info">
            <div class="info-row">
              <span class="label">Khách hàng:</span>
              <span class="value">{{ billForm.customerName.toUpperCase() }}</span>
            </div>
            <div class="info-row">
              <span class="label">Địa chỉ / SĐT:</span>
              <span class="value">{{ customerContact }}</span>
            </div>
          </div>

          <!-- Summary Info -->
          <div class="summary-info">
            <div class="summary-item shipping">
              <span class="label">Phí Ship</span>
              <span class="value">{{ formatCurrency(totalShipping) }}</span>
            </div>
            <div class="summary-item total">
              <span class="label">Tổng thanh toán</span>
              <span class="value">{{ formatCurrency(totalAmount) }}</span>
            </div>
          </div>

          <!-- Important Notice -->
          <div class="notice">
            !! !! HÀNG ORD BÊN E HỖ TRỢ ĐỔI TRONG VÒNG 2 NGÀY SAU KHI NHẬN HÀNG (NẾU LỖI DO SẢN
            XUẤT- HÀNG ĐỔI PHẢI CÒN NGUYÊN TAG GIÚP EM). MN KIỂM TRA HÀNG SAU KHI NHẬN GIÚP E, CÓ
            VẤN ĐỀ E GIẢI QUYẾT LUÔN A. SAU 2 NGÀY NẾU HÀNG CÓ VẤN ĐỀ E XIN PHÉP KO GIẢI QUYẾT ĐƯỢC
            A.
          </div>

          <!-- Order Table -->
          <div class="order-table">
            <table>
              <thead>
                <tr>
                  <th style="width: 70px;">STT</th>
                  <th style="width: 90px;">SẢN PHẨM</th>
                  <th style="width: 70px;">MÀU</th>
                  <th style="width: 50px;">SIZE</th>
                  <th style="width: 40px;">SL</th>
                  <th style="width: 90px;">Giá</th>
                  <th style="width: 80px;">Status</th>
                  <th>NOTE</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in billData" :key="index">
                  <td class="stt-cell">
                    <div class="stt-container">
                      <span class="stt-number">{{ index + 1 }}</span>
                      <div class="actions-container">
                        <el-checkbox 
                          :model-value="item.status === ORDER_STATUSES.SALES.DANG_CHO_GIAO"
                          @change="(value: boolean) => handleStatusChange(item, value)"
                          :disabled="item.status !== ORDER_STATUSES.SALES.HANG_VE && item.status !== ORDER_STATUSES.SALES.DANG_CHO_GIAO"
                          title="Báo đơn"
                        />
                        <el-button
                          type="danger"
                          size="small"
                          :icon="Delete"
                          circle
                          @click="removeFromBill(index)"
                          title="Xóa khỏi hóa đơn"
                          class="remove-btn"
                        />
                      </div>
                    </div>
                  </td>
                  <td class="product-cell">
                    <img
                      v-if="item.productImage"
                      :src="item.productImage"
                      alt="Product"
                      class="product-image"
                      @click="openImageModal(item.productImage, item.productName)"
                    />
                  </td>
                  <td>{{ item.color || '' }}</td>
                  <td>{{ item.size || '' }}</td>
                  <td>{{ item.quantity || '' }}</td>
                  <td>{{ item.total || '' }}</td>
                  <td class="status-cell">{{ item.status || '' }}</td>
                  <td>{{ item.note || '' }}</td>
                </tr>
                <!-- Empty rows to fill space -->
                <tr v-for="i in Math.max(0, 6 - billData.length)" :key="'empty-' + i">
                  <td>{{ billData.length + i }}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Image Modal -->
    <el-dialog
      v-model="imageModalVisible"
      :title="imageModalTitle"
      :width="imageModalWidth"
      align-center
      @close="closeImageModal"
    >
      <div class="image-modal-content">
        <img
          :src="imageModalSrc"
          :alt="imageModalTitle"
          class="modal-image"
          @click="closeImageModal"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeImageModal">Đóng</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Customer Search Modal -->
    <el-dialog
      v-model="customerSearchVisible"
      title="Danh sách khách hàng có thể tạo hóa đơn"
      width="90%"
      :max-width="800"
      @close="closeCustomerSearchModal"
    >
      <div class="customer-search-content">
        <div v-if="customerSearchLoading" class="loading-container">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>Đang tải danh sách khách hàng...</span>
        </div>
        
        <div v-else>
          <div v-if="availableCustomers.length === 0" class="empty-state">
            <el-empty description="Không có khách hàng nào có thể tạo hóa đơn" />
          </div>
          
          <div v-else class="customers-grid">
            <div 
              v-for="customer in availableCustomers" 
              :key="customer.name"
              class="customer-card"
              @click="selectCustomer(customer.name)"
            >
              <div class="customer-avatar">
                {{ customer.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) }}
              </div>
              <div class="customer-details">
                <h4 class="customer-card-name">{{ customer.name }}</h4>
                <el-tag 
                  :type="customer.name.toLowerCase().includes('ctv') ? 'warning' : 'primary'"
                  size="small"
                  class="customer-type-tag"
                >
                  {{ customer.name.toLowerCase().includes('ctv') ? 'CTV' : 'Khách hàng' }}
                </el-tag>
                <div class="customer-card-stats">
                  <div 
                    class="stat-item info"
                    @click.stop="showCustomerOrders(customer.name, ORDER_STATUSES.SALES.NHAN_DON)"
                  >
                    <span class="stat-number">{{ customer.nhanDonCount }}</span>
                    <span class="stat-text">Nhận đơn</span>
                  </div>
                  <div 
                    class="stat-item primary"
                    @click.stop="showCustomerOrders(customer.name, ORDER_STATUSES.SALES.DA_DAT_HANG)"
                  >
                    <span class="stat-number">{{ customer.daDatHangCount }}</span>
                    <span class="stat-text">Đã đặt hàng</span>
                  </div>
                  <div 
                    class="stat-item success"
                    @click.stop="showCustomerOrders(customer.name, ORDER_STATUSES.SALES.HANG_VE)"
                  >
                    <span class="stat-number">{{ customer.hangVeCount }}</span>
                    <span class="stat-text">Hàng về</span>
                  </div>
                  <div 
                    class="stat-item warning"
                    @click.stop="showCustomerOrders(customer.name, ORDER_STATUSES.SALES.DANG_CHO_GIAO)"
                  >
                    <span class="stat-number">{{ customer.dangChoGiaoCount }}</span>
                    <span class="stat-text">Đang chờ giao</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Customer Orders Detail Modal -->
    <el-dialog
      v-model="customerOrdersVisible"
      :title="`${selectedCustomerForOrders} - ${selectedStatusForOrders}`"
      width="80%"
      :max-width="600"
      @close="closeCustomerOrdersModal"
    >
      <div class="customer-orders-content">
        <div v-if="customerOrders.length === 0" class="empty-state">
          <el-empty description="Không có đơn hàng nào" />
        </div>
        
        <div v-else class="orders-grid">
          <div 
            v-for="order in customerOrders" 
            :key="`${order.rowIndex}-${order.date}`"
            class="order-item"
          >
            <div class="order-image">
              <el-image
                v-if="order.productImage"
                :src="order.productImage"
                fit="cover"
                class="product-img"
                @click="openImageModal(order.productImage, order.productName)"
              />
              <div v-else class="no-image">Không có ảnh</div>
            </div>
            <div class="order-details">
              <div class="product-code">{{ order.productCode || 'Không có mã' }}</div>
              <div class="product-name">{{ order.productName || 'Không có tên' }}</div>
              <div class="order-info">
                <span>{{ order.color }} | {{ order.size }} | SL: {{ order.quantity }}</span>
              </div>
              <div class="order-price">{{ formatCurrency(parseFloat(order.total?.replace(/[^\d]/g, '') || '0')) }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Search, Loading } from '@element-plus/icons-vue'
import NavigationMenu from '@/components/NavigationMenu.vue'
import { useOrdersStore } from '@/stores/orders'
import type { Order } from '@/types/order'
import { ORDER_STATUSES, getOrderStatusType } from '@/constants/orderStatus'

const ordersStore = useOrdersStore()

// Form data
const billForm = ref({
  customerName: '',
  customerType: 'customer' as 'customer' | 'ctv',
  months: [] as number[],
  year: new Date().getFullYear(),
  shippingFee: 0,
})

// Options
const monthOptions = [
  { value: 1, label: 'Tháng 1' },
  { value: 2, label: 'Tháng 2' },
  { value: 3, label: 'Tháng 3' },
  { value: 4, label: 'Tháng 4' },
  { value: 5, label: 'Tháng 5' },
  { value: 6, label: 'Tháng 6' },
  { value: 7, label: 'Tháng 7' },
  { value: 8, label: 'Tháng 8' },
  { value: 9, label: 'Tháng 9' },
  { value: 10, label: 'Tháng 10' },
  { value: 11, label: 'Tháng 11' },
  { value: 12, label: 'Tháng 12' },
]

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
})

// State
const loading = ref(false)
const billData = ref<Order[]>([])
const billContent = ref<HTMLElement>()

// Image modal state
const imageModalVisible = ref(false)
const imageModalSrc = ref('')
const imageModalTitle = ref('')

// Customer search modal state
const customerSearchVisible = ref(false)
const customerSearchLoading = ref(false)
const availableCustomers = ref<Array<{
  name: string
  nhanDonCount: number
  daDatHangCount: number
  hangVeCount: number
  dangChoGiaoCount: number
}>>([])

// Customer orders modal state
const customerOrdersVisible = ref(false)
const selectedCustomerForOrders = ref('')
const selectedStatusForOrders = ref('')
const customerOrders = ref<Order[]>([])

// Computed for responsive modal width
const imageModalWidth = computed(() => {
  if (window.innerWidth <= 480) return '95%'
  if (window.innerWidth <= 768) return '90%'
  return '80%'
})

// Computed
const canGenerate = computed(() => {
  return (
    billForm.value.customerName.trim() && billForm.value.months.length > 0 && billForm.value.year
  )
})

const customerContact = computed(() => {
  if (billData.value.length > 0) {
    return billData.value[0].contactInfo || 'Thông tin liên hệ khách hàng'
  }
  return 'Thông tin liên hệ khách hàng'
})

const totalShipping = computed(() => {
  return billForm.value.shippingFee || 0
})

const totalAmount = computed(() => {
  return (
    billData.value.reduce((sum, order) => {
      const amount = parseFloat(order.total?.replace(/[^\d]/g, '') || '0')
      return sum + amount
    }, 0) + totalShipping.value
  )
})

// Methods
const generateBill = async () => {
  loading.value = true
  billData.value = []

  try {
    const allOrders: Order[] = []

    // Fetch orders for each selected month
    for (const month of billForm.value.months) {
      await ordersStore.fetchOrders(
        { month, year: billForm.value.year },
        billForm.value.customerType,
      )

      // Filter orders by customer name (exact and partial match with word boundaries)
      // and only show orders with status "HANG_VE" or "DANG_CHO_GIAO"
      const searchName = billForm.value.customerName.toLowerCase().trim()
      const customerOrders = ordersStore.orders.filter((order) => {
        const customerName = order.customerName?.toLowerCase() || ''
        
        const nameMatch = customerName === searchName
        
        const validStatus = order.status === ORDER_STATUSES.SALES.HANG_VE || 
                           order.status === ORDER_STATUSES.SALES.DANG_CHO_GIAO
        
        return nameMatch && validStatus
      })

      // Add month and year info to each order for status update
      const ordersWithMetadata = customerOrders.map(order => ({
        ...order,
        monthForUpdate: month,
        yearForUpdate: billForm.value.year
      }))

      allOrders.push(...ordersWithMetadata)
    }

    // Sort by date (newest first)
    billData.value = allOrders.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    if (billData.value.length === 0) {
      ElMessage.warning('Không tìm thấy đơn hàng nào cho khách hàng này')
    } else {
      ElMessage.success(`Tìm thấy ${billData.value.length} đơn hàng`)
    }
  } catch (error) {
    ElMessage.error('Có lỗi xảy ra khi tạo hóa đơn')
    console.error('Error generating bill:', error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  billForm.value = {
    customerName: '',
    customerType: 'customer',
    months: [],
    year: new Date().getFullYear(),
    shippingFee: 0,
  }
  billData.value = []
}

const formatCurrency = (amount: number | undefined) => {
  if (!amount) return '0 đ'
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ'
}

const printBill = () => {
  if (billData.value.length === 0) return

  // Mở template HTML trong cửa sổ mới
  const printWindow = window.open('/bill-template.html', '_blank', 'width=900,height=650')
  
  if (!printWindow) {
    ElMessage.error('Không thể mở cửa sổ download. Vui lòng cho phép popup.')
    return
  }

  // Đợi template load xong rồi gửi dữ liệu
  printWindow.onload = () => {
    // Gửi thông tin tới template
    const billData = {
      customerName: billForm.value.customerName.toUpperCase(),
      customerPhone: customerContact.value,
      totalAmount: formatCurrency(totalAmount.value)
    }

    // Cập nhật thông tin trong template
    printWindow.postMessage({
      type: 'UPDATE_BILL_INFO',
      data: billData
    }, '*')

    // Đợi 1.5 giây để đảm bảo dữ liệu và background đã được cập nhật, sau đó download
    setTimeout(() => {
      printWindow.postMessage({
        type: 'DOWNLOAD_AS_IMAGE',
        data: billData
      }, '*')
    }, 1500)
  }

  // Listen for download completion message
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'DOWNLOAD_COMPLETED') {
      ElMessage.success('Đã tải xuống hóa đơn thành công!')
      window.removeEventListener('message', handleMessage)
    }
  }
  
  window.addEventListener('message', handleMessage)
}

const handleStatusChange = async (order: Order, checked: boolean) => {
  const newStatus = checked ? ORDER_STATUSES.SALES.DANG_CHO_GIAO : ORDER_STATUSES.SALES.HANG_VE
  
  try {
    // Update status in store
    await ordersStore.updateOrderStatus(
      order.rowIndex,
      newStatus,
      { 
        month: order.monthForUpdate || new Date().getMonth() + 1, 
        year: order.yearForUpdate || new Date().getFullYear() 
      },
      billForm.value.customerType
    )
    
    // Update local data
    order.status = newStatus
    
    ElMessage.success(`Đã cập nhật trạng thái thành "${newStatus}"`)
  } catch (error) {
    ElMessage.error('Có lỗi xảy ra khi cập nhật trạng thái')
    console.error('Error updating status:', error)
  }
}

const removeFromBill = (index: number) => {
  const removedOrder = billData.value[index]
  billData.value.splice(index, 1)
  ElMessage.success(`Đã xóa đơn hàng của ${removedOrder.customerName} khỏi hóa đơn`)
}

const openImageModal = (imageSrc: string, productName: string) => {
  imageModalSrc.value = imageSrc
  imageModalTitle.value = productName || 'Hình ảnh sản phẩm'
  imageModalVisible.value = true
}

const closeImageModal = () => {
  imageModalVisible.value = false
  imageModalSrc.value = ''
  imageModalTitle.value = ''
}

// Customer search methods
const openCustomerSearchModal = async () => {
  customerSearchVisible.value = true
  customerSearchLoading.value = true
  
  try {
    await loadAvailableCustomers()
  } catch (error) {
    ElMessage.error('Có lỗi xảy ra khi tải danh sách khách hàng')
    console.error('Error loading customers:', error)
  } finally {
    customerSearchLoading.value = false
  }
}

const loadAvailableCustomers = async () => {
  const customerMap = new Map<string, { nhanDon: number, daDatHang: number, hangVe: number, dangChoGiao: number }>()
  
  // Fetch orders for each selected month and customer type
  for (const month of billForm.value.months.length > 0 ? billForm.value.months : [new Date().getMonth() + 1]) {
    await ordersStore.fetchOrders(
      { month, year: billForm.value.year },
      billForm.value.customerType,
    )
    
    // Process orders to count by customer and status
    ordersStore.orders.forEach(order => {
      if (!order.customerName) return
      
      const customerName = order.customerName.trim()
      if (!customerMap.has(customerName)) {
        customerMap.set(customerName, { nhanDon: 0, daDatHang: 0, hangVe: 0, dangChoGiao: 0 })
      }
      
      const customer = customerMap.get(customerName)!
      if (order.status === ORDER_STATUSES.SALES.NHAN_DON) {
        customer.nhanDon++
      } else if (order.status === ORDER_STATUSES.SALES.DA_DAT_HANG) {
        customer.daDatHang++
      } else if (order.status === ORDER_STATUSES.SALES.HANG_VE) {
        customer.hangVe++
      } else if (order.status === ORDER_STATUSES.SALES.DANG_CHO_GIAO) {
        customer.dangChoGiao++
      }
    })
  }
  
  // Filter customers who have at least one order with valid status
  availableCustomers.value = Array.from(customerMap.entries())
    .filter(([, counts]) => counts.nhanDon > 0 || counts.daDatHang > 0 || counts.hangVe > 0 || counts.dangChoGiao > 0)
    .map(([name, counts]) => ({
      name,
      nhanDonCount: counts.nhanDon,
      daDatHangCount: counts.daDatHang,
      hangVeCount: counts.hangVe,
      dangChoGiaoCount: counts.dangChoGiao
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

const selectCustomer = (customerName: string) => {
  billForm.value.customerName = customerName
  customerSearchVisible.value = false
}

const closeCustomerSearchModal = () => {
  customerSearchVisible.value = false
  availableCustomers.value = []
}

const showCustomerOrders = async (customerName: string, status: string) => {
  selectedCustomerForOrders.value = customerName
  selectedStatusForOrders.value = status
  customerOrdersVisible.value = true
  
  // Collect orders for this customer with the specified status
  const orders: Order[] = []
  
  for (const month of billForm.value.months.length > 0 ? billForm.value.months : [new Date().getMonth() + 1]) {
    await ordersStore.fetchOrders(
      { month, year: billForm.value.year },
      billForm.value.customerType,
    )
    
    const customerOrders = ordersStore.orders.filter(order => 
      order.customerName?.trim() === customerName && order.status === status
    )
    
    orders.push(...customerOrders)
  }
  
  customerOrders.value = orders
}

const closeCustomerOrdersModal = () => {
  customerOrdersVisible.value = false
  selectedCustomerForOrders.value = ''
  selectedStatusForOrders.value = ''
  customerOrders.value = []
}
</script>

<style scoped>


.hero-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 32px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  margin-left: -16px;
  margin-right: -16px;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
    repeat;
  opacity: 0.1;
}

.main-title {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 12px 0;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.025em;
}

.subtitle {
  font-size: 1.125rem;
  margin: 0;
  opacity: 0.9;
  position: relative;
  z-index: 1;
  font-weight: 400;
}

.bill-form-section {
  margin-bottom: 32px;
}

.form-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-weight: 600;
  font-size: 1.2em;
}

/* Customer name container */
.customer-name-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.customer-name-input {
  flex: 1;
}

.search-button {
  padding: 8px;
  min-width: 40px;
  height: 40px;
}

/* Customer search modal */
.customer-search-content {
  max-height: 60vh;
  overflow-y: auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  color: #606266;
}

.customers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 8px;
}

.customer-card {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.customer-card:hover {
  border-color: #409eff;
  background: #ecf5ff;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.15);
}

.customer-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff, #5dade2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
  margin: 0 auto 16px auto;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.customer-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.customer-card-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.customer-type-tag {
  margin-bottom: 8px;
}

.customer-card-stats {
  display: flex;
  gap: 8px;
  width: 100%;
  justify-content: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 55px;
  flex: 1;
}

.stat-item.success {
  background: #f0f9ff;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.stat-item.success:hover {
  background: #dcfdf7;
  transform: scale(1.05);
}

.stat-item.warning {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fed7aa;
}

.stat-item.warning:hover {
  background: #fef3c7;
  transform: scale(1.05);
}

.stat-item.info {
  background: #f0f9ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.stat-item.info:hover {
  background: #dbeafe;
  transform: scale(1.05);
}

.stat-item.primary {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.stat-item.primary:hover {
  background: #f1f5f9;
  transform: scale(1.05);
}

.stat-number {
  font-size: 18px;
  font-weight: 700;
}

.stat-text {
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
}

/* Responsive for tablets and smaller screens */
@media (max-width: 1200px) {
  .customers-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .customers-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .customer-card {
    padding: 16px;
  }
  
  .customer-avatar {
    width: 50px;
    height: 50px;
    font-size: 16px;
  }
  
  .customer-card-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  .stat-item {
    flex-direction: row;
    justify-content: space-between;
    min-width: auto;
    width: 100%;
    padding: 8px 12px;
  }
}

/* Customer orders modal */
.customer-orders-content {
  max-height: 60vh;
  overflow-y: auto;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.order-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.order-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.order-image {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
}

.product-img {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.product-img:hover {
  transform: scale(1.1);
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border: 1px dashed #d3d4d6;
  border-radius: 6px;
  color: #909399;
  font-size: 12px;
}

.order-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-code {
  font-weight: 600;
  color: #409eff;
  font-size: 14px;
}

.product-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.order-info {
  color: #606266;
  font-size: 12px;
}

.order-price {
  font-weight: 600;
  color: #e6a23c;
  font-size: 14px;
}

/* Button container for all screens */
.button-container {
  display: flex !important;
  flex-direction: row !important;
  gap: 12px;
  flex-wrap: nowrap !important;
  align-items: center;
  width: 100%;
  justify-content: flex-start;
}

.button-container .el-button {
  margin: 0 !important;
  flex-shrink: 0;
}

/* Override Element Plus button spacing */
.bill-form .button-container :deep(.el-button + .el-button) {
  margin-left: 0 !important;
}

.bill-form {
  max-width: 800px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .bill-form {
    margin: 0;
    max-width: 100%;
  }
}

.bill-preview-section {
  margin-top: 32px;
}

.bill-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.bill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bill-title {
  font-size: 1.5em;
  font-weight: bold;
}

.customer-info {
  margin: 20px 0;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.info-row {
  display: flex;
  margin: 8px 0;
}

.info-row .label {
  font-weight: bold;
  min-width: 120px;
}

.info-row .value {
  font-weight: bold;
}

.summary-info {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin: 20px 0;
}

.summary-item {
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.summary-item.shipping {
  background: #e3f2fd;
  color: #1976d2;
}

.summary-item.total {
  background: #4caf50;
  color: white;
}

.summary-item .label {
  font-size: 0.9em;
  margin-bottom: 4px;
}

.summary-item .value {
  font-weight: bold;
  font-size: 1.1em;
}

.notice {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  padding: 12px;
  margin: 20px 0;
  border-radius: 4px;
  font-weight: bold;
  color: #856404;
  line-height: 1.4;
}

.order-table {
  margin: 20px 0;
}

.order-table table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #000;
}

.order-table th,
.order-table td {
  border: 1px solid #000;
  padding: 10px 8px;
  text-align: center;
  vertical-align: middle;
  line-height: 1.2;
}

.order-table th {
  background: #4caf50;
  color: white;
  font-weight: bold;
}

.product-cell {
  width: 90px;
  padding: 6px;
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-image:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.image-modal-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.modal-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.status-cell {
  font-size: 0.85em;
  padding: 4px;
  white-space: nowrap;
}
.stt-cell {
  padding: 8px 6px;
  text-align: center;
  vertical-align: middle;
}

.stt-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.stt-number {
  font-weight: bold;
  font-size: 1em;
}

.actions-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.checkbox-cell {
  padding: 4px;
  text-align: center;
}

.checkbox-cell .el-checkbox {
  margin: 0;
}

.actions-cell {
  padding: 4px;
  text-align: center;
}

.remove-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  min-height: 24px;
}

.remove-btn :deep(.el-icon) {
  font-size: 12px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .hero-header {
    margin: -8px -16px 24px -16px;
    padding: 24px 16px;
  }

  .main-title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .bill-form-section {
    margin-bottom: 24px;
  }

  .bill-form {
    padding: 0;
    margin: 0;
  }

  /* Override label-width cho tablet: 100px thay vì 120px */
  .bill-form :deep(.el-form-item__label) {
    width: 100px !important;
    text-align: right !important;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #2c3e50;
    display: inline-block;
    line-height: 1.3;
  }

  .bill-form :deep(.el-form-item__content) {
    margin-left: 100px !important;
    width: calc(100% - 100px);
    display: block;
  }

  .bill-form :deep(.el-row) {
    margin: 0 !important;
  }

  .bill-form :deep(.el-col) {
    padding: 0 !important;
    margin-bottom: 20px;
  }

  .bill-form :deep(.el-form-item) {
    margin-bottom: 0;
  }

  /* 2.1. Ô input khách hàng nhỏ lại cho phù hợp với thiết bị di động */
  .bill-form :deep(.el-input) {
    width: 100%;
    display: block;
  }

  .bill-form :deep(.el-input__wrapper) {
    min-height: 38px;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    width: 100%;
    display: flex;
    border: 1px solid #e1e5e9;
    box-sizing: border-box;
  }

  .bill-form :deep(.el-input__inner) {
    padding: 0 10px;
    font-size: 15px;
    width: 100%;
    border: none;
    background: transparent;
    box-sizing: border-box;
  }

  .bill-form :deep(.el-select) {
    width: 100%;
    display: block;
  }

  .bill-form :deep(.el-select .el-input__wrapper) {
    min-height: 38px;
    width: 100%;
    border: 1px solid #e1e5e9;
    box-sizing: border-box;
  }

  /* 2.4. Input phí ship nhỏ lại cho phù hợp với thiết bị di động */
  .bill-form :deep(.el-input-number) {
    width: 100% !important;
    display: block;
  }

  .bill-form :deep(.el-input-number .el-input__wrapper) {
    min-height: 38px;
    width: 100%;
    border: 1px solid #e1e5e9;
    display: flex;
    box-sizing: border-box;
  }

  .bill-form :deep(.el-input-number .el-input__inner) {
    padding: 0 10px;
    font-size: 15px;
    width: 100%;
    border: none;
    background: transparent;
    box-sizing: border-box;
  }

  /* 2.2. Radio customer type nhỏ lại để 2 option trên cùng 1 hàng */
  .bill-form :deep(.el-radio-group) {
    display: flex;
    gap: 8px;
    flex-wrap: nowrap;
  }

  .bill-form :deep(.el-radio) {
    margin-right: 0;
    padding: 8px 12px;
    border: 1px solid #e1e5e9;
    border-radius: 6px;
    background: #f8f9fa;
    transition: all 0.3s ease;
    flex: 1;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
  }

  .bill-form :deep(.el-radio.is-checked) {
    border-color: #409eff;
    background: #ecf5ff;
  }

  .bill-form :deep(.el-button--primary) {
    width: 60% !important;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 8px;
    margin-bottom: 0 !important;
    margin-right: 0 !important;
    flex: 0 0 60% !important;
  }

  .bill-form :deep(.el-button:not(.el-button--primary)) {
    width: 38% !important;
    height: 48px;
    font-size: 16px;
    border-radius: 8px;
    margin: 0 !important;
    flex: 0 0 38% !important;
  }

  .button-container {
    display: flex !important;
    flex-direction: row !important;
    gap: 12px;
    align-items: center;
    width: 100%;
    flex-wrap: nowrap !important;
  }

  .summary-info {
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important;
    gap: 12px !important;
    flex-wrap: nowrap !important;
  }

  .summary-item {
    flex: 1 !important;
    min-width: auto !important;
    padding: 12px 8px !important;
    font-size: 14px !important;
  }

  .summary-item .label {
    font-size: 12px !important;
    margin-bottom: 4px;
  }

  .summary-item .value {
    font-size: 15px !important;
    font-weight: bold;
  }

  .bill-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .notice {
    font-size: 12px !important;
    line-height: 1.4 !important;
    padding: 10px 12px !important;
  }

  .order-table {
    overflow-x: auto;
    margin: 0 -16px;
    padding: 0 16px;
  }
  
  .order-table table {
    min-width: 700px;
  }
  
  .order-table th,
  .order-table td {
    font-size: 0.8em;
    padding: 6px;
  }

  .product-image {
    width: 35px;
    height: 35px;
  }

  .stt-container {
    gap: 4px;
  }

  .actions-container {
    gap: 4px;
  }

  .remove-btn {
    width: 20px;
    height: 20px;
    min-height: 20px;
  }

  .remove-btn :deep(.el-icon) {
    font-size: 10px;
  }

  .stt-number {
    font-size: 0.9em;
  }

  /* Customer search responsive */
  .customer-item {
    padding: 12px;
  }

  .customer-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .customer-stats {
    flex-wrap: wrap;
    gap: 6px;
  }

  .orders-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .order-item {
    padding: 12px;
  }

  .order-image {
    width: 60px;
    height: 60px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 12px !important;
  }

  .hero-header {
    padding: 20px 16px;
    margin: -12px -12px 28px -12px;
  }

  .main-title {
    font-size: 1.75rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }

  .bill-form-section {
    margin-bottom: 20px;
  }

  .form-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .form-card :deep(.el-card__header) {
    padding: 16px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: bold;
  }

  .form-card :deep(.el-card__body) {
    padding: 20px 16px;
  }

  .bill-form {
    padding: 0;
    margin: 0;
  }

  .bill-form :deep(.el-row) {
    margin: 0 !important;
  }

  .bill-form :deep(.el-col) {
    padding: 0 !important;
    margin-bottom: 20px;
  }

  /* Tháng và năm hiển thị cùng 1 hàng trên mobile */
  .bill-form :deep(.el-row:nth-of-type(2)) {
    display: flex !important;
    flex-direction: row !important;
    gap: 12px;
    margin: 0 !important;
  }

  .bill-form :deep(.el-row:nth-of-type(2) .el-col) {
    flex: 1 !important;
    width: auto !important;
    margin-bottom: 20px;
    padding: 0 !important;
  }

  .bill-form :deep(.el-row:nth-of-type(2) .el-form-item__label) {
    width: 100% !important;
    text-align: left !important;
    margin-bottom: 6px;
  }

  .bill-form :deep(.el-row:nth-of-type(2) .el-form-item__content) {
    margin-left: 0 !important;
    width: 100% !important;
  }

  .bill-form :deep(.el-form-item) {
    margin-bottom: 0;
    display: block;
  }

  .bill-form :deep(.el-form-item__label) {
    width: 100% !important;
    text-align: left !important;
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #2c3e50;
    line-height: 1.4;
    display: block;
    position: relative;
  }

  .bill-form :deep(.el-form-item__content) {
    margin-left: 0 !important;
    width: 100%;
    display: block;
    position: relative;
  }

  .bill-form :deep(.el-input) {
    width: 100%;
    display: block;
    max-width: 100%;
  }

  .bill-form :deep(.el-input__wrapper) {
    min-height: 36px;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    border: 1px solid #e1e5e9;
    transition: all 0.3s ease;
    font-size: 15px;
    width: 100%;
    max-width: 100%;
    display: flex;
    box-sizing: border-box;
  }

  .bill-form :deep(.el-input__wrapper:focus-within) {
    border-color: #409eff;
    box-shadow: 0 2px 4px rgba(64, 158, 255, 0.15);
  }

  .bill-form :deep(.el-input__inner) {
    font-size: 15px;
    padding: 0 10px;
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .bill-form :deep(.el-select) {
    width: 100%;
    display: block;
    max-width: 100%;
  }

  .bill-form :deep(.el-select .el-input__wrapper) {
    min-height: 36px;
    width: 100%;
    max-width: 100%;
    border: 1px solid #e1e5e9;
    box-sizing: border-box;
  }

  .bill-form :deep(.el-input-number) {
    width: 100% !important;
    display: block;
    max-width: 100% !important;
  }

  .bill-form :deep(.el-input-number .el-input__wrapper) {
    min-height: 36px;
    width: 100%;
    max-width: 100%;
    border: 1px solid #e1e5e9;
    box-sizing: border-box;
    display: flex;
  }

  .bill-form :deep(.el-input-number .el-input__inner) {
    padding: 0 10px;
    font-size: 15px;
    width: 100%;
    max-width: 100%;
    border: none;
    background: transparent;
    box-sizing: border-box;
  }

  .bill-form :deep(.el-input-number .el-input-number__decrease),
  .bill-form :deep(.el-input-number .el-input-number__increase) {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }

  .bill-form :deep(.el-radio-group) {
    display: flex;
    gap: 12px;
    width: 100%;
  }

  .bill-form :deep(.el-radio) {
    margin-right: 0;
    padding: 12px 16px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    background: #f8f9fa;
    transition: all 0.3s ease;
    flex: 1;
    text-align: center;
    font-size: 15px;
    font-weight: 600;
  }

  .bill-form :deep(.el-radio.is-checked) {
    border-color: #409eff;
    background: #ecf5ff;
    color: #409eff;
  }

  .bill-form :deep(.el-radio__label) {
    font-size: 15px;
    font-weight: 600;
  }

  /* Button container alignment */
  .button-container {
    display: flex !important;
    flex-direction: row !important;
    gap: 12px;
    align-items: center !important;
    width: 100% !important;
    flex-wrap: nowrap !important;
    justify-content: flex-start;
  }

  .bill-form :deep(.el-form-item:last-child) {
    margin-top: 20px;
  }

  .bill-form :deep(.el-button--primary) {
    width: 60% !important;
    height: 50px;
    font-size: 16px;
    font-weight: 700;
    border-radius: 8px;
    margin: 0 !important;
    box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
    border: none;
    background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
    flex: 0 0 60% !important;
    max-width: 60% !important;
  }

  .bill-form :deep(.el-button:not(.el-button--primary)) {
    width: 38% !important;
    height: 50px;
    font-size: 15px;
    border-radius: 8px;
    border: 2px solid #e1e5e9;
    background: #f8f9fa;
    color: #6c757d;
    font-weight: 600;
    flex: 0 0 38% !important;
    max-width: 38% !important;
    margin: 0 !important;
  }

  .order-table {
    margin: 0 -12px;
    padding: 0 12px;
  }

  .order-table table {
    min-width: 650px;
  }

  .order-table th,
  .order-table td {
    font-size: 0.75em;
    padding: 8px 4px;
  }

  .product-image {
    width: 32px;
    height: 32px;
  }

  .stt-container {
    gap: 4px;
  }

  .actions-container {
    gap: 4px;
  }

  .remove-btn {
    width: 22px;
    height: 22px;
    min-height: 22px;
  }

  .remove-btn :deep(.el-icon) {
    font-size: 11px;
  }

  .stt-number {
    font-size: 0.9em;
  }

  .image-modal-content {
    min-height: 300px;
  }

  .modal-image {
    max-height: 60vh;
  }

  .customer-info {
    padding: 20px 16px;
    border-radius: 10px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  }

  .summary-info {
    margin: 20px 0 !important;
    gap: 12px !important;
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important;
    flex-wrap: nowrap !important;
  }

  .summary-item {
    padding: 14px 12px !important;
    border-radius: 8px !important;
    min-width: auto !important;
    flex: 1 !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08) !important;
    font-size: 13px !important;
  }

  .summary-item .label {
    font-size: 11px !important;
    margin-bottom: 4px;
  }

  .summary-item .value {
    font-size: 14px !important;
    font-weight: bold;
  }

  .notice {
    padding: 12px 16px !important;
    border-radius: 8px !important;
    font-size: 11px !important;
    line-height: 1.5 !important;
    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%) !important;
    border: none !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08) !important;
  }
}
</style>
