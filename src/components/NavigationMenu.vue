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
      <el-menu-item v-if="user?.role === 'admin'" index="order-viet-admin">
        <el-icon><Memo /></el-icon>
        <span>Quản lý Bill HV</span>
      </el-menu-item>
      <el-menu-item index="order-viet">
        <el-icon><Box /></el-icon>
        <span>Xử lý HV</span>
      </el-menu-item>
      
      <!-- User menu on the right -->
      <div class="user-menu">
        <el-dropdown @command="handleUserMenuSelect">
          <span class="user-info">
            <el-icon><User /></el-icon>
            <span>{{ user?.username || 'User' }}</span>
            <el-icon class="arrow-icon"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                Tài khoản ({{ user?.role }})
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon>
                Đăng xuất
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Management, Document, DocumentAdd, Van, TrendCharts, User, ArrowDown, SwitchButton, Memo, Box } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

interface Props {
  activeMenuItem: string
}

defineProps<Props>()
const router = useRouter()
const authStore = useAuthStore()

// Get user from auth store
const user = authStore.user

const handleMenuSelect = (index: string) => {
  if (index === 'bill') {
    router.push('/bill')
  } else if (index === 'order-codes') {
    router.push('/order-codes')
  } else if (index === 'order-china') {
    router.push('/order-china')
  } else if (index === 'revenue') {
    router.push('/revenue')
  } else if (index === 'order-viet-admin') {
    router.push('/order-viet-admin')
  } else if (index === 'order-viet') {
    router.push('/order-viet')
  } else if (index === 'orders') {
    router.push('/')
  }
}

const handleUserMenuSelect = (command: string) => {
  if (command === 'logout') {
    authStore.logout()
    ElMessage.success('Đăng xuất thành công')
    router.push('/login')
  } else if (command === 'profile') {
    ElMessage.info('Chức năng quản lý tài khoản đang phát triển')
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
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.user-menu {
  margin-left: auto;
  padding: 0 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #4b5563;
  font-weight: 500;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
}

.user-info:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.user-info:hover .arrow-icon {
  transform: rotate(180deg);
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
