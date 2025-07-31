import { createRouter, createWebHistory } from 'vue-router'
import CheckoutView from '../views/CheckoutView.vue'
import RecordsView from '../views/RecordsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'checkout', component: CheckoutView },
    { path: '/records', name: 'records', component: RecordsView },
  ],
})

export default router
