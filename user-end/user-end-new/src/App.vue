<script setup lang="ts">
import { onMounted, watch } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import CartDrawer from '@/components/cart/CartDrawer.vue'
import CartFab from '@/components/cart/CartFab.vue'
import { useUserStore } from '@/stores/user'
import { useShopStore } from '@/stores/shop'
import { useCartStore } from '@/stores/cart'

const user = useUserStore()
const shop = useShopStore()
const cart = useCartStore()

function onLogout() {
  user.logout()
  cart.clean()
}

onMounted(() => {
  // 监听 401 自动登出
  window.addEventListener('dash:logout', onLogout as EventListener)
  // 启动后只拉取店铺状态与购物车（拉取需要登录态时由接口自动跳过）
  shop.fetchStatus()
  if (user.isLogin) {
    cart.fetch()
  }
})

watch(
  () => user.isLogin,
  (v) => {
    if (v) cart.fetch()
    else cart.items = []
  },
)
</script>

<template>
  <AppHeader />
  <main class="app-main">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </Transition>
    </RouterView>
  </main>
  <AppFooter />
  <CartFab />
  <CartDrawer />
</template>

<style scoped>
.app-main {
  flex: 1;
  width: 100%;
  position: relative;
}

.page-enter-active {
  transition:
    opacity 320ms var(--ease-out),
    transform 360ms var(--ease-out);
}
.page-leave-active {
  transition:
    opacity 160ms var(--ease-out),
    transform 200ms var(--ease-out);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>