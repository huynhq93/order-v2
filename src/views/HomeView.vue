<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Navigation Menu -->
    <div class="navigation-menu">
      <el-menu mode="horizontal" :default-active="activeMenuItem" @select="handleMenuSelect">
        <el-menu-item index="orders">
          <el-icon><Management /></el-icon>
          <span>Quản lý đơn hàng</span>
        </el-menu-item>
        <el-menu-item index="bill">
          <el-icon><Document /></el-icon>
          <span>Tạo hóa đơn</span>
        </el-menu-item>
      </el-menu>
    </div>
    
    <!-- Hero Header -->
    <div class="hero-header">
      <h1 class="main-title">Quản lý đơn hàng</h1>
      <!-- <p class="subtitle">Hệ thống quản lý đơn hàng hiệu quả và tiện lợi</p> -->
    </div>
    
    <!-- Controls -->
    <div class="controls-section">
      <MonthSelector v-model="selectedDate" />
    </div>

    <OrdersTable
      :selected-date="selectedDate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Management, Document } from '@element-plus/icons-vue'
import OrdersTable from '@/components/OrdersTable.vue'
import MonthSelector from '@/components/MonthSelector.vue'

const router = useRouter()

const selectedDate = ref({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear()
})

const activeMenuItem = ref('orders')

const handleMenuSelect = (index: string) => {
  activeMenuItem.value = index
  if (index === 'bill') {
    router.push('/bill')
  } else if (index === 'orders') {
    router.push('/')
  }
}
</script>

<style scoped>
.navigation-menu {
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.navigation-menu :deep(.el-menu) {
  border: none;
}

.navigation-menu :deep(.el-menu-item) {
  padding: 0 20px;
  height: 60px;
  line-height: 60px;
}

.navigation-menu :deep(.el-menu-item:hover) {
  background-color: #ecf5ff;
}

.navigation-menu :deep(.el-menu-item.is-active) {
  background-color: #409eff;
  color: white;
}

.navigation-menu :deep(.el-menu-item.is-active .el-icon) {
  color: white;
}

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
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
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

.controls-section {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
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
  
  .controls-section {
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .hero-header {
    padding: 20px 12px;
  }
  
  .main-title {
    font-size: 1.75rem;
  }
  
  .subtitle {
    font-size: 0.9rem;
  }
}
</style> 