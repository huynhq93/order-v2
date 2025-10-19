<template>
  <div class="shipping-code-manager">
    <el-card class="w-full">
      <template #header>
        <div class="header-container">
          <div class="header-row">
            <h3 class="title">Quản lý nhập hàng</h3>
            <div class="header-actions">
              <div class="sheet-selector">
                <el-checkbox-group v-model="selectedSheets" @change="debouncedRefresh">
                  <el-checkbox label="customer">Bán hàng</el-checkbox>
                  <el-checkbox label="ctv">CTV</el-checkbox>
                </el-checkbox-group>
              </div>
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
                style="flex: 1; max-width: 300px;"
                @keyup.enter="addShippingCode"
                size="default"
                maxlength="50"
                clearable
              >
                <template #prefix>
                  <el-icon><Van /></el-icon>
                </template>
              </el-input>
              <el-button 
                type="success" 
                @click="addShippingCode"
                :disabled="!newShippingCode.trim()"
                size="default"
              >
                Thêm
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
          <div class="order-management-section">
            <h4>Thông tin quản lý đơn hàng</h4>
            <div class="management-form">
              <el-row :gutter="16">
                <!-- Ghi chú - width nhỏ hơn -->
                <el-col :xs="24" :sm="12" :md="14" :lg="14">
                  <el-form-item label="Ghi chú">
                    <el-input
                      v-model="managementInfo.note"
                      placeholder="Nhập ghi chú"
                      type="textarea"
                      :rows="4"
                      maxlength="200"
                      show-word-limit
                    />
                  </el-form-item>
                </el-col>
                
                <!-- Right column -->
                <el-col :xs="24" :sm="12" :md="10" :lg="10">
                  <!-- Ngày chốt mua -->
                  <el-form-item label="Ngày chốt mua">
                    <el-date-picker
                      v-model="managementInfo.orderDate"
                      type="date"
                      placeholder="Chọn ngày"
                      format="DD/MM/YYYY"
                      value-format="DD/MM/YYYY"
                      style="width: 100%"
                      size="default"
                    />
                  </el-form-item>
                  
                  <!-- Số lượng và Giá nhập cùng 1 hàng -->
                  <el-row :gutter="12" style="margin-top: 12px;">
                    <el-col :span="12">
                      <el-form-item label="Số lượng">
                        <el-input-number
                          v-model="managementInfo.quantity"
                          :min="1"
                          :max="9999"
                          placeholder="SL"
                          style="width: 100%"
                          size="default"
                          controls-position="right"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="Giá nhập">
                        <el-input-number
                          v-model="managementInfo.importPrice"
                          :min="0"
                          :max="99999999"
                          :precision="0"
                          placeholder="Giá"
                          style="width: 100%"
                          size="default"
                          controls-position="right"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
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
            row-key="uniqueId"
            style="width: 100%"
            max-height="500"
          >
            <el-table-column type="selection" width="55" />
            
            <el-table-column label="Đại diện" width="80">
              <template #default="{ row }">
                <el-radio
                  v-model="representativeOrderIndex"
                  :label="row.uniqueId"
                  @change="handleRepresentativeChange(row)"
                >
                  &nbsp;
                </el-radio>
              </template>
            </el-table-column>
            
            <el-table-column label="Mã vận đơn" min-width="100" v-if="shippingCodes.length > 0">
              <template #default="{ row }">
                <div v-if="isOrderSelected(row)">
                  <el-radio-group 
                    v-model="orderShippingCodes[row.uniqueId]"
                    @change="handleShippingCodeChange"
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
                </div>
                <!-- <div v-else class="no-selection-text">
                  Chưa chọn
                </div> -->
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
        <div class="action-row" v-if="selectedOrders.length > 0">
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

// Extended Order type with unique ID for multi-sheet support
interface ExtendedOrder extends Order {
  uniqueId: string
  sheetType: string
}
import { ElMessage } from 'element-plus'
import { 
  Refresh, 
  Van,
  ShoppingBag,
  Select, 
  InfoFilled
} from '@element-plus/icons-vue'
import { ORDER_STATUSES, getOrderStatusType } from '@/constants/orderStatus'
import { createOrdChinaRecord } from '@/api/ordchina'

const props = defineProps<{
  selectedDate: { month: number; year: number }
}>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const store = useOrdersStore()
const tableRef = ref()

// Reactive data
const selectedSheets = ref<string[]>(['customer', 'ctv'])
const loading = ref(false)
const updating = ref(false)
const newShippingCode = ref('')
const shippingCodes = ref<string[]>([])
const selectedOrders = ref<ExtendedOrder[]>([])
const orderShippingCodes = ref<Record<string, string>>({})
const representativeOrderIndex = ref<string | null>(null)
const allOrders = ref<ExtendedOrder[]>([])

// Debounce timer
let refreshTimer: NodeJS.Timeout | null = null

// Debounced refresh to avoid too many API calls
const debouncedRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
  }
  refreshTimer = setTimeout(() => {
    refreshData()
  }, 300) // 300ms delay
}

// Management info
const managementInfo = ref({
  note: '',
  orderDate: new Date().toLocaleDateString('en-GB'),
  quantity: 1,
  importPrice: 0
})

// Computed
const availableOrders = computed(() => {
  return allOrders.value.filter(order => 
    order.status === ORDER_STATUSES.SALES.NHAN_DON
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
    // Clear existing data first
    allOrders.value = []
    
    // Create a temporary array to collect all orders
    const tempOrders: ExtendedOrder[] = []
    
    // Fetch orders from selected sheets
    for (const sheetType of selectedSheets.value) {
      await store.fetchOrders(props.selectedDate, sheetType as 'customer' | 'ctv')
      // Add sheet type info and unique ID to orders
      const ordersWithSheetType = store.orders.map(order => ({
        ...order,
        sheetType,
        uniqueId: `${sheetType}-${order.rowIndex}` // Create unique ID
      })) as ExtendedOrder[]
      
      tempOrders.push(...ordersWithSheetType)
    }
    
    // Set all orders at once to avoid duplication
    allOrders.value = tempOrders
    
    console.log('Loaded orders:', allOrders.value.map(o => ({ uniqueId: o.uniqueId, customerName: o.customerName, sheetType: o.sheetType })))
  } catch (error) {
    console.error('Error loading data:', error)
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
  
  const wasEmpty = shippingCodes.value.length === 0
  shippingCodes.value.push(code)
  newShippingCode.value = ''
  
  // If this is the first shipping code, assign it to all selected orders
  if (wasEmpty) {
    selectedOrders.value.forEach(order => {
      orderShippingCodes.value[order.uniqueId] = code
    })
  }
  
  ElMessage.success(`Đã thêm mã vận đơn: ${code}`)
}

const removeShippingCode = (code: string) => {
  const index = shippingCodes.value.indexOf(code)
  if (index > -1) {
    shippingCodes.value.splice(index, 1)
    
    // Remove shipping code from orders
    Object.keys(orderShippingCodes.value).forEach(uniqueId => {
      if (orderShippingCodes.value[uniqueId] === code) {
        delete orderShippingCodes.value[uniqueId]
      }
    })
  }
}

const handleSelectionChange = (selection: ExtendedOrder[]) => {
  const previousSelection = selectedOrders.value
  selectedOrders.value = selection
  
  // Handle newly selected orders
  const newlySelected = selection.filter(order => 
    !previousSelection.some(prev => prev.uniqueId === order.uniqueId)
  )
  
  // Handle deselected orders
  const deselected = previousSelection.filter(prev => 
    !selection.some(order => order.uniqueId === prev.uniqueId)
  )
  
  // Auto-assign first shipping code to newly selected orders
  newlySelected.forEach(order => {
    if (shippingCodes.value.length > 0) {
      orderShippingCodes.value[order.uniqueId] = shippingCodes.value[0]
    }
  })
  
  // Remove shipping codes for deselected orders
  deselected.forEach(order => {
    delete orderShippingCodes.value[order.uniqueId]
    
    // If this was the representative order, clear it
    if (representativeOrderIndex.value === order.uniqueId) {
      representativeOrderIndex.value = null
    }
  })
  
  // Set representative order
  if (selection.length > 0) {
    // If no representative or current representative is not in selection
    if (!representativeOrderIndex.value || 
        !selection.some(order => order.uniqueId === representativeOrderIndex.value)) {
      representativeOrderIndex.value = selection[0].uniqueId
    }
  } else {
    // No orders selected, clear representative
    representativeOrderIndex.value = null
  }
}

const handleRepresentativeChange = (row: ExtendedOrder) => {
  // Auto-select the order when it's chosen as representative
  const isSelected = selectedOrders.value.some(order => order.uniqueId === row.uniqueId)
  if (!isSelected) {
    selectedOrders.value.push(row)
    tableRef.value?.toggleRowSelection(row, true)
    
    // Auto-assign first shipping code if available
    if (shippingCodes.value.length > 0) {
      orderShippingCodes.value[row.uniqueId] = shippingCodes.value[0]
    }
  }
}

const isOrderSelected = (row: ExtendedOrder) => {
  return selectedOrders.value.some(order => order.uniqueId === row.uniqueId)
}

const handleShippingCodeChange = () => {
  // No need to auto-select since radio only shows when already selected
  // Just handle the shipping code change
}

const clearSelection = () => {
  selectedOrders.value = []
  orderShippingCodes.value = {}
  representativeOrderIndex.value = null
  tableRef.value?.clearSelection()
}

const processOrders = async () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('Vui lòng chọn ít nhất một đơn hàng')
    return
  }

  updating.value = true
  console.log('Starting processOrders...')
  
  try {
    const managementCode = generatedManagementCode.value
    const representativeOrder = selectedOrders.value.find(order => 
      order.uniqueId === representativeOrderIndex.value
    ) || selectedOrders.value[0]

    console.log('Management code:', managementCode)
    console.log('Representative order:', representativeOrder)
    console.log('Selected date:', props.selectedDate)

    // 1. Create record in ORDCHINA sheet
    await createOrderChinaRecord(managementCode, representativeOrder)
    console.log('ORDCHINA record created successfully')

    // 2. Update orders in main sheet
    console.log('Step 2: Updating orders in main sheet...:', selectedOrders.value)
    let successCount = 0
    for (const order of selectedOrders.value) {
      console.log('Step 2.1:', order)
      console.log('Step 2.2:', order.rowIndex, 'uniqueId:', order.uniqueId)
      const shippingCode = orderShippingCodes.value[order.uniqueId] || ''
      console.log('Step 2.3:', shippingCode)
      
      // First, fetch fresh orders for the specific sheet to ensure store has the data
      await store.fetchOrders(props.selectedDate, order.sheetType || 'customer')
      
      await store.updateOrderWithShipping(
        order.rowIndex,
        managementCode,
        shippingCode,
        ORDER_STATUSES.SALES.DA_DAT_HANG,
        props.selectedDate,
        order.sheetType || 'customer'
      )
      console.log('Step 2.4: Updated order successfully')
      successCount++
    }

    console.log(`Successfully updated ${successCount}/${selectedOrders.value.length} orders`)
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
    
  } catch (error: unknown) {
    console.error('Error in processOrders:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    ElMessage.error(`Có lỗi xảy ra khi xử lý đơn hàng: ${errorMessage}`)
  } finally {
    updating.value = false
    console.log('processOrders completed')
  }
}

const createOrderChinaRecord = async (managementCode: string, representativeOrder: Order) => {
  try {
    console.log('Creating ORDCHINA record with data:', {
      managementCode,
      productName: representativeOrder.productName,
      productImage: representativeOrder.productImage,
      status: 'Đã đặt hàng',
      shippingCodes: shippingCodes.value.length > 0 ? shippingCodes.value.join(', ') : '',
      note: managementInfo.value.note,
      orderDate: managementInfo.value.orderDate,
      quantity: managementInfo.value.quantity,
      importPrice: managementInfo.value.importPrice,
      date: props.selectedDate
    })
    
    const result = await createOrdChinaRecord({
      managementCode,
      productName: representativeOrder.productName,
      productImage: representativeOrder.productImage,
      status: 'Đã đặt hàng',
      shippingCodes: shippingCodes.value.length > 0 ? shippingCodes.value.join(', ') : '',
      note: managementInfo.value.note,
      orderDate: managementInfo.value.orderDate,
      quantity: managementInfo.value.quantity,
      importPrice: managementInfo.value.importPrice,
      date: props.selectedDate
    })
    
    console.log('ORDCHINA API response:', result)
    return result
  } catch (error) {
    console.error('Error creating ORDCHINA record:', error)
    throw error
  }
}

const getStatusType = getOrderStatusType

// Watch selected sheets changes
watch(selectedSheets, () => {
  // Clear selections when changing sheets to avoid confusion
  clearSelection()
  debouncedRefresh()
}, { deep: true })

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
        
        .sheet-selector {
          margin-right: 16px;
          
          :deep(.el-checkbox-group) {
            display: flex;
            gap: 12px;
          }
        }
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
        flex-wrap: wrap;
        
        @media (max-width: 576px) {
          flex-direction: column;
          align-items: stretch;
          
          .el-input {
            max-width: 100% !important;
          }
        }
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

      .management-form {
        :deep(.el-form-item__label) {
          font-weight: 500;
          color: #606266;
          font-size: 14px;
        }

        :deep(.el-input-number) {
          .el-input__inner {
            text-align: left;
          }
        }

        :deep(.el-textarea__inner) {
          resize: vertical;
          min-height: 80px;
        }
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

      .no-selection-text {
        color: #c0c4cc;
        font-style: italic;
        font-size: 12px;
        text-align: center;
        padding: 8px;
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
          
          .el-input {
            margin-bottom: 8px;
          }
        }
      }
      
      .order-management-section {
        .management-form {
          :deep(.el-col) {
            margin-bottom: 16px;
          }
          
          :deep(.el-form-item) {
            margin-bottom: 12px;
          }
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
