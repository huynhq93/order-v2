<template>
  <el-config-provider>
    <div v-if="authStore.isLoading" class="loading-screen">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>Đang kiểm tra đăng nhập...</p>
      </div>
    </div>
    <router-view v-else />
  </el-config-provider>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Check authentication on app mount
onMounted(async () => {
  await authStore.checkAuth()
})
</script>

<style>
@import './assets/main.css';

.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-content p {
  margin: 0;
  font-size: 1.125rem;
  opacity: 0.9;
}
</style> 