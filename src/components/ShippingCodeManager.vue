<template>
  <div class="shipping-code-manager">
    <el-card class="w-full">
      <template #header>
        <div class="header-container">
          <div class="header-row">
            <h3 class="title">Quản lý mã vận đơn</h3>
            <div class="header-actions">
              <div class="sheet-selector">
                <el-checkbox-group v-model="selectedSheets" @change="refreshData">
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
        </div>
      </template>

      <div class="content-container">
        <!-- Grouped Orders -->
        <div v-for="group in groupedOrders" :key="group.key" class="order-group">
          <!-- Group Header -->
          <div class="group-header">
            <div class="group-info">
              <div class="management-code">
                <strong>{{ group.managementCode || 'Chưa có mã quản lý' }}</strong>
              </div>
              <div class="shipping-code" v-if="group.shippingCode">
                Mã vận đơn: <el-tag type="primary">{{ group.shippingCode }}</el-tag>
              </div>
              <div class="orders-count">
                {{ group.orders.length }} đơn hàng
              </div>
            </div>
            
            <!-- Shipping Code Actions for groups without shipping code -->
            <div class="group-actions" v-if="!group.shippingCode && selectedOrdersInGroup(group.key).length > 0">
              <el-input
                v-model="groupShippingCodes[group.key]"
                placeholder="Nhập mã vận đơn"
                style="width: 200px; margin-right: 12px;"
                size="default"
              >
                <template #prefix>
                  <el-icon><Van /></el-icon>
                </template>
              </el-input>
              <el-button
                type="primary"
                @click="applyShippingCodeToGroup(group.key)"
                :disabled="!groupShippingCodes[group.key]?.trim()"
                size="default"
              >
                Thêm mã vận đơn
              </el-button>
            </div>
            
            <!-- Status Update for groups with shipping code -->
            <div class="group-actions" v-if="group.shippingCode">
              <el-select
                v-model="groupStatuses[group.key]"
                placeholder="Chọn trạng thái"
                style="width: 180px; margin-right: 12px;"
                size="default"
              >
                <el-option label="Đang giao" :value="ORDER_STATUSES.SALES.DANG_GIAO" />
                <el-option label="Đã giao" :value="ORDER_STATUSES.SALES.DA_GIAO" />
                <el-option label="Hoàn trả" :value="ORDER_STATUSES.SALES.HOAN_TRA" />
              </el-select>
              <el-button
                type="success"
                @click="updateGroupStatus(group.key)"
                :disabled="!groupStatuses[group.key]"
                size="default"
              >
                Cập nhật trạng thái
              </el-button>
            </div>
          </div>
          
          <!-- Orders Table for this group -->
          <el-table
            :data="group.orders"
            row-key="uniqueId"
            style="width: 100%"
            @selection-change="(selection) => handleGroupSelectionChange(group.key, selection)"
          >
            <!-- Checkbox only for orders without shipping code -->
            <el-table-column 
              v-if="!group.shippingCode" 
              type="selection" 
              width="55" 
            />
            
            <el-table-column prop="date" label="Ngày" width="80" />
            
            <el-table-column label="Sheet" width="80">
              <template #default="{ row }">
                <el-tag :type="row.sheetType === 'customer' ? 'primary' : 'warning'" size="small">
                  {{ row.sheetType === 'customer' ? 'Bán hàng' : 'CTV' }}
                </el-tag>
              </template>
            </el-table-column>
            
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
            
            <el-table-column prop="status" label="Trạng thái" width="150">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- Empty State -->
        <div v-if="groupedOrders.length === 0" class="empty-state">
          <el-empty description="Không có đơn hàng nào" />
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
  Van
} from '@element-plus/icons-vue'
import { ORDER_STATUSES, getOrderStatusType } from '@/constants/orderStatus'

// Extended Order type with unique ID for multi-sheet support
interface ExtendedOrder extends Order {
  uniqueId: string
  sheetType: string
}

const props = defineProps<{
  selectedDate: { month: number; year: number }
}>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const store = useOrdersStore()

// Reactive data
const selectedSheets = ref<string[]>(['customer', 'ctv'])
const loading = ref(false)
const updating = ref(false)
const allOrders = ref<ExtendedOrder[]>([])
const groupSelections = ref<Record<string, ExtendedOrder[]>>({})
const groupShippingCodes = ref<Record<string, string>>({})
const groupStatuses = ref<Record<string, string>>({})

// Computed
const groupedOrders = computed(() => {
  const groups = new Map<string, {
    key: string
    managementCode: string | null
    shippingCode: string | null
    orders: ExtendedOrder[]
  }>()
  
  // Group orders by management code and shipping code
  allOrders.value.forEach(order => {
    const managementCode = order.managementCode || null
    const shippingCode = order.shippingCode || null
    const key = `${managementCode || 'no-mgmt'}-${shippingCode || 'no-ship'}`
    
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        managementCode,
        shippingCode,
        orders: []
      })
    }
    
    groups.get(key)!.orders.push(order)
  })
  
  // Sort groups: no shipping code first, then by management code
  return Array.from(groups.values()).sort((a, b) => {
    if (!a.shippingCode && b.shippingCode) return -1
    if (a.shippingCode && !b.shippingCode) return 1
    return (a.managementCode || '').localeCompare(b.managementCode || '')
  })
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
      const ordersWithSheetType = store.orders
        .filter(order => order.status === ORDER_STATUSES.SALES.DA_DAT_HANG)
        .map(order => ({
          ...order,
          sheetType,
          uniqueId: `${sheetType}-${order.rowIndex}`, // Create unique ID
          managementCode: order.orderCode // Map orderCode to managementCode for consistency
        })) as ExtendedOrder[]
      
      tempOrders.push(...ordersWithSheetType)
    }
    
    // Set all orders at once
    allOrders.value = tempOrders
    
    console.log('Loaded orders for ShippingCodeManager:', allOrders.value.map(o => ({ 
      uniqueId: o.uniqueId, 
      customerName: o.customerName, 
      sheetType: o.sheetType,
      orderCode: o.orderCode,
      managementCode: o.managementCode,
      shippingCode: o.shippingCode,
      status: o.status
    })))
    
  } catch (error) {
    console.error('Error loading data:', error)
    ElMessage.error('Lỗi khi tải dữ liệu')
  } finally {
    loading.value = false
  }
}

const handleGroupSelectionChange = (groupKey: string, selection: ExtendedOrder[]) => {
  groupSelections.value[groupKey] = selection
}

const selectedOrdersInGroup = (groupKey: string) => {
  return groupSelections.value[groupKey] || []
}

const applyShippingCodeToGroup = async (groupKey: string) => {
  const selectedOrders = selectedOrdersInGroup(groupKey)
  const shippingCode = groupShippingCodes.value[groupKey]?.trim()
  
  if (selectedOrders.length === 0) {
    ElMessage.warning('Vui lòng chọn ít nhất một đơn hàng')
    return
  }
  
  if (!shippingCode) {
    ElMessage.warning('Vui lòng nhập mã vận đơn')
    return
  }
  
  updating.value = true
  try {
    const upperShippingCode = shippingCode.toUpperCase()
    
    // Update each selected order
    for (const order of selectedOrders) {
      await store.updateOrderWithShipping(
        order.rowIndex,
        order.managementCode || '',
        upperShippingCode,
        ORDER_STATUSES.SALES.DANG_GIAO,
        props.selectedDate,
        order.sheetType as 'customer' | 'ctv'
      )
    }
    
    ElMessage.success(`Đã thêm mã vận đơn ${upperShippingCode} cho ${selectedOrders.length} đơn hàng`)
    
    // Clear group data
    delete groupSelections.value[groupKey]
    delete groupShippingCodes.value[groupKey]
    
    // Refresh data
    await refreshData()
    emit('updated')
    
  } catch (error) {
    console.error('Error updating shipping code:', error)
    ElMessage.error('Có lỗi xảy ra khi cập nhật mã vận đơn')
  } finally {
    updating.value = false
  }
}

const updateGroupStatus = async (groupKey: string) => {
  const group = groupedOrders.value.find(g => g.key === groupKey)
  const newStatus = groupStatuses.value[groupKey]
  
  if (!group || !newStatus) {
    ElMessage.warning('Vui lòng chọn trạng thái')
    return
  }
  
  updating.value = true
  try {
    // Update all orders in the group
    for (const order of group.orders) {
      await store.updateOrderWithShipping(
        order.rowIndex,
        order.managementCode || '',
        order.shippingCode || '',
        newStatus,
        props.selectedDate,
        order.sheetType as 'customer' | 'ctv'
      )
    }
    
    ElMessage.success(`Đã cập nhật trạng thái cho ${group.orders.length} đơn hàng`)
    
    // Clear group status
    delete groupStatuses.value[groupKey]
    
    // Refresh data
    await refreshData()
    emit('updated')
    
  } catch (error) {
    console.error('Error updating status:', error)
    ElMessage.error('Có lỗi xảy ra khi cập nhật trạng thái')
  } finally {
    updating.value = false
  }
}

const getStatusType = getOrderStatusType

// Watch selected sheets changes
watch(selectedSheets, () => {
  refreshData()
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
  }
  
  .content-container {
    .order-group {
      margin-bottom: 24px;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      overflow: hidden;
      
      .group-header {
        background: #f5f7fa;
        padding: 16px;
        border-bottom: 1px solid #e4e7ed;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .group-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          
          .management-code {
            font-size: 16px;
            color: #303133;
          }
          
          .shipping-code {
            font-size: 14px;
            color: #606266;
          }
          
          .orders-count {
            font-size: 12px;
            color: #909399;
          }
        }
        
        .group-actions {
          display: flex;
          align-items: center;
        }
      }
      
      :deep(.el-table) {
        border: none;
        
        .el-table__header {
          th {
            background: #fafafa;
          }
        }
      }
    }
    
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
    
    .empty-state {
      text-align: center;
      padding: 40px;
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
  .shipping-code-manager {
    .header-container {
      .header-row {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
        
        .header-actions {
          justify-content: center;
          
          .sheet-selector {
            margin-right: 0;
            margin-bottom: 12px;
          }
        }
      }
    }
    
    .content-container {
      .order-group {
        .group-header {
          flex-direction: column;
          gap: 12px;
          align-items: stretch;
          
          .group-actions {
            justify-content: stretch;
            
            .el-input {
              width: 100% !important;
              margin-right: 0 !important;
              margin-bottom: 8px;
            }
            
            .el-select {
              width: 100% !important;
              margin-right: 0 !important;
              margin-bottom: 8px;
            }
          }
        }
      }
    }
  }
}
</style>
