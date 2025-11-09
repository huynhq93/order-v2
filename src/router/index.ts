import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/home',
      name: 'home-alt',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/bill',
      name: 'bill',
      component: () => import('@/views/BillView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/order-codes',
      name: 'order-codes',
      component: () => import('@/views/OrderCodeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/order-china',
      name: 'order-china',
      component: () => import('@/views/OrderChinaView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/revenue',
      name: 'revenue',
      component: () => import('@/views/RevenueView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true  },
    },
    {
      path: '/order-viet-admin',
      name: 'order-viet-admin',
      component: () => import('@/views/OrderVietAdminView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/order-viet',
      name: 'order-viet',
      component: () => import('@/views/OrderVietView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  const requiresAuth = to.meta.requiresAuth !== false
  
  if (requiresAuth) {
    // Check if user is authenticated
    const isAuthenticated = await authStore.checkAuth()

    if (!isAuthenticated) {
      // Redirect to login page
      next({ name: 'login' })
      return
    }

    // Check if route requires admin role
    if (to.meta.requiresAdmin) {
      const user = authStore.user
      if (!user || user.role !== 'admin') {
        // Redirect to home if not admin
        next({ name: 'home' })
        return
      }
    }
  }
  
  // If user is authenticated and trying to access login page, redirect to home
  if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }
  
  next()
})

export default router