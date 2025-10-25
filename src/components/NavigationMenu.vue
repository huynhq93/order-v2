<template>
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
      <el-menu-item index="revenue">
        <el-icon><TrendCharts /></el-icon>
        <span>Thống kê</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Management, Document, DocumentAdd, Van, TrendCharts } from '@element-plus/icons-vue'

interface Props {
  activeMenuItem: string
}

defineProps<Props>()
const router = useRouter()

const handleMenuSelect = (index: string) => {
  if (index === 'bill') {
    router.push('/bill')
  } else if (index === 'order-codes') {
    router.push('/order-codes')
  } else if (index === 'order-china') {
    router.push('/order-china')
  } else if (index === 'revenue') {
    router.push('/revenue')
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
  background-color: #356393;
  color: white;
}

.navigation-menu :deep(.el-menu-item.is-active .el-icon) {
  color: white;
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
