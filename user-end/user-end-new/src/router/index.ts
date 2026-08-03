import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '门店首页' },
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@/views/CheckoutView.vue'),
    meta: { title: '结算 / 下单' },
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('@/views/OrdersView.vue'),
    meta: { title: '我的订单' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { title: '注册' },
  },
  {
    path: '/address',
    name: 'address-book',
    component: () => import('@/views/AddressBookView.vue'),
    meta: { title: '我的地址' },
  },
  {
    path: '/address/form',
    name: 'address-form',
    component: () => import('@/views/AddressFormView.vue'),
    meta: { title: '编辑地址' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, saved) {
    return saved || { top: 0, behavior: 'smooth' }
  },
})

router.afterEach((to) => {
  const t = (to.meta?.title as string) || ''
  document.title = t ? `${t} · dash-foods` : 'dash-foods · 田野到餐桌'
})

export default router