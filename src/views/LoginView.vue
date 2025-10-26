<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">Đăng nhập hệ thống</h1>
        <p class="login-subtitle">Quản lý đơn hàng GGS</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        @submit.prevent="handleLogin"
        class="login-form"
        label-position="top"
        size="large"
      >
        <el-form-item label="Tài khoản" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="Nhập tài khoản"
            @keyup.enter="handleLogin"
          >
            <template #prefix>👤</template>
          </el-input>
        </el-form-item>

        <el-form-item label="Mật khẩu" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="Nhập mật khẩu"
            show-password
            @keyup.enter="handleLogin"
          >
            <template #prefix>🔒</template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
            size="large"
          >
            ➤ Đăng nhập
          </el-button>
        </el-form-item>
      </el-form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import { login, initAccounts } from '@/api/auth'

const router = useRouter()
const loginFormRef = ref<InstanceType<typeof ElForm>>()

const loginForm = ref({
  username: '',
  password: '',
})

const loading = ref(false)

const loginRules = {
  username: [{ required: true, message: 'Vui lòng nhập tài khoản', trigger: 'blur' }],
  password: [{ required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' }],
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    loading.value = true

    const response = await login({
      username: loginForm.value.username,
      password: loginForm.value.password,
    })

    if (response.success) {
      ElMessage.success(response.message)
      // Redirect to home page
      router.push('/')
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    console.error('Login error:', error)
    ElMessage.error('Có lỗi xảy ra khi đăng nhập')
  } finally {
    loading.value = false
  }
}

// Initialize accounts on component mount
onMounted(async () => {
  try {
    const response = await initAccounts()
    if (response.success) {
      console.log('Accounts initialized:', response.data)
    }
  } catch (error) {
    console.error('Failed to initialize accounts:', error)
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.login-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
}

.login-form {
  margin-bottom: 24px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-button:hover .login-icon {
  transform: translateX(4px);
}

.login-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
  text-align: center;
}

.demo-accounts {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.demo-account {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 4px 0;
  padding: 4px 8px;
  background: #f9fafb;
  border-radius: 4px;
  font-family: monospace;
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px;
    margin: 20px;
  }

  .login-title {
    font-size: 1.75rem;
  }
}
</style>
