import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true, layout: 'blank' },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/desk',
    children: [
      {
        path: 'desk',
        name: 'desk',
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: '工作台' },
      },
      {
        path: 'orders',
        name: 'orders',
        component: () => import('@/views/OrdersView.vue'),
        meta: { title: '订单管理' },
      },
      {
        path: 'dishes',
        name: 'dishes',
        component: () => import('@/views/DishesView.vue'),
        meta: { title: '菜品管理' },
      },
      {
        path: 'setmeals',
        name: 'setmeals',
        component: () => import('@/views/SetmealsView.vue'),
        meta: { title: '套餐管理' },
      },
      {
        path: 'categories',
        name: 'categories',
        component: () => import('@/views/CategoriesView.vue'),
        meta: { title: '分类管理' },
      },
      {
        path: 'employees',
        name: 'employees',
        component: () => import('@/views/EmployeesView.vue'),
        meta: { title: '员工管理' },
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('@/views/ReportsView.vue'),
        meta: { title: '数据报表' },
      },
      {
        path: 'shop',
        name: 'shop',
        component: () => import('@/views/ShopStatusView.vue'),
        meta: { title: '营业状态' },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/desk' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('df_merchant_token')
  if (!token && to.meta?.public !== true) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (token && to.path === '/login') {
    return { path: '/desk' }
  }
  return true
})

export default router