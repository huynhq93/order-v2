<template>
  <div class="shipping-code-view">
    <!-- Navigation Menu -->
    <div class="navigation-menu">
      <el-menu mode="horizontal" :default-active="activeMenuItem" @select="handleMenuSelect">
        <el-menu-item index="orders">
          <el-icon><Management /></el-icon>
          <span>Quản lý đơn hàng</span>
        </el-menu-item>
        <el-menu-item index="order-codes">
          <el-icon><DocumentAdd /></el-icon>
          <span>Nhập mã vận đơn</span>
        </el-menu-item>
        <el-menu-item index="order-china">
          <el-icon><Van /></el-icon>
          <span>Quản lý nhập hàng</span>
        </el-menu-item>
        <el-menu-item index="bill">
          <el-icon><Document /></el-icon>
          <span>Tạo hóa đơn</span>
        </el-menu-item>
      </el-menu>
    </div>

    <MonthSelector
      v-model="selectedDate"
      @update:model-value="handleDateChange"
      class="mb-6"
    />
    
    <OrderChinaManager
      :selected-date="selectedDate"
      @updated="handleOrderUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Management, Document, DocumentAdd, Van } from '@element-plus/icons-vue'
import MonthSelector from '@/components/MonthSelector.vue'
import OrderChinaManager from '@/components/OrderChinaManager.vue'

const router = useRouter()

// Current date for initial selection
const currentDate = new Date()
const selectedDate = ref({
  month: currentDate.getMonth() + 1,
  year: currentDate.getFullYear()
})

const activeMenuItem = ref('order-china')

const handleDateChange = (newDate: { month: number; year: number }) => {
  selectedDate.value = newDate
}

const handleOrderUpdated = () => {
  // Handle any additional actions when orders are updated
  console.log('Order China updated successfully')
}

const handleMenuSelect = (index: string) => {
  activeMenuItem.value = index
  if (index === 'bill') {
    router.push('/bill')
  } else if (index === 'order-codes') {
    router.push('/order-codes')
  } else if (index === 'order-china') {
    router.push('/order-china')
  } else if (index === 'orders') {
    router.push('/')
  }
}
</script>

<style scoped>
.shipping-code-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.navigation-menu {
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

:deep(.el-menu--horizontal) {
  border-bottom: none;
}

:deep(.el-menu-item) {
  height: 60px;
  line-height: 60px;
  font-size: 14px;
  font-weight: 500;
}

:deep(.el-menu-item:hover) {
  background-color: #f0f9ff;
  color: #0ea5e9;
}

:deep(.el-menu-item.is-active) {
  background-color: #0ea5e9;
  color: white;
  border-bottom: none;
}

:deep(.el-menu-item .el-icon) {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .shipping-code-view {
    padding: 16px;
  }
  
  .navigation-menu {
    margin-bottom: 16px;
    border-radius: 6px;
  }
  
  :deep(.el-menu-item) {
    height: 50px;
    line-height: 50px;
    font-size: 12px;
    padding: 0 12px;
  }
  
  :deep(.el-menu-item span) {
    display: none;
  }
  
  :deep(.el-menu-item .el-icon) {
    margin-right: 0;
    font-size: 18px;
  }
}
</style>
