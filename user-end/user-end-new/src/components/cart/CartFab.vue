<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useShopStore } from '@/stores/shop'
import { useRouter } from 'vue-router'
import { ElMessage } from '@/api/notify'

const cart = useCartStore()
const shop = useShopStore()
const router = useRouter()

const visible = computed(() => cart.totalCount > 0)
/** 已确认打烊时禁用结算；未拉到状态时仍允许（兜底） */
const isShopClosed = computed(
  () => shop.loaded && !shop.isOpen,
)

function open() {
  if (isShopClosed.value) {
    ElMessage({ type: 'info', text: '店铺休息中，结算暂不可用' })
    return
  }
  cart.openDrawer()
}

function goCheckout(e: Event) {
  e.stopPropagation()
  if (isShopClosed.value) {
    ElMessage({ type: 'warning', text: '店铺休息中，暂不能下单' })
    return
  }
  router.push('/checkout')
}
</script>

<template>
  <Transition name="fab">
    <div v-if="visible" class="cart-fab" :class="{ 'is-closed': isShopClosed }" @click="open">
      <div class="fab-left">
        <span class="fab-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h2l2.6 11.2a2 2 0 0 0 1.94 1.55h8.92a2 2 0 0 0 1.96-1.6L22 8H6" />
            <circle cx="10" cy="20.5" r="1.2" />
            <circle cx="18" cy="20.5" r="1.2" />
          </svg>
        </span>
        <span class="fab-count">{{ cart.totalCount }} 件</span>
      </div>

      <div class="fab-divider" />

      <div class="fab-mid">
        <span class="fab-amount">
          <em>{{ isShopClosed ? '状态' : '合计' }}</em>
          <strong>{{ isShopClosed ? '店铺休息' : `¥${cart.totalAmount.toFixed(2)}` }}</strong>
        </span>
      </div>

      <button class="fab-cta" :disabled="isShopClosed" @click="goCheckout">
        {{ isShopClosed ? '暂不接单' : '去结算' }}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.cart-fab {
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  z-index: 40;
  display: inline-flex;
  align-items: center;
  gap: 18px;
  padding: 10px 10px 10px 22px;
  background: var(--color-ink);
  color: var(--color-paper);
  border-radius: var(--radius-pill);
  box-shadow: 0 24px 48px -16px rgba(10, 10, 10, 0.45);
  cursor: pointer;
  user-select: none;
  transition: transform var(--dur-base) var(--ease-out);
}
.cart-fab:hover {
  transform: translateX(-50%) translateY(-2px);
}
.cart-fab.is-closed {
  background: var(--color-line);
  cursor: not-allowed;
  box-shadow: 0 16px 32px -16px rgba(10, 10, 10, 0.18);
}
.cart-fab.is-closed:hover {
  transform: translateX(-50%);
}
.fab-left,
.fab-mid {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.fab-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}
.cart-fab.is-closed .fab-icon {
  background: rgba(10, 10, 10, 0.08);
}
.fab-count {
  font-size: var(--fs-14);
  font-weight: 600;
  letter-spacing: 0.04em;
}
.fab-divider {
  width: 1px;
  height: 22px;
  background: rgba(255, 255, 255, 0.16);
}
.cart-fab.is-closed .fab-divider {
  background: rgba(10, 10, 10, 0.12);
}
.fab-amount em {
  font-style: normal;
  font-size: var(--fs-12);
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.6);
  margin-right: 6px;
  text-transform: uppercase;
}
.cart-fab.is-closed .fab-amount em {
  color: rgba(10, 10, 10, 0.5);
}
.fab-amount strong {
  font-family: var(--font-display);
  font-size: var(--fs-18);
  font-weight: 500;
  letter-spacing: -0.01em;
}
.fab-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--color-apricot);
  color: var(--color-ink);
  border-radius: var(--radius-pill);
  font-size: var(--fs-14);
  font-weight: 700;
  letter-spacing: 0.04em;
  transition:
    background var(--dur-base) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}
.fab-cta:hover {
  background: var(--color-apricot-deep);
  color: var(--color-paper);
}
.fab-cta:active {
  transform: scale(0.96);
}
.fab-cta:disabled {
  background: rgba(10, 10, 10, 0.12);
  color: rgba(10, 10, 10, 0.5);
  cursor: not-allowed;
  box-shadow: none;
}
.fab-cta:disabled:hover {
  transform: none;
}

.fab-enter-active,
.fab-leave-active {
  transition:
    opacity var(--dur-base) var(--ease-out),
    transform var(--dur-slow) var(--ease-spring);
}
.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(40px);
}

@media (max-width: 640px) {
  .cart-fab {
    bottom: 16px;
    width: calc(100% - 24px);
    padding: 8px 8px 8px 16px;
    gap: 10px;
  }
  .fab-icon {
    width: 32px;
    height: 32px;
  }
  .fab-icon svg {
    width: 18px;
    height: 18px;
  }
  .fab-count {
    font-size: var(--fs-13);
  }
  .fab-amount strong {
    font-size: var(--fs-16);
  }
  .fab-cta {
    padding: 8px 14px;
    font-size: var(--fs-13);
  }
}
</style>
