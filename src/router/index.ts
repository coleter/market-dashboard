import { createRouter, createWebHistory } from 'vue-router'
import CheckoutPage from '@/views/CheckoutPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: '/', name: 'checkout', component: CheckoutPage }],
})

export default router
