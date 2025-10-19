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
  ],
})

export default router 