<template>
  <div class="shipping-code-manager">
    <el-card class="w-full">
      <template #header>
        <div class="header-container">
          <div class="header-row">
            <h3 class="title">Quản lý mã vận đơn</h3>
            <div class="header-actions">
              <el-select
                v-model="customerType"
                size="default"
                style="width: 120px; margin-right: 16px;"
              >
                <el-option label="Khách" value="customer" />
                <el-option label="CTV" value="ctv" />
              </el-select>
              <el-button 
                type="primary" 
                @click="refreshData"
                :loading="loading"
                :icon="Refresh"
              >
                Làm mới
              </el-button>
            </div>
          </div>
          
          <!-- Shipping Codes Management -->
          <div class="shipping-codes-section">
            <div class="input-row">
              <el-input
                v-model="newShippingCode"
                placeholder="Nhập mã vận đơn (VD: VD123)"
                style="width: 200px;"
                @keyup.enter="addShippingCode"
              >
                <template #prefix>
                  <el-icon><Van /></el-icon>
                </template>
              </el-input>
              <el-button 
                type="success" 
                @click="addShippingCode"
                :disabled="!newShippingCode.trim()"
              >
                Thêm mã vận đơn
              </el-button>
            </div>
            
            <!-- Shipping Code Tags -->
            <div v-if="shippingCodes.length > 0" class="shipping-codes">
              <el-tag
                v-for="code in shippingCodes"
                :key="code"
                closable
                @close="removeShippingCode(code)"
                type="primary"
                size="large"
                class="shipping-code-tag"
              >
                {{ code }}
              </el-tag>
            </div>
          </div>

          <!-- Order Management Info -->
          <div class="order-management-section" v-if="shippingCodes.length > 0">
            <h4>Thông tin quản lý đơn hàng</h4>
            <div class="management-form">
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="Ghi chú">
                    <el-input
                      v-model="managementInfo.note"
                      placeholder="Nhập ghi chú"
                      type="textarea"
                      :rows="2"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Ngày chốt mua">
                    <el-date-picker
                      v-model="managementInfo.orderDate"
                      type="date"
                      placeholder="Chọn ngày chốt mua"
                      format="DD/MM/YYYY"
                      value-format="DD/MM/YYYY"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="Số lượng">
                    <el-input-number
                      v-model="managementInfo.quantity"
                      :min="1"
                      placeholder="Số lượng"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="Giá nhập">
                    <el-input-number
                      v-model="managementInfo.importPrice"
                      :min="0"
                      :precision="0"
                      placeholder="Giá nhập"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </template>

      <div class="content-container">
        <!-- Summary Stats -->
        <div class="stats-row">
          <el-statistic
            title="Đơn hàng có thể đặt"
            :value="availableOrders.length"
            class="stat-item"
          >
            <template #suffix>
              <el-icon style="color: #f56c6c;"><ShoppingBag /></el-icon>
            </template>
          </el-statistic>
          
          <el-statistic
            title="Mã vận đơn"
            :value="shippingCodes.length"
            class="stat-item"
          >
            <template #suffix>
              <el-icon style="color: #409eff;"><Van /></el-icon>
            </template>
          </el-statistic>

          <el-statistic
            title="Đã chọn"
            :value="selectedOrders.length"
            class="stat-item"
          >
            <template #suffix>
              <el-icon style="color: #67c23a;"><Select /></el-icon>
            </template>
          </el-statistic>
        </div>

        <!-- Orders Table -->
        <div class="table-container">
          <el-table
            ref="tableRef"
            :data="availableOrders"
            v-loading="loading"
            @selection-change="handleSelectionChange"
            row-key="rowIndex"
            style="width: 100%"
            max-height="500"
          >
            <el-table-column type="selection" width="55" />
            
            <el-table-column label="Đại diện" width="80">
              <template #default="{ row }">
                <el-radio
                  v-model="representativeOrderIndex"
                  :label="row.rowIndex"
                  @change="handleRepresentativeChange(row)"
                >
                  &nbsp;
                </el-radio>
              </template>
            </el-table-column>
            
            <el-table-column prop="date" label="Ngày" width="80" />
            
            <el-table-column prop="customerName" label="Khách hàng" min-width="150">
              <template #default="{ row }">
                <div class="customer-info">
                  <div class="customer-name">{{ row.customerName }}</div>
                  <div class="customer-contact" v-if="row.contactInfo">
                    {{ row.contactInfo.substring(0, 20) }}{{ row.contactInfo.length > 20 ? '...' : '' }}
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="Sản phẩm" min-width="200">
              <template #default="{ row }">
                <div class="product-info">
                  <el-image
                    v-if="row.productImage"
                    :src="row.productImage"
                    class="product-image"
                    fit="cover"
                  />
                  <div class="product-details">
                    <div class="product-name">{{ row.productName }}</div>
                    <div class="product-variant">
                      {{ row.color }} | {{ row.size }} | SL: {{ row.quantity }}
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="Mã vận đơn" width="200" v-if="shippingCodes.length > 0">
              <template #default="{ row }">
                <el-radio-group 
                  v-model="orderShippingCodes[row.rowIndex]"
                  @change="handleShippingCodeChange(row)"
                >
                  <el-radio
                    v-for="code in shippingCodes"
                    :key="code"
                    :label="code"
                    class="shipping-radio"
                  >
                    {{ code }}
                  </el-radio>
                </el-radio-group>
              </template>
            </el-table-column>
            
            <el-table-column prop="total" label="Tổng tiền" width="120">
              <template #default="{ row }">
                <span class="price">{{ formatCurrency(row.total) }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="status" label="Trạng thái" width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- Action Buttons -->
        <div class="action-row" v-if="selectedOrders.length > 0 && shippingCodes.length > 0">
          <div class="selected-info">
            <el-icon><InfoFilled /></el-icon>
            Đã chọn {{ selectedOrders.length }} đơn hàng | Mã quản lý: <strong>{{ generatedManagementCode }}</strong>
          </div>
          
          <div class="action-buttons">
            <el-button @click="clearSelection">
              Bỏ chọn
            </el-button>
            
            <el-button 
              type="primary" 
              @click="processOrders"
              :loading="updating"
            >
              Xử lý đơn hàng
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { formatCurrency } from '@/utils/format'
import type { Order } from '@/types/order'
import { ElMessage } from 'element-plus'
import { 
  Refresh, 
  Van,
  ShoppingBag,
  Clock, 
  Select, 
  InfoFilled
} from '@element-plus/icons-vue'

const props = defineProps<{
  selectedDate: { month: number; year: number }
}>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const store = useOrdersStore()
const tableRef = ref()

// Reactive data
const customerType = ref<'customer' | 'ctv'>('customer')
const loading = ref(false)
const updating = ref(false)
const newShippingCode = ref('')
const shippingCodes = ref<string[]>([])
const selectedOrders = ref<Order[]>([])
const orderShippingCodes = ref<Record<number, string>>({})
const representativeOrderIndex = ref<number | null>(null)

// Management info
const managementInfo = ref({
  note: '',
  orderDate: new Date().toLocaleDateString('en-GB'),
  quantity: 1,
  importPrice: 0
})

// Computed
const availableOrders = computed(() => {
  return store.orders.filter(order => 
    order.status === 'ĐANG CHỜ GIAO' || 
    order.status === 'ĐANG VẬN CHUYỂN'
  )
})

const generatedManagementCode = computed(() => {
  const today = new Date()
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const day = today.getDate().toString().padStart(2, '0')
  const timestamp = Date.now().toString().slice(-6)
  return `OC${month}${day}${timestamp}`
})

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    await store.fetchOrders(props.selectedDate, customerType.value)
  } catch {
    ElMessage.error('Lỗi khi tải dữ liệu')
  } finally {
    loading.value = false
  }
}

