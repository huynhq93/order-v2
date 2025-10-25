import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/home',
      name: 'home-alt',
      component: HomeView,
    },
    {
      path: '/bill',
      name: 'bill',
      component: () => import('@/views/BillView.vue'),
    },
    {
      path: '/order-codes',
      name: 'order-codes',
      component: () => import('@/views/OrderCodeView.vue'),
    },
    {
      path: '/order-china',
      name: 'order-china',
      component: () => import('@/views/OrderChinaView.vue'),
    },
    {
      path: '/revenue',
      name: 'revenue',
      component: () => import('@/views/RevenueView.vue'),
    },
  ],
})

export default router 