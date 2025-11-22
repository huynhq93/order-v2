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
              <div class="status-filter">
                <el-checkbox v-model="showDeliveredOrders" @change="refreshData">
                  Hiển thị đơn hàng đã về
                </el-checkbox>
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
        <!-- Management Code Groups -->
        <div 
          v-for="managementGroup in groupedOrdersByManagement" 
          :key="managementGroup.managementCode || 'no-mgmt'" 
          class="management-group"
        >
          <!-- Management Code Header -->
          <div class="management-header" :style="{ '--mgmt-color': getManagementColor(managementGroup) }">
            <div class="management-info">
              <div class="management-title">
                <el-icon class="mgmt-icon" :color="getManagementColor(managementGroup)">
                  <Box />
                </el-icon>
                <h3 class="mgmt-text">
                  {{ managementGroup.managementCode || 'Chưa có mã quản lý' }}
                </h3>
                <el-tag 
                  :type="getManagementTagType(managementGroup)" 
                  class="mgmt-badge"
                >
                  Order China
                </el-tag>
                <el-tag 
                  v-if="hasPendingShippingOrders(managementGroup)"
                  type="warning" 
                  size="small"
                  class="pending-indicator"
                >
                  <el-icon><Clock /></el-icon>
                  Có đơn chờ xử lý
                </el-tag>
              </div>
              <div class="management-stats">
                <el-tag type="info" size="small" class="stats-tag">
                  <el-icon><Document /></el-icon>
                  {{ managementGroup.orders.length }} đơn hàng
                </el-tag>
                <el-tag type="success" size="small" class="stats-tag">
                  <el-icon><Money /></el-icon>
                  {{ formatCurrency(calculateManagementTotal(managementGroup)) }}
                </el-tag>
                <el-tag :type="getManagementSheetTypeTagType(managementGroup)" size="small" class="stats-tag">
                  {{ getManagementSheetTypesText(managementGroup) }}
                </el-tag>
              </div>
            </div>
          </div>

          <!-- Shipping Code Sub-Groups -->
          <div class="shipping-groups">
            <div 
              v-for="[shippingCode, orders] in managementGroup.subGroups.entries()" 
              :key="`${managementGroup.managementCode || 'no-mgmt'}-${shippingCode}`"
              class="shipping-subgroup"
              :class="getShippingGroupClass(shippingCode)"
            >
              <!-- Shipping Sub-Group Header -->
              <div class="shipping-header" :class="getShippingHeaderClass(shippingCode)">
                <div class="shipping-info">
                  <div v-if="shippingCode !== 'no-shipping'" class="shipping-code">
                    <el-icon class="ship-icon"><Van /></el-icon>
                    <span>Mã vận đơn:</span>
                    <el-tag type="primary" class="shipping-tag">
                      {{ shippingCode }}
                    </el-tag>
                    <el-tag 
                      :type="getShippingStatusType(orders)" 
                      size="small"
                      class="status-indicator"
                    >
                      {{ getShippingStatusText(orders) }}
                    </el-tag>
                  </div>
                  <div v-else class="no-shipping">
                    <el-icon class="ship-icon" color="#909399"><Van /></el-icon>
                    <span class="no-shipping-text">Chưa có mã vận đơn</span>
                    <el-tag type="warning" size="small" class="priority-tag">
                      <el-icon><Clock /></el-icon>
                      Ưu tiên xử lý
                    </el-tag>
                    <el-tag type="info" size="small">
                      {{ orders.length }} đơn chờ xử lý
                    </el-tag>
                  </div>
                </div>
                
                <!-- Actions for shipping groups -->
                <div class="shipping-actions" v-if="shippingCode === 'no-shipping' && selectedOrdersInShippingGroup(managementGroup.managementCode, shippingCode).length > 0">
                  <el-input
                    v-model="shippingGroupCodes[`${managementGroup.managementCode || 'no-mgmt'}-${shippingCode}`]"
                    placeholder="Nhập mã vận đơn"
                    style="width: 200px;"
                    size="default"
                  >
                    <template #prefix>
                      <el-icon><Van /></el-icon>
                    </template>
                  </el-input>
                  <el-button
                    type="primary"
                    @click="applyShippingCodeToShippingGroup(managementGroup.managementCode, shippingCode)"
                    :disabled="!shippingGroupCodes[`${managementGroup.managementCode || 'no-mgmt'}-${shippingCode}`]?.trim()"
                    size="default"
                  >
                    Thêm mã vận đơn
                  </el-button>
                </div>
                
                <!-- Add Order Button -->
                <div class="shipping-actions">
                  <el-button
                    type="success"
                    @click="openAddOrderModal(managementGroup.managementCode, shippingCode)"
                    :icon="Plus"
                    size="default"
                  >
                    Thêm đơn hàng
                  </el-button>
                </div>
                
                <!-- Status Update for groups with shipping code -->
                <div class="shipping-actions" v-if="shippingCode !== 'no-shipping'">
                  <el-select
                    v-model="shippingGroupStatuses[`${managementGroup.managementCode || 'no-mgmt'}-${shippingCode}`]"
                    placeholder="Chọn trạng thái"
                    style="width: 180px;"
                    size="default"
                  >
                    <el-option label="Hàng về" :value="ORDER_STATUSES.SALES.HANG_VE" />
                    <el-option label="Đã đặt hàng" :value="ORDER_STATUSES.SALES.DA_DAT_HANG" />
                    <!-- <el-option label="Hoàn hàng" :value="ORDER_STATUSES.SALES.HOAN_HANG" /> -->
                  </el-select>
                  <el-button
                    type="success"
                    @click="updateShippingGroupStatus(managementGroup.managementCode, shippingCode)"
                    :disabled="!shippingGroupStatuses[`${managementGroup.managementCode || 'no-mgmt'}-${shippingCode}`]"
                    size="default"
                  >
                    Cập nhật trạng thái
                  </el-button>
                </div>
              </div>
              
              <!-- Orders Table for this shipping sub-group -->
              <el-table
                :data="orders"
                row-key="uniqueId"
                style="width: 100%"
                @selection-change="(selection: ExtendedOrder[]) => handleShippingGroupSelectionChange(managementGroup.managementCode, shippingCode, selection)"
              >
                <!-- Checkbox only for orders without shipping code -->
                <el-table-column 
                  v-if="shippingCode === 'no-shipping'" 
                  type="selection" 
                  width="55" 
                />
                
                <!-- Delete action column -->
                <el-table-column label="" width="60" align="center">
                  <template #default="{ row }">
                    <el-button
                      type="danger"
                      :icon="Delete"
                      size="small"
                      circle
                      @click="handleRemoveOrderFromGroup(row)"
                      title="Xóa khỏi nhóm"
                    />
                  </template>
                </el-table-column>
                
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
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="groupedOrdersByManagement.length === 0" class="empty-state">
          <el-empty description="Không có đơn hàng nào" />
        </div>
      </div>
    </el-card>

    <!-- Add Order Modal -->
    <el-dialog
      v-model="addOrderModalVisible"
      title="Thêm đơn hàng vào nhóm"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="add-order-modal">
        <!-- Sticky Header Section -->
        <div class="modal-sticky-header">
          <div class="modal-header-info">
            <el-alert type="info" :closable="false">
              <template #title>
                <div class="alert-content">
                  <div><strong>Mã quản lý:</strong> {{ currentManagementCode || 'Chưa có' }}</div>
                  <div><strong>Mã vận đơn:</strong> {{ currentShippingCode !== 'no-shipping' ? currentShippingCode : 'Chưa có' }}</div>
                </div>
              </template>
            </el-alert>
          </div>

          <!-- Customer Filter and Add Button Row -->
          <div class="modal-filter-actions-row">
            <div class="modal-filter">
              <el-select
                v-model="selectedCustomerFilter"
                multiple
                filterable
                collapse-tags
                collapse-tags-tooltip
                placeholder="Lọc theo tên khách hàng"
                clearable
                size="default"
              >
                <el-option
                  v-for="name in uniqueCustomerNames"
                  :key="name"
                  :label="name"
                  :value="name"
                />
              </el-select>
            </div>

            <div class="modal-header-actions">
              <el-button
                type="primary"
                @click="handleAddOrders"
                :disabled="selectedAvailableOrders.length === 0"
                :loading="updating"
                size="default"
              >
                Thêm {{ selectedAvailableOrders.length }} đơn hàng
              </el-button>
            </div>
          </div>
        </div>

        <!-- Scrollable Table Section -->
        <div class="modal-table-container">
          <el-table
          :data="filteredAvailableOrders"
          row-key="uniqueId"
          @selection-change="handleAvailableOrdersSelectionChange"
          v-loading="loadingAvailableOrders"
        >
          <el-table-column type="selection" width="55" />
          
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
      </div>

      <template #footer>
        <el-button @click="addOrderModalVisible = false">Hủy</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { formatCurrency } from '@/utils/format'
import type { Order } from '@/types/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Refresh, 
  Van,
  Box,
  Document,
  Money,
  Clock,
  Plus,
  Delete
} from '@element-plus/icons-vue'
import { ORDER_STATUSES, getOrderStatusType } from '@/constants/orderStatus'

// Extended Order type with unique ID for multi-sheet support
interface ExtendedOrder extends Order {
  uniqueId: string
  sheetType: 'customer' | 'ctv'
}

// Management Group type
interface ManagementGroup {
  managementCode: string | null
  orders: ExtendedOrder[]
  subGroups: Map<string, ExtendedOrder[]>
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
const showDeliveredOrders = ref(false)
const loading = ref(false)
const updating = ref(false)
const allOrders = ref<ExtendedOrder[]>([])
const shippingGroupSelections = ref<Record<string, ExtendedOrder[]>>({})
const shippingGroupCodes = ref<Record<string, string>>({})
const shippingGroupStatuses = ref<Record<string, string>>({})

// Add Order Modal
const addOrderModalVisible = ref(false)
const currentManagementCode = ref<string | null>(null)
const currentShippingCode = ref<string>('')
const availableOrders = ref<ExtendedOrder[]>([])
const selectedAvailableOrders = ref<ExtendedOrder[]>([])
const loadingAvailableOrders = ref(false)
const selectedCustomerFilter = ref<string[]>([]) // Customer name filter

// Computed - Group orders by management code only
const groupedOrdersByManagement = computed(() => {
  const groups = new Map<string, {
    managementCode: string | null
    orders: ExtendedOrder[]
    subGroups: Map<string, ExtendedOrder[]>
  }>()
  
  // First group by management code
  allOrders.value.forEach(order => {
    const managementCode = order.managementCode || null
    const key = managementCode || 'no-mgmt'
    
    if (!groups.has(key)) {
      groups.set(key, {
        managementCode,
        orders: [],
        subGroups: new Map()
      })
    }
    
    const group = groups.get(key)!
    group.orders.push(order)
    
    // Sub-group by shipping code within the management code group
    const shippingCode = order.shippingCode || 'no-shipping'
    if (!group.subGroups.has(shippingCode)) {
      group.subGroups.set(shippingCode, [])
    }
    group.subGroups.get(shippingCode)!.push(order)
  })
  
  // Sort groups by shipping code status priority
  const sortedGroups = Array.from(groups.values()).sort((a, b) => {
    // Helper function to determine group priority
    const getGroupPriority = (group: typeof a) => {
      const hasNoShipping = group.subGroups.has('no-shipping')
      const hasShipping = Array.from(group.subGroups.keys()).some(key => key !== 'no-shipping')
      
      // Priority 1: Groups with ONLY 'no-shipping' (no shipping code at all)
      if (hasNoShipping && !hasShipping) return 1
      
      // Priority 2: Groups with BOTH 'no-shipping' and shipping codes (partial)
      if (hasNoShipping && hasShipping) return 2
      
      // Priority 3: Groups with ONLY shipping codes (all orders have shipping)
      if (!hasNoShipping && hasShipping) return 3
      
      return 4 // Fallback
    }
    
    const priorityA = getGroupPriority(a)
    const priorityB = getGroupPriority(b)
    
    // Sort by priority first
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }
    
    // Within same priority, sort by management code
    // Groups without management code come after groups with management code
    if (!a.managementCode && b.managementCode) return 1
    if (a.managementCode && !b.managementCode) return -1
    return (a.managementCode || '').localeCompare(b.managementCode || '')
  })
  
  // Sort sub-groups within each management group: no-shipping first, then by shipping code
  sortedGroups.forEach(group => {
    const sortedSubGroups = new Map<string, ExtendedOrder[]>()
    const subGroupEntries = Array.from(group.subGroups.entries()).sort(([keyA], [keyB]) => {
      // 'no-shipping' groups come first
      if (keyA === 'no-shipping' && keyB !== 'no-shipping') return -1
      if (keyA !== 'no-shipping' && keyB === 'no-shipping') return 1
      // Then sort alphabetically by shipping code
      return keyA.localeCompare(keyB)
    })
    
    subGroupEntries.forEach(([key, orders]) => {
      sortedSubGroups.set(key, orders)
    })
    
    group.subGroups = sortedSubGroups
  })
  
  return sortedGroups
})

