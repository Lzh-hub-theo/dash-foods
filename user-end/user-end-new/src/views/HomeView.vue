<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed, ref } from 'vue'
import HeroSection from '@/components/home/HeroSection.vue'
import MarqueeBar from '@/components/home/MarqueeBar.vue'
import CategoryRail from '@/components/home/CategoryRail.vue'
import DishGrid from '@/components/home/DishGrid.vue'
import ChefPick from '@/components/home/ChefPick.vue'
import FlavorSheet from '@/components/home/FlavorSheet.vue'
import { useMenuStore } from '@/stores/menu'
import { useCartStore } from '@/stores/cart'
import { useShopStore } from '@/stores/shop'
import { useFlavorStore } from '@/stores/flavor'
import { ElMessage } from '@/api/notify'
import type { DishVO } from '@/types/api'

const menu = useMenuStore()
const cart = useCartStore()
const shop = useShopStore()
const flavor = useFlavorStore()

onMounted(() => {
  menu.fetchAll()
  if (!shop.loaded) shop.fetchStatus()
  shop.fetchMerchant()
  if (cart.items.length === 0) cart.fetch()
})

// 缓存时间 ticker：每 30s 触发一次重新计算
const tick = ref(0)
let ticker: number | null = null
onMounted(() => {
  ticker = window.setInterval(() => (tick.value += 1), 30_000)
})
onBeforeUnmount(() => {
  if (ticker) window.clearInterval(ticker)
})

const cacheAgoMin = computed(() => {
  void tick.value
  if (!menu.cachedAt) return null
  const diff = Math.max(0, Date.now() - menu.cachedAt)
  const min = Math.floor(diff / 60_000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  return `${Math.floor(min / 60)} 小时前`
})

/** 仅在有缓存且已超过 TTL 时算"陈旧"，初次加载保持中性 */
const isCacheStale = computed(() => Boolean(menu.cachedAt) && !menu.isCacheFresh)

/** 已确认打烊时显示横幅 */
const isShopClosed = computed(() => shop.loaded && !shop.isOpen)

const isRefreshing = ref(false)
async function refreshMenu(force = true) {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await menu.fetchAll(force)
    ElMessage({ type: 'success', text: '菜单已更新' })
  } catch {
    ElMessage({ type: 'error', text: '菜单刷新失败，请稍后再试' })
  } finally {
    isRefreshing.value = false
  }
}

const cartItems = computed(() =>
  cart.items.map((it) => ({
    dishId: it.dishId,
    setmealId: it.setmealId,
    number: it.number,
  })),
)

function onAddDish(payload: { dishId: number; dishFlavor?: string }, rect: DOMRect) {
  void rect
  if (isShopClosed.value) {
    ElMessage({ type: 'warning', text: '店铺休息中，暂不能加购' })
    return
  }
  cart.add(payload)
}

function onSubDish(payload: { dishId: number; dishFlavor?: string }) {
  cart.sub(payload)
}

function onAddSetmeal(payload: { setmealId: number }, rect: DOMRect) {
  void rect
  if (isShopClosed.value) {
    ElMessage({ type: 'warning', text: '店铺休息中，暂不能加购' })
    return
  }
  cart.add(payload)
}

function onOpenFlavor(dish: DishVO, rect: DOMRect) {
  void rect
  if (isShopClosed.value) {
    ElMessage({ type: 'warning', text: '店铺休息中，暂不能加购' })
    return
  }
  flavor.show(dish)
}

function changeCategory(id: number) {
  menu.setActive(id)
}
</script>

<template>
  <div class="home">
    <HeroSection />
    <MarqueeBar />

    <Transition name="banner">
      <aside v-if="isShopClosed" class="shop-closed-banner" role="status">
        <span class="ico" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><path d="M12 17h.01"/></svg>
        </span>
        <span class="msg">店铺当前休息中，暂不接单。可先看看菜单，等我们开张第一时间回来。</span>
      </aside>
    </Transition>

    <section id="menu" class="menu-section">
      <div class="container">
        <header class="menu-head">
          <div class="head-text">
            <p class="eyebrow">TODAY'S MENU</p>
            <h2 class="head-title serif">今日菜单</h2>
            <p class="head-sub">当季食材 · 手工现做 · 每日 11:00 上新</p>
          </div>
          <div class="head-meta">
            <span v-if="cacheAgoMin" class="cache-time">
              <span class="dot" :class="{ 'is-stale': isCacheStale }"></span>
              缓存于 {{ cacheAgoMin }}
            </span>
            <button
              class="refresh-btn"
              :class="{ 'is-loading': isRefreshing }"
              :disabled="isRefreshing"
              aria-label="刷新菜单"
              @click="refreshMenu(true)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a9 9 0 1 1-3-6.7" />
                <path d="M21 3v6h-6" />
              </svg>
              <span>{{ isRefreshing ? '刷新中…' : '刷新菜单' }}</span>
            </button>
          </div>
        </header>
        <div class="menu-inner">
          <CategoryRail
            :categories="menu.categories"
            :active-id="menu.activeCategoryId"
            @change="changeCategory"
          />
          <DishGrid
            :categories="menu.categories"
            :cart-items="cartItems"
            @add-dish="onAddDish"
            @sub-dish="onSubDish"
            @add-setmeal="onAddSetmeal"
            @open-flavor="onOpenFlavor"
          />
        </div>
      </div>
    </section>

    <ChefPick
      :name="menu.signature?.name"
      :subtitle="menu.signature?.subtitle"
      :price="menu.signature?.price"
      :image="menu.signature?.image"
      :blurb="menu.signature?.blurb"
    />

    <FlavorSheet />
  </div>
</template>

<style scoped>
.home {
  padding-bottom: 0;
}

.menu-section {
  padding: 56px 0 80px;
}
.menu-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 36px;
  padding-bottom: 24px;
  border-bottom: 1px dashed var(--color-line);
}
.head-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.32em;
  color: var(--color-sage);
}
.head-title {
  font-size: var(--fs-40);
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}
.head-sub {
  font-size: var(--fs-13);
  color: var(--color-ink-mute);
  letter-spacing: 0.02em;
}
.head-meta {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}
.cache-time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-12);
  color: var(--color-ink-mute);
  letter-spacing: 0.02em;
}
.cache-time .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-sage);
  display: inline-block;
}
.cache-time .dot.is-stale {
  background: var(--color-apricot-deep);
  box-shadow: 0 0 0 3px rgba(242, 166, 90, 0.18);
}
.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: var(--radius-pill);
  background: var(--color-paper);
  border: 1.5px solid var(--color-line);
  color: var(--color-ink);
  font-size: var(--fs-12);
  font-weight: 500;
  letter-spacing: 0.04em;
  transition: all var(--dur-base) var(--ease-out);
}
.refresh-btn:hover {
  border-color: var(--color-sage);
  color: var(--color-sage-deep);
  background: var(--color-cream-soft);
}
.refresh-btn:disabled {
  cursor: wait;
  opacity: 0.7;
}
.refresh-btn.is-loading svg {
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* —— 店铺打烊横幅 —— */
.shop-closed-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 28px auto 0;
  width: min(960px, calc(100% - 32px));
  padding: 14px 20px;
  background: rgba(217, 83, 79, 0.06);
  border: 1px dashed rgba(217, 83, 79, 0.32);
  color: var(--color-tomato);
  border-radius: var(--radius-md);
  font-size: var(--fs-13);
  font-family: var(--font-display);
  letter-spacing: 0.02em;
}
.shop-closed-banner .ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(217, 83, 79, 0.12);
  flex-shrink: 0;
}
.shop-closed-banner .msg {
  line-height: 1.55;
}

.banner-enter-active,
.banner-leave-active {
  transition:
    opacity var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-out),
    max-height var(--dur-base) var(--ease-out);
  overflow: hidden;
}
.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(-6px);
  max-height: 0;
}
.banner-enter-to,
.banner-leave-from {
  opacity: 1;
  max-height: 80px;
}

.menu-inner {
  display: flex;
  gap: 56px;
  align-items: flex-start;
}

@media (max-width: 960px) {
  .menu-head {
    flex-direction: column;
    align-items: flex-start;
  }
  .head-title {
    font-size: var(--fs-32);
  }
  .menu-inner {
    flex-direction: column;
    gap: 32px;
  }
}
</style>