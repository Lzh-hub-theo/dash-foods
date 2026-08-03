<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BrandMark from './BrandMark.vue'
import StatusBadge from './StatusBadge.vue'
import { useUserStore } from '@/stores/user'
import { useShopStore } from '@/stores/shop'
import { useCartStore } from '@/stores/cart'
import { ElMessage } from '@/api/notify'

const user = useUserStore()
const shop = useShopStore()
const cart = useCartStore()
const route = useRoute()
const router = useRouter()

const today = ref('')
const menuOpen = ref(false)

function refreshDate() {
  const d = new Date()
  const wk = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  today.value = `${d.getFullYear()}·${m}·${day}  ${wk}`
}

onMounted(() => {
  refreshDate()
  if (!shop.loaded) shop.fetchStatus()

  // 监听全局退出事件：401 / 后端拒绝时清态 + 跳登录
  window.addEventListener('dash:logout', onForcedLogout)
})

const navItems = computed(() => [
  { to: '/', label: '门店首页' },
  { to: '/orders', label: '我的订单' },
  { to: '/address', label: '地址簿' },
])

const isLogin = computed(() => user.isLogin)

function goLogin() {
  router.push({ name: 'login', query: { redirect: route.fullPath } })
}

function onForcedLogout() {
  if (route.name === 'login') return
  ElMessage({ type: 'warning', text: '登录已失效，请重新登录' })
  router.replace({ name: 'login', query: { redirect: route.fullPath } })
}

async function handleLogout() {
  menuOpen.value = false
  await user.logout()
  ElMessage({ type: 'success', text: '已退出登录' })
  router.replace({ name: 'login' })
}
</script>

<template>
  <header class="app-header">
    <div class="container header-inner">
      <div class="header-left">
        <RouterLink to="/" class="brand-link" aria-label="dash-foods 首页">
          <BrandMark />
          <div class="brand-text">
            <span class="brand-title serif">dash·foods</span>
            <span class="brand-sub">FROM&nbsp;THE&nbsp;FIELD</span>
          </div>
        </RouterLink>
      </div>

      <nav class="header-nav" aria-label="主导航">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          active-class="is-active"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="header-right">
        <span class="header-date">{{ today }}</span>
        <StatusBadge :status="shop.status" />
        <button
          v-if="!isLogin"
          class="login-btn"
          @click="goLogin"
        >
          登&nbsp;录
        </button>
        <div v-else class="user-menu" @mouseleave="menuOpen = false">
          <button
            class="user-chip"
            :title="user.displayName"
            @click="menuOpen = !menuOpen"
          >
            <span class="user-avatar">{{ user.displayName.slice(0, 1) }}</span>
            <span class="user-name">{{ user.displayName }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <Transition name="user-menu">
            <div v-if="menuOpen" class="user-dropdown">
              <p class="ud-name">{{ user.displayName }}</p>
              <p v-if="user.username" class="ud-meta">账号 · {{ user.username }}</p>
              <button class="ud-action" @click="handleLogout">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>
                退出登录
              </button>
            </div>
          </Transition>
        </div>
        <button class="cart-btn" aria-label="购物车" @click="cart.openDrawer()">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h2l2.6 11.2a2 2 0 0 0 1.94 1.55h8.92a2 2 0 0 0 1.96-1.6L22 8H6" />
            <circle cx="10" cy="20.5" r="1.2" />
            <circle cx="18" cy="20.5" r="1.2" />
          </svg>
          <Transition name="count">
            <span v-if="cart.totalCount" class="cart-count">{{ cart.totalCount }}</span>
          </Transition>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 254, 250, 0.85);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid var(--color-line-soft);
}

.header-inner {
  height: var(--header-h);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 32px;
}

/* —— 左：品牌 —— */
.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--color-ink);
}
.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}
.brand-title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 22px;
  letter-spacing: -0.01em;
  color: var(--color-ink);
}
.brand-sub {
  margin-top: 4px;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.32em;
  color: var(--color-sage);
}