// Computed - Get unique customer names from available orders
const uniqueCustomerNames = computed(() => {
  const names = new Set(availableOrders.value.map(order => order.customerName))
  return Array.from(names).sort()
})

// Computed - Filter available orders by selected customers
const filteredAvailableOrders = computed(() => {
  if (selectedCustomerFilter.value.length === 0) {
    return availableOrders.value
  }
  return availableOrders.value.filter(order => 
    selectedCustomerFilter.value.includes(order.customerName)
  )
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
        .filter(order => {
          // Always include orders with DA_DAT_HANG status
          if (order.status === ORDER_STATUSES.SALES.DA_DAT_HANG) return true
          // Include orders with HANG_VE status only if checkbox is checked
          if (showDeliveredOrders.value && order.status === ORDER_STATUSES.SALES.HANG_VE) return true
          return false
        })
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

// New methods for management + shipping group structure
const handleShippingGroupSelectionChange = (managementCode: string | null, shippingCode: string, selection: ExtendedOrder[]) => {
  const key = `${managementCode || 'no-mgmt'}-${shippingCode}`
  shippingGroupSelections.value[key] = selection
}

const selectedOrdersInShippingGroup = (managementCode: string | null, shippingCode: string) => {
  const key = `${managementCode || 'no-mgmt'}-${shippingCode}`
  return shippingGroupSelections.value[key] || []
}

const applyShippingCodeToShippingGroup = async (managementCode: string | null, shippingCode: string) => {
  const selectedOrders = selectedOrdersInShippingGroup(managementCode, shippingCode)
  const key = `${managementCode || 'no-mgmt'}-${shippingCode}`
  const newShippingCode = shippingGroupCodes.value[key]?.trim()
  
  if (selectedOrders.length === 0) {
    ElMessage.warning('Vui lòng chọn ít nhất một đơn hàng')
    return
  }
  
  if (!newShippingCode) {
    ElMessage.warning('Vui lòng nhập mã vận đơn')
    return
  }
  
  updating.value = true
  try {
    const upperShippingCode = newShippingCode.toUpperCase()
    
    // Update each selected order
    for (const order of selectedOrders) {
      await store.updateOrderWithShipping(
        order.rowIndex,
        order.managementCode || '',
        upperShippingCode,
        order.status,
        props.selectedDate,
        order.sheetType as 'customer' | 'ctv'
      )
    }
    
    ElMessage.success(`Đã thêm mã vận đơn ${upperShippingCode} cho ${selectedOrders.length} đơn hàng`)
    
    // Clear group data
    delete shippingGroupSelections.value[key]
    delete shippingGroupCodes.value[key]
    
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

const updateShippingGroupStatus = async (managementCode: string | null, shippingCode: string) => {
  const key = `${managementCode || 'no-mgmt'}-${shippingCode}`
  const newStatus = shippingGroupStatuses.value[key]
  
  // Find orders in this shipping group
  const managementGroup = groupedOrdersByManagement.value.find(g => g.managementCode === managementCode)
  const orders = managementGroup?.subGroups.get(shippingCode) || []
  
  if (!newStatus || orders.length === 0) {
    ElMessage.warning('Vui lòng chọn trạng thái')
    return
  }
  
  updating.value = true
  try {
    // Update all orders in the shipping group
    for (const order of orders) {
      await store.updateOrderWithShipping(
        order.rowIndex,
        order.managementCode || '',
        order.shippingCode || '',
        newStatus,
        props.selectedDate,
        order.sheetType as 'customer' | 'ctv'
      )
    }
    
    ElMessage.success(`Đã cập nhật trạng thái cho ${orders.length} đơn hàng`)
    
    // Clear group status
    delete shippingGroupStatuses.value[key]
    
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

// UI Helper Methods for new structure
const getManagementColor = (managementGroup: ManagementGroup) => {
  const hasShippingCodes = Array.from(managementGroup.subGroups.keys()).some(key => key !== 'no-shipping')
  if (hasShippingCodes) return '#67c23a' // Green
  return '#e6a23c' // Orange
}

const getManagementTagType = (managementGroup: ManagementGroup) => {
  const hasShippingCodes = Array.from(managementGroup.subGroups.keys()).some(key => key !== 'no-shipping')
  if (hasShippingCodes) return 'success'
  return 'warning'
}

const hasPendingShippingOrders = (managementGroup: ManagementGroup) => {
  return managementGroup.subGroups.has('no-shipping') && 
         (managementGroup.subGroups.get('no-shipping')?.length || 0) > 0
}

const calculateManagementTotal = (managementGroup: ManagementGroup) => {
  return managementGroup.orders.reduce((total: number, order: ExtendedOrder) => {
    const amount = parseFloat(order.total?.toString().replace(/[^\d.]/g, '')) || 0
    return total + amount
  }, 0)
}

const getManagementSheetTypeTagType = (managementGroup: ManagementGroup) => {
  const sheetTypes = [...new Set(managementGroup.orders.map((order: ExtendedOrder) => order.sheetType))]
  if (sheetTypes.length > 1) return 'warning'
  return sheetTypes[0] === 'customer' ? 'primary' : 'success'
}

const getManagementSheetTypesText = (managementGroup: ManagementGroup) => {
  const sheetTypes = [...new Set(managementGroup.orders.map((order: ExtendedOrder) => order.sheetType))]
  if (sheetTypes.length > 1) return 'Hỗn hợp'
  return sheetTypes[0] === 'customer' ? 'Bán hàng' : 'CTV'
}

const getShippingGroupClass = (shippingCode: string) => {
  return {
    'has-shipping-code': shippingCode !== 'no-shipping',
    'no-shipping-code': shippingCode === 'no-shipping'
  }
}

const getShippingHeaderClass = (shippingCode: string) => {
  if (shippingCode !== 'no-shipping') return 'header-complete'
  return 'header-pending'
}

const getShippingStatusType = (orders: ExtendedOrder[]) => {
  const statuses = [...new Set(orders.map(order => order.status))]
  if (statuses.includes(ORDER_STATUSES.SALES.THANH_CONG)) return 'success'
  if (statuses.includes(ORDER_STATUSES.SALES.DANG_GIAO)) return 'warning'
  return 'primary'
}

const getShippingStatusText = (orders: ExtendedOrder[]) => {
  const statuses = [...new Set(orders.map(order => order.status))]
  if (statuses.length > 1) return 'Hỗn hợp'
  if (statuses.includes(ORDER_STATUSES.SALES.THANH_CONG)) return 'Hoàn thành'
  if (statuses.includes(ORDER_STATUSES.SALES.DANG_GIAO)) return 'Đang giao'
  return 'Chờ xử lý'
}

// Open Add Order Modal
const openAddOrderModal = async (managementCode: string | null, shippingCode: string) => {
  currentManagementCode.value = managementCode
  currentShippingCode.value = shippingCode
  addOrderModalVisible.value = true
  selectedAvailableOrders.value = []
  selectedCustomerFilter.value = [] // Reset customer filter
  
  await loadAvailableOrders()
}

// Load available orders (status = NHAN_DON)
const loadAvailableOrders = async () => {
  loadingAvailableOrders.value = true
  try {
    const tempOrders: ExtendedOrder[] = []
    
    // Fetch orders from selected sheets with NHAN_DON status
    for (const sheetType of selectedSheets.value) {
      await store.fetchOrders(props.selectedDate, sheetType as 'customer' | 'ctv')
      
      const ordersWithSheetType = store.orders
        .filter(order => order.status === ORDER_STATUSES.SALES.NHAN_DON)
        .map(order => ({
          ...order,
          sheetType,
          uniqueId: `${sheetType}-${order.rowIndex}`,
          managementCode: order.orderCode
        })) as ExtendedOrder[]
      
      tempOrders.push(...ordersWithSheetType)
    }
    
    availableOrders.value = tempOrders
    
  } catch (error) {
    console.error('Error loading available orders:', error)
    ElMessage.error('Lỗi khi tải danh sách đơn hàng')
  } finally {
    loadingAvailableOrders.value = false
  }
}

// Handle selection change in available orders table
const handleAvailableOrdersSelectionChange = (selection: ExtendedOrder[]) => {
  selectedAvailableOrders.value = selection
}

// Add selected orders to group
const handleAddOrders = async () => {
  if (selectedAvailableOrders.value.length === 0) {
    ElMessage.warning('Vui lòng chọn ít nhất một đơn hàng')
    return
  }
  
  updating.value = true
  try {
    const managementCode = currentManagementCode.value || ''
    const shippingCode = currentShippingCode.value !== 'no-shipping' ? currentShippingCode.value : ''
    
    // Update each selected order
    for (const order of selectedAvailableOrders.value) {
      await store.updateOrderWithShipping(
        order.rowIndex,
        managementCode,
        shippingCode,
        ORDER_STATUSES.SALES.DA_DAT_HANG,
        props.selectedDate,
        order.sheetType as 'customer' | 'ctv'
      )
    }
    
    ElMessage.success(`Đã thêm ${selectedAvailableOrders.value.length} đơn hàng vào nhóm`)
    
    // Close modal and refresh
    addOrderModalVisible.value = false
    await refreshData()
    emit('updated')
    
  } catch (error) {
    console.error('Error adding orders:', error)
    ElMessage.error('Có lỗi xảy ra khi thêm đơn hàng')
  } finally {
    updating.value = false
  }
}

// Remove order from group (clear management code and shipping code, set status to NHAN_DON)
const handleRemoveOrderFromGroup = async (order: ExtendedOrder) => {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa đơn hàng "${order.customerName}" khỏi nhóm này?`,
      'Xác nhận xóa',
      {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'warning',
      }
    )
    
    updating.value = true
    
    // Update order: clear management code, shipping code, and set status to NHAN_DON
    await store.updateOrderWithShipping(
      order.rowIndex,
      '', // Clear management code
      '', // Clear shipping code
      ORDER_STATUSES.SALES.NHAN_DON,
      props.selectedDate,
      order.sheetType as 'customer' | 'ctv'
    )
    
    ElMessage.success('Đã xóa đơn hàng khỏi nhóm')
    
    // Refresh data
    await refreshData()
    emit('updated')
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error removing order from group:', error)
      ElMessage.error('Có lỗi xảy ra khi xóa đơn hàng')
    }
  } finally {
    updating.value = false
  }
}



// Watch selected sheets changes
watch(selectedSheets, () => {
  refreshData()
}, { deep: true })

// Watch show delivered orders checkbox changes
watch(showDeliveredOrders, () => {
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
        
        .sheet-selector {
          margin-right: 16px;
          
          :deep(.el-checkbox-group) {
            display: flex;
            gap: 12px;
          }
        }
        
        .status-filter {
          margin-right: 16px;
          
          :deep(.el-checkbox) {
            font-weight: 500;
            color: #606266;
          }
        }
      }
    }
  }
  
  .content-container {
    .management-group {
      margin-bottom: 32px;
      border: 2px solid #e4e7ed;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      
      .management-header {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        padding: 24px;
        border-bottom: 2px solid var(--mgmt-color, #e4e7ed);
        position: relative;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, var(--mgmt-color, #e4e7ed) 0%, transparent 100%);
        }
        
        .management-info {
          .management-title {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            
            .mgmt-icon {
              font-size: 24px;
            }
            
            .mgmt-text {
              font-size: 20px;
              color: #1a202c;
              margin: 0;
              font-weight: 700;
            }
            
            .mgmt-badge {
              font-weight: 600;
              border-radius: 16px;
              padding: 4px 12px;
            }
            
            .pending-indicator {
              display: flex;
              align-items: center;
              gap: 4px;
              font-weight: 600;
              border-radius: 12px;
              animation: priorityPulse 2s infinite;
              
              .el-icon {
                font-size: 12px;
              }
            }
          }
          
          .management-stats {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            
            .stats-tag {
              display: flex;
              align-items: center;
              gap: 6px;
              border-radius: 10px;
              font-weight: 500;
              padding: 6px 12px;
              
              .el-icon {
                font-size: 14px;
              }
            }
          }
        }
      }
      
      .shipping-groups {
        .shipping-subgroup {
          border-bottom: 1px solid #f1f5f9;
          
          &:last-child {
            border-bottom: none;
          }
          
          &.has-shipping-code {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          }
          
          &.no-shipping-code {
            background: linear-gradient(135deg, #fef7e6 0%, #fdf2d9 100%);
            border-left: 4px solid #f59e0b;
            position: relative;
            
            &::before {
              content: '📋 Ưu tiên xử lý';
              position: absolute;
              top: 8px;
              right: 12px;
              background: rgba(245, 158, 11, 0.1);
              color: #f59e0b;
              font-size: 11px;
              font-weight: 600;
              padding: 2px 6px;
              border-radius: 4px;
              border: 1px solid rgba(245, 158, 11, 0.3);
            }
          }
          
          .shipping-header {
            padding: 20px 24px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            &.header-complete {
              background: rgba(103, 194, 58, 0.05);
            }
            
            &.header-pending {
              background: rgba(230, 162, 60, 0.05);
            }
            
            .shipping-info {
              flex: 1;
              
              .shipping-code {
                display: flex;
                align-items: center;
                gap: 8px;
                
                .ship-icon {
                  font-size: 18px;
                  color: #3b82f6;
                }
                
                .shipping-tag {
                  font-weight: 600;
                  font-size: 14px;
                  padding: 4px 12px;
                  border-radius: 8px;
                }
                
                .status-indicator {
                  font-weight: 500;
                  border-radius: 12px;
                }
              }
              
              .no-shipping {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
                
                .ship-icon {
                  font-size: 18px;
                }
                
                .no-shipping-text {
                  color: #64748b;
                  font-weight: 500;
                }
                
                .priority-tag {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  font-weight: 600;
                  animation: priorityPulse 2s infinite;
                  border-radius: 12px;
                  
                  .el-icon {
                    font-size: 12px;
                  }
                }
              }
            }
            
            .shipping-actions {
              display: flex;
              align-items: center;
              gap: 12px;
              background: rgba(255, 255, 255, 0.95);
              padding: 12px 16px;
              border-radius: 12px;
              border: 1px solid rgba(0, 0, 0, 0.08);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
          }
          
          :deep(.el-table) {
            border: none;
            
            .el-table__header {
              th {
                background: #fafbfc;
                border-bottom: 1px solid #e2e8f0;
                font-weight: 600;
                color: #475569;
              }
            }
            
            .el-table__body {
              tr:hover > td {
                background: rgba(59, 130, 246, 0.04) !important;
              }
            }
          }
        }
      }
    }
    
    .order-group {
      margin-bottom: 24px;
      border: 2px solid #e4e7ed;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      &.complete-group {
        border-color: #67c23a;
        box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
      }
      
      &.pending-group {
        border-color: #e6a23c;
        box-shadow: 0 4px 12px rgba(230, 162, 60, 0.2);
      }
      
      &.no-management-code {
        border-color: #909399;
        box-shadow: 0 2px 8px rgba(144, 147, 153, 0.15);
      }
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
      }
      
      .group-header {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 20px;
        border-bottom: 1px solid #e4e7ed;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        position: relative;
        
        &.header-complete {
          background: linear-gradient(135deg, #f0f9ff 0%, #e8f5e8 100%);
        }
        
        &.header-pending {
          background: linear-gradient(135deg, #fef7e6 0%, #fdf2d9 100%);
        }
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--group-color, #e4e7ed) 0%, transparent 100%);
        }
        
        .group-info {
          flex: 1;
          
          .management-code-section {
            margin-bottom: 12px;
            
            .management-code {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 8px;
              
              .mgmt-icon {
                font-size: 20px;
              }
              
              .mgmt-text {
                font-size: 18px;
                color: #303133;
                font-weight: 600;
              }
              
              .mgmt-badge {
                font-weight: 500;
                border-radius: 12px;
              }
            }
            
            .group-stats {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              
              .stats-tag {
                display: flex;
                align-items: center;
                gap: 4px;
                border-radius: 8px;
                font-weight: 500;
                
                .el-icon {
                  font-size: 12px;
                }
              }
            }
          }
          
          .shipping-code {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #606266;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 8px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            
            .ship-icon {
              color: #409eff;
              font-size: 16px;
            }
            
            .shipping-tag {
              font-weight: 600;
              border-radius: 6px;
            }
            
            .status-indicator {
              font-weight: 500;
              border-radius: 12px;
            }
          }
        }
        
        .group-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.9);
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

/* Add Order Modal Styles */
.add-order-modal {
  .modal-sticky-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: white;
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 2px solid #e4e7ed;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .modal-header-info {
    margin-bottom: 16px;
    
    .alert-content {
      display: flex;
      gap: 24px;
      font-size: 14px;
      
      > div {
        display: flex;
        gap: 8px;
      }
    }
  }
  
  .modal-filter-actions-row {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .modal-filter {
      flex: 1;
      
      .el-select {
        width: 100%;
      }
    }
    
    .modal-header-actions {
      flex-shrink: 0;
      
      .el-button {
        font-weight: 600;
        white-space: nowrap;
      }
    }
  }
  
  .modal-table-container {
    max-height: 60vh;
    overflow-y: auto;
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .add-order-modal {
    .modal-filter-actions-row {
      flex-direction: column;
      gap: 12px;
      
      .modal-filter {
        width: 100%;
      }
      
      .modal-header-actions {
        width: 100%;
        
        .el-button {
          width: 100%;
        }
      }
    }
  }
  
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
          
          .status-filter {
            margin-right: 0;
            margin-bottom: 12px;
          }
        }
      }
    }
    
    .content-container {
      .management-group {
        margin-bottom: 20px;
        
        .management-header {
          padding: 16px;
          
          .management-info {
            .management-title {
              flex-direction: column;
              align-items: flex-start;
              gap: 8px;
              
              .mgmt-text {
                font-size: 18px;
              }
            }
            
            .management-stats {
              flex-direction: column;
              align-items: flex-start;
              gap: 8px;
            }
          }
        }
        
        .shipping-groups {
          .shipping-subgroup {
            .shipping-header {
              flex-direction: column;
              gap: 16px;
              align-items: stretch;
              padding: 16px;
              
              .shipping-info {
                .shipping-code {
                  flex-wrap: wrap;
                  gap: 6px;
                }
                
                .no-shipping {
                  flex-wrap: wrap;
                  gap: 6px;
                }
              }
              
              .shipping-actions {
                flex-direction: column;
                gap: 8px;
                
                .el-input {
                  width: 100% !important;
                }
                
                .el-select {
                  width: 100% !important;
                }
              }
            }
          }
        }
      }
      
      .order-group {
        margin-bottom: 16px;
        
        .group-header {
          flex-direction: column;
          gap: 16px;
          align-items: stretch;
          padding: 16px;
          
          .group-info {
            .management-code-section {
              .management-code {
                .mgmt-text {
                  font-size: 16px;
                }
              }
              
              .group-stats {
                flex-direction: column;
                align-items: flex-start;
                gap: 6px;
              }
            }
            
            .shipping-code {
              flex-direction: column;
              align-items: flex-start;
              gap: 6px;
              padding: 12px;
            }
          }
          
          .group-actions {
            flex-direction: column;
            gap: 8px;
            
            .el-input {
              width: 100% !important;
            }
            
            .el-select {
              width: 100% !important;
            }
          }
        }
      }
    }
  }
}

/* Animations */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes priorityPulse {
  0% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: scale(1.05);
  }
  100% { 
    opacity: 1;
    transform: scale(1);
  }
}

.order-group {
  animation: slideIn 0.3s ease-out;
}

.mgmt-badge {
  animation: pulse 2s infinite;
}

/* Enhanced visual hierarchy */
.order-group.complete-group .mgmt-badge {
  background: linear-gradient(135deg, #67c23a, #85ce61) !important;
  color: white;
}

.order-group.pending-group .mgmt-badge {
  background: linear-gradient(135deg, #e6a23c, #f7ba2a) !important;  
  color: white;
}

.order-group.no-management-code .mgmt-badge {
  background: linear-gradient(135deg, #909399, #a6a9ad) !important;
  color: white;
}
</style>
