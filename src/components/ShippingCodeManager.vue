<template>
  <div class="shipping-code-manager">
    <el-card class="w-full">
      <template #header>
        <div class="header-container">
          <div class="header-row">
            <h3 class="title">Nhập mã vận đơn</h3>
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
          
          <!-- Single Shipping Code Input -->
          <div class="shipping-code-input-section">
            <div class="input-row">
              <el-input
                v-model="singleShippingCode"
                placeholder="Nhập mã vận đơn (VD: VD123)"
                style="width: 300px;"
                clearable
              >
                <template #prefix>
                  <el-icon><DocumentAdd /></el-icon>
                </template>
              </el-input>
            </div>
          </div>
        </div>
      </template>

      <div class="content-container">
        <!-- Summary Stats -->
        <div class="stats-row">
          <el-statistic
            title="Đơn chờ nhập mã vận đơn"
            :value="pendingOrders.length"
            class="stat-item"
          >
            <template #suffix>
              <el-icon style="color: #f56c6c;"><Clock /></el-icon>
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
            :data="filteredPendingOrders"
            v-loading="loading"
            @selection-change="handleSelectionChange"
            row-key="rowIndex"
            style="width: 100%"
            max-height="500"
          >
            <el-table-column type="selection" width="55" />
            
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
            Đã chọn {{ selectedOrders.length }} đơn hàng
          </div>
          
          <div class="action-buttons">
            <el-button @click="clearSelection">
              Bỏ chọn
            </el-button>
            
            <el-button 
              type="primary" 
              @click="applyShippingCode"
              :disabled="!singleShippingCode.trim()"
            >
              Áp dụng mã vận đơn
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
  DocumentAdd, 
  Clock, 
  Select, 
  InfoFilled
} from '@element-plus/icons-vue'
import { ORDER_STATUSES, getOrderStatusType } from '@/constants/orderStatus'

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
const singleShippingCode = ref('')
const selectedOrders = ref<Order[]>([])

// Computed
const pendingOrders = computed(() => {
  return store.orders.filter(order => 
    order.status === ORDER_STATUSES.SALES.DANG_CHO_GIAO || 
    order.status === ORDER_STATUSES.SALES.HANG_VE
  )
})

const filteredPendingOrders = computed(() => {
  return pendingOrders.value
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



const handleSelectionChange = (selection: Order[]) => {
  selectedOrders.value = selection
}

const clearSelection = () => {
  tableRef.value?.clearSelection()
  selectedOrders.value = []
}

const applyShippingCode = () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('Vui lòng chọn ít nhất một đơn hàng')
    return
  }
  
  if (!singleShippingCode.value.trim()) {
    ElMessage.warning('Vui lòng nhập mã vận đơn')
    return
  }
  
  confirmBatchUpdate()
}

const confirmBatchUpdate = async () => {
  updating.value = true
  try {
    const shippingCode = singleShippingCode.value.trim().toUpperCase()
    
    // Update each selected order
    for (const order of selectedOrders.value) {
      await store.updateOrderWithShipping(
        order.rowIndex,
        '', // no management code for this case
        shippingCode,
        ORDER_STATUSES.SALES.DANG_GIAO,
        props.selectedDate,
        customerType.value
      )
    }
    
    ElMessage.success(`Đã cập nhật ${selectedOrders.value.length} đơn hàng với mã vận đơn ${shippingCode}`)
    
    // Clear selection and refresh
    clearSelection()
    singleShippingCode.value = ''
    
    // Refresh data
    await refreshData()
    emit('updated')
    
  } catch {
    ElMessage.error('Có lỗi xảy ra khi cập nhật đơn hàng')
  } finally {
    updating.value = false
  }
}

const getStatusType = getOrderStatusType

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
.order-code-manager {
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
    
    .shipping-code-input-section {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      
      .input-row {
        display: flex;
        gap: 12px;
        align-items: center;
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

.confirm-content {
  .confirm-info {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 20px;
    padding: 16px;
    background: #fef7e6;
    border-radius: 8px;
    border: 1px solid #f4d03f;
    
    p {
      margin: 4px 0;
    }
  }
  
  .order-preview {
    .more-items {
      text-align: center;
      color: #909399;
      font-style: italic;
      margin-top: 8px;
    }
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .order-code-manager {
    .header-container {
      .header-row {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
        
        .header-actions {
          justify-content: center;
        }
      }
      
      .batch-input-section {
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