/* —— 中：导航 —— */
.header-nav {
  display: flex;
  justify-content: center;
  gap: 36px;
}
.nav-link {
  position: relative;
  font-size: var(--fs-15);
  font-weight: 500;
  color: var(--color-ink-soft);
  padding: 6px 0;
  transition: color var(--dur-base) var(--ease-out);
}
.nav-link::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -4px;
  height: 2px;
  width: 0;
  background: var(--color-sage);
  border-radius: 2px;
  transform: translateX(-50%);
  transition: width var(--dur-base) var(--ease-out);
}
.nav-link:hover {
  color: var(--color-ink);
}
.nav-link.is-active {
  color: var(--color-sage-deep);
}
.nav-link.is-active::after {
  width: 24px;
}

/* —— 右：日期 + 状态 + 用户 + 购物车 —— */
.header-right {
  display: inline-flex;
  align-items: center;
  gap: 14px;
}
.header-date {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-13);
  color: var(--color-ink-mute);
  letter-spacing: 0.04em;
  padding-right: 6px;
  border-right: 1px dashed var(--color-line);
  padding-right: 14px;
}

.login-btn {
  padding: 8px 18px;
  border-radius: var(--radius-pill);
  background: var(--color-ink);
  color: var(--color-paper);
  font-size: var(--fs-13);
  font-weight: 600;
  letter-spacing: 0.06em;
  transition:
    background var(--dur-base) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}
.login-btn:hover {
  background: var(--color-sage-deep);
}
.login-btn:active {
  transform: translateY(1px);
}

.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  cursor: pointer;
  color: var(--color-ink-soft);
  transition: border-color var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out);
}
.user-chip:hover {
  border-color: var(--color-sage-soft);
  background: var(--color-cream-soft);
}
.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-sage);
  color: var(--color-paper);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
}
.user-name {
  font-size: var(--fs-13);
  color: var(--color-ink);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu {
  position: relative;
}
.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 220px;
  padding: 14px 16px;
  background: var(--color-paper);
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  z-index: 60;
}
.ud-name {
  font-family: var(--font-display);
  font-size: var(--fs-15);
  color: var(--color-ink);
  font-weight: 500;
}
.ud-meta {
  margin-top: 2px;
  font-size: var(--fs-12);
  color: var(--color-ink-mute);
}
.ud-action {
  margin-top: 14px;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 38px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-line);
  background: var(--color-paper);
  color: var(--color-ink);
  font-size: var(--fs-13);
  font-weight: 500;
  letter-spacing: 0.04em;
  transition:
    background var(--dur-base) var(--ease-out),
    color var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out);
}
.ud-action:hover {
  background: var(--color-tomato);
  border-color: var(--color-tomato);
  color: var(--color-paper);
}
.user-menu-enter-active,
.user-menu-leave-active {
  transition: opacity var(--dur-fast) ease, transform var(--dur-fast) var(--ease-out);
}
.user-menu-enter-from,
.user-menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.cart-btn {
  position: relative;
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--color-line);
  background: var(--color-paper);
  color: var(--color-ink);
  transition:
    background var(--dur-base) var(--ease-out),
    color var(--dur-base) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}
.cart-btn:hover {
  background: var(--color-sage);
  color: var(--color-paper);
  border-color: var(--color-sage);
}
.cart-btn:active {
  transform: scale(0.94);
}
.cart-count {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: var(--radius-pill);
  background: var(--color-apricot);
  color: var(--color-ink);
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px var(--color-cream);
}
.count-enter-active,
.count-leave-active {
  transition:
    transform var(--dur-base) var(--ease-spring),
    opacity var(--dur-fast) ease;
}
.count-enter-from,
.count-leave-to {
  transform: scale(0);
  opacity: 0;
}

@media (max-width: 1100px) {
  .header-date {
    display: none;
  }
  .header-nav {
    gap: 24px;
  }
}
@media (max-width: 860px) {
  .header-nav {
    gap: 16px;
  }
  .nav-link {
    font-size: var(--fs-13);
  }
  .user-name {
    display: none;
  }
  .user-chip {
    padding: 4px;
  }
}
@media (max-width: 640px) {
  .header-inner {
    gap: 16px;
  }
  .brand-text {
    display: none;
  }
  .nav-link {
    font-size: var(--fs-12);
  }
}
</style>