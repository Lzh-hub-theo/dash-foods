<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { ElMessage } from '@/api/notify'
import CartItemRow from './CartItemRow.vue'

const cart = useCartStore()
const router = useRouter()

function close() {
  cart.closeDrawer()
}

function clearAll() {
  cart.clean()
  ElMessage({ type: 'success', text: '购物车已清空' })
}

function checkout() {
  if (cart.isEmpty) {
    ElMessage({ type: 'info', text: '购物车空空如也，先挑点菜吧' })
    return
  }
  cart.closeDrawer()
  router.push('/checkout')
}
</script>

<template>
  <Transition name="mask">
    <div v-if="cart.drawerOpen" class="cart-mask" @click="close" />
  </Transition>
  <Transition name="drawer">
    <aside v-if="cart.drawerOpen" class="cart-drawer" role="dialog" aria-label="购物车">
      <header class="drawer-head">
        <div class="head-main">
          <p class="eyebrow">YOUR&nbsp;CART</p>
          <h2 class="title serif">
            购物车
            <span v-if="cart.totalCount" class="count">{{ cart.totalCount }}</span>
          </h2>
        </div>
        <button class="close-btn" aria-label="关闭" @click="close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
      </header>

      <div class="drawer-meta">
        <span class="meta-item">
          <em>件数</em>
          <strong>{{ cart.totalCount }}</strong>
        </span>
        <span class="meta-divider" />
        <span class="meta-item">
          <em>小计</em>
          <strong class="amount">¥{{ cart.totalAmount.toFixed(2) }}</strong>
        </span>
      </div>

      <div class="drawer-body">
        <template v-if="cart.items.length">
          <TransitionGroup name="cart-list" tag="div" class="cart-list">
            <CartItemRow
              v-for="item in cart.items"
              :key="item.id"
              :item="item"
              @add="cart.add({ dishId: item.dishId, setmealId: item.setmealId, dishFlavor: item.dishFlavor })"
              @sub="cart.sub({ dishId: item.dishId, setmealId: item.setmealId, dishFlavor: item.dishFlavor })"
            />
          </TransitionGroup>
        </template>
        <div v-else class="empty">
          <div class="empty-illus">
            <svg viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="50" stroke="#E5E7EB" stroke-width="1.5" stroke-dasharray="3 4" />
              <path d="M40 50 L 40 80 a 4 4 0 0 0 4 4 h 32 a 4 4 0 0 0 4 -4 L 80 50" stroke="#9CA3AF" stroke-width="2" fill="none" />
              <path d="M35 50 L 85 50" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" />
              <path d="M55 50 L 55 38 a 5 5 0 0 1 10 0 L 65 50" stroke="#9CA3AF" stroke-width="2" fill="none" />
            </svg>
          </div>
          <p class="empty-title">空空如也</p>
          <p class="empty-sub">挑几道喜欢的菜，开启今日田野之旅。</p>
        </div>
      </div>

      <footer v-if="cart.items.length" class="drawer-foot">
        <button class="clear-btn" @click="clearAll">清空购物车</button>
        <button class="checkout-btn" @click="checkout">
          <span class="cb-amount">
            <em>合计</em>
            <strong>¥{{ cart.totalAmount.toFixed(2) }}</strong>
          </span>
          <span class="cb-label">
            去结算
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
          </span>
        </button>
      </footer>
    </aside>
  </Transition>
</template>

<style scoped>
.cart-mask {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 10, 0.32);
  backdrop-filter: blur(2px);
  z-index: 60;
}
.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 440px;
  max-width: 92vw;
  background: var(--color-cream);
  z-index: 61;
  display: flex;
  flex-direction: column;
  box-shadow: -32px 0 64px -16px rgba(10, 10, 10, 0.25);
  border-left: 1px solid var(--color-line);
}

.drawer-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 28px 28px 16px;
  border-bottom: 1px solid var(--color-line-soft);
}
.head-main .eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.32em;
  color: var(--color-sage);
  margin-bottom: 8px;
}
.title {
  font-family: var(--font-display);
  font-size: var(--fs-32);
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  display: inline-flex;
  align-items: baseline;
  gap: 12px;
}
.title .count {
  font-family: var(--font-body);
  font-size: var(--fs-13);
  font-weight: 600;
  padding: 4px 10px;
  background: var(--color-sage-mist);
  color: var(--color-sage-deep);
  border-radius: var(--radius-pill);
}
.close-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  color: var(--color-ink);
  transition: all var(--dur-base) var(--ease-out);
}
.close-btn:hover {
  background: var(--color-ink);
  color: var(--color-paper);
  border-color: var(--color-ink);
}

.drawer-meta {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 28px;
  font-family: var(--font-display);
  font-size: var(--fs-13);
  color: var(--color-ink-mute);
  border-bottom: 1px dashed var(--color-line);
}
.meta-item {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}
.meta-item em {
  font-style: italic;
}
.meta-item strong {
  font-weight: 600;
  color: var(--color-ink);
}
.meta-item .amount {
  color: var(--color-apricot-deep);
  font-size: var(--fs-18);
}
.meta-divider {
  width: 1px;
  height: 14px;
  background: var(--color-line);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 28px 24px;
}
.cart-list {
  display: flex;
  flex-direction: column;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  text-align: center;
  gap: 12px;
}
.empty-illus {
  width: 120px;
  height: 120px;
}
.empty-title {
  font-family: var(--font-display);
  font-size: var(--fs-20);
  color: var(--color-ink);
}
.empty-sub {
  font-size: var(--fs-13);
  color: var(--color-ink-mute);
  max-width: 240px;
}

.drawer-foot {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 28px 28px;
  border-top: 1px solid var(--color-line-soft);
  background: var(--color-paper);
}
.clear-btn {
  font-size: var(--fs-13);
  color: var(--color-ink-mute);
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-line);
  background: var(--color-paper);
  transition: all var(--dur-base) var(--ease-out);
}
.clear-btn:hover {
  color: var(--color-tomato);
  border-color: var(--color-tomato);
}
.checkout-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: var(--color-ink);
  color: var(--color-paper);
  border-radius: var(--radius-pill);
  transition: background var(--dur-base) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}
.checkout-btn:hover {
  background: var(--color-sage-deep);
}
.checkout-btn:active {
  transform: scale(0.98);
}
.cb-amount em {
  font-style: normal;
  font-size: 11px;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.7);
  margin-right: 6px;
  text-transform: uppercase;
}
.cb-amount strong {
  font-family: var(--font-display);
  font-size: var(--fs-20);
  font-weight: 500;
}
.cb-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fs-14);
  font-weight: 600;
  letter-spacing: 0.04em;
}

/* —— 动效 —— */
.mask-enter-active,
.mask-leave-active {
  transition: opacity var(--dur-base) var(--ease-out);
}
.mask-enter-from,
.mask-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform var(--dur-slow) var(--ease-out);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

.cart-list-enter-active,
.cart-list-leave-active {
  transition:
    opacity var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-out);
}
.cart-list-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.cart-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.cart-list-move {
  transition: transform var(--dur-base) var(--ease-out);
}

@media (max-width: 640px) {
  .cart-drawer {
    width: 100vw;
    border-left: none;
  }
  .drawer-head,
  .drawer-meta,
  .drawer-body,
  .drawer-foot {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>