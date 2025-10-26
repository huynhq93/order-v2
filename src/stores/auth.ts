import { defineStore } from 'pinia'
import { ref } from 'vue'
import { verifyToken, removeAuthToken, getAuthToken } from '@/api/auth'

interface User {
  username: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)

  // Check if user is authenticated
  const checkAuth = async () => {
    const token = getAuthToken()

    if (!token) {
      isAuthenticated.value = false
      user.value = null
      return false
    }

    isLoading.value = true

    try {
      const response = await verifyToken()

      if (response.success && response.data?.user) {
        isAuthenticated.value = true
        user.value = response.data.user
        return true
      } else {
        isAuthenticated.value = false
        user.value = null
        removeAuthToken()
        return false
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      isAuthenticated.value = false
      user.value = null
      removeAuthToken()
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Logout user
  const logout = () => {
    isAuthenticated.value = false
    user.value = null
    removeAuthToken()
  }

  // Set user after successful login
  const setUser = (userData: User) => {
    user.value = userData
    isAuthenticated.value = true
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    checkAuth,
    logout,
    setUser,
  }
})
