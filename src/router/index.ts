import { createRouter, createWebHistory } from 'vue-router'
// import CheckoutView from '../views/CheckoutView.vue'
// import RecordsView from '../views/RecordsView.vue'
import CheckoutPage from '@/views/CheckoutPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'checkout', component: CheckoutPage },
    //{ path: '/records', name: 'records', component: RecordsView },
  ],
})

export default router