const addShippingCode = () => {
  const code = newShippingCode.value.trim().toUpperCase()
  if (!code) return
  
  if (shippingCodes.value.includes(code)) {
    ElMessage.warning('Mã vận đơn đã tồn tại')
    return
  }
  
  shippingCodes.value.push(code)
  newShippingCode.value = ''
  ElMessage.success(`Đã thêm mã vận đơn: ${code}`)
}

const removeShippingCode = (code: string) => {
  const index = shippingCodes.value.indexOf(code)
  if (index > -1) {
    shippingCodes.value.splice(index, 1)
    
    // Remove shipping code from orders
    Object.keys(orderShippingCodes.value).forEach(orderIndex => {
      if (orderShippingCodes.value[parseInt(orderIndex)] === code) {
        delete orderShippingCodes.value[parseInt(orderIndex)]
      }
    })
  }
}

const handleSelectionChange = (selection: Order[]) => {
  selectedOrders.value = selection
  
  // Set first selected order as representative if none selected
  if (selection.length > 0 && !representativeOrderIndex.value) {
    representativeOrderIndex.value = selection[0].rowIndex
  }
}

const handleRepresentativeChange = (row: Order) => {
  // Auto-select the order when it's chosen as representative
  const isSelected = selectedOrders.value.some(order => order.rowIndex === row.rowIndex)
  if (!isSelected) {
    selectedOrders.value.push(row)
    tableRef.value?.toggleRowSelection(row, true)
  }
}

const handleShippingCodeChange = (row: Order) => {
  // Auto-select the order when shipping code is chosen
  const isSelected = selectedOrders.value.some(order => order.rowIndex === row.rowIndex)
  if (!isSelected) {
    selectedOrders.value.push(row)
    tableRef.value?.toggleRowSelection(row, true)
  }
}

const clearSelection = () => {
  tableRef.value?.clearSelection()
  selectedOrders.value = []
  orderShippingCodes.value = {}
  representativeOrderIndex.value = null
}

const processOrders = async () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('Vui lòng chọn ít nhất một đơn hàng')
    return
  }

  updating.value = true
  try {
    const managementCode = generatedManagementCode.value
    const representativeOrder = selectedOrders.value.find(order => 
      order.rowIndex === representativeOrderIndex.value
    ) || selectedOrders.value[0]

    // 1. Create record in ORDCHINA sheet
    await createOrderChinaRecord(managementCode, representativeOrder)

    // 2. Update orders in main sheet
    for (const order of selectedOrders.value) {
      const shippingCode = orderShippingCodes.value[order.rowIndex] || ''
      await store.updateOrderWithShipping(
        order.rowIndex,
        managementCode,
        shippingCode,
        'ĐÃ ĐẶT HÀNG',
        props.selectedDate,
        customerType.value
      )
    }

    ElMessage.success(`Đã xử lý ${selectedOrders.value.length} đơn hàng với mã quản lý ${managementCode}`)
    
    // Clear and refresh
    clearSelection()
    shippingCodes.value = []
    managementInfo.value = {
      note: '',
      orderDate: new Date().toLocaleDateString('en-GB'),
      quantity: 1,
      importPrice: 0
    }
    
    await refreshData()
    emit('updated')
    
  } catch {
    ElMessage.error('Có lỗi xảy ra khi xử lý đơn hàng')
  } finally {
    updating.value = false
  }
}

const createOrderChinaRecord = async (managementCode: string, representativeOrder: Order) => {
  try {
    const response = await fetch('/api/sheets/ordchina', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        managementCode,
        productName: representativeOrder.productName,
        productImage: representativeOrder.productImage,
        status: 'Đã đặt hàng',
        shippingCodes: shippingCodes.value.join(', '),
        note: managementInfo.value.note,
        orderDate: managementInfo.value.orderDate,
        quantity: managementInfo.value.quantity,
        importPrice: managementInfo.value.importPrice,
        date: props.selectedDate
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create ORDCHINA record')
    }
  } catch (error) {
    console.error('Error creating ORDCHINA record:', error)
    throw error
  }
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'NHẬN ĐƠN':
      return 'info'
    case 'ĐANG CHỜ GIAO':
      return 'warning'
    case 'ĐANG VẬN CHUYỂN':
      return 'primary'
    case 'ĐÃ ĐẶT HÀNG':
      return 'success'
    case 'HOÀN THÀNH':
      return 'success'
    default:
      return 'info'
  }
}

// Watch customer type changes
watch(customerType, () => {
  refreshData()
})

// Watch selected date changes
watch(() => props.selectedDate, () => {
  refreshData()
}, { deep: true })

// Initialize
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.shipping-code-manager {
  .header-container {
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      .title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
      
      .header-actions {
        display: flex;
        align-items: center;
      }
    }
    
    .shipping-codes-section {
      background: #f0f9ff;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #b3d8ff;
      margin-bottom: 16px;
      
      .input-row {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 12px;
      }
      
      .shipping-codes {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .shipping-code-tag {
          font-weight: 600;
        }
      }
    }

    .order-management-section {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e9ecef;

      h4 {
        margin: 0 0 16px 0;
        color: #303133;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
  
  .content-container {
    .stats-row {
      display: flex;
      gap: 24px;
      margin-bottom: 20px;
      
      .stat-item {
        flex: 1;
        text-align: center;
        padding: 16px;
        background: #fafafa;
        border-radius: 8px;
        border: 1px solid #e4e7ed;
      }
    }
    
    .table-container {
      margin-bottom: 20px;
      
      .customer-info {
        .customer-name {
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }
        
        .customer-contact {
          font-size: 12px;
          color: #909399;
        }
      }
      
      .product-info {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .product-image {
          width: 40px;
          height: 40px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        
        .product-details {
          flex: 1;
          
          .product-name {
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
          }
          
          .product-variant {
            font-size: 12px;
            color: #909399;
          }
        }
      }
      
      .price {
        font-weight: 600;
        color: #e6a23c;
      }

      .shipping-radio {
        display: block;
        margin: 4px 0;
        font-size: 12px;
      }
    }
    
    .action-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f0f9ff;
      border-radius: 8px;
      border: 1px solid #b3d8ff;
      
      .selected-info {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #409eff;
        font-weight: 500;
      }
      
      .action-buttons {
        display: flex;
        gap: 12px;
      }
    }
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .shipping-code-manager {
    .header-container {
      .header-row {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
        
        .header-actions {
          justify-content: center;
        }
      }
      
      .shipping-codes-section {
        .input-row {
          flex-direction: column;
          align-items: stretch;
        }
      }
    }
    
    .content-container {
      .stats-row {
        flex-direction: column;
        gap: 12px;
      }
      
      .action-row {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }
    }
  }
}
</style>
