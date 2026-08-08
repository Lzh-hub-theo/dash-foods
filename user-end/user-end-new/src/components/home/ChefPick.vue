<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useMenuStore } from '@/stores/menu'
import { useShopStore } from '@/stores/shop'
import { ElMessage } from '@/api/notify'

const props = defineProps<{
  name?: string
  subtitle?: string
  price?: number
  image?: string
  blurb?: string
}>()

const cart = useCartStore()
const menu = useMenuStore()
const shop = useShopStore()

const has = computed(() => Boolean(props.name))
const isShopClosed = computed(() => shop.loaded && !shop.isOpen)

function add(e: MouseEvent) {
  if (!props.name) return
  if (isShopClosed.value) {
    ElMessage({ type: 'warning', text: '店铺休息中，暂不能加购' })
    return
  }
  // 通过菜单 store 反查同名菜品
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  void rect
  const found = menu.allDishes.find((d) => d.name === props.name)
  if (found) {
    cart.add({ dishId: found.id, dishFlavor: '' })
  } else {
    // P12 补：找不到时给出提示
    ElMessage({ type: 'error', text: '暂未找到对应菜品，请稍后再试' })
  }
}
</script>

<template>
  <section v-if="has" id="signature" class="chef-pick">
    <div class="container cp-inner">
      <!-- 左：编辑感引用块 -->
      <div class="cp-quote">
        <p class="eyebrow">CHEF'S&nbsp;SIGNATURE&nbsp;·&nbsp;主厨今日推荐</p>
        <blockquote class="quote">
          "<span class="hl">{{ subtitle || 'Anna 的厨房' }}</span>，
          是把<em>季节</em>放进便当的练习。"
        </blockquote>
        <p class="byline">
          <span class="byline-mark">—</span> 主厨 Anna&nbsp;·&nbsp;dash·foods 主理人
        </p>
      </div>

      <!-- 右：主推菜品大卡 -->
      <article class="cp-card">
        <div class="cp-img">
          <img v-if="image" :src="image" :alt="name" @error="($event.target as HTMLImageElement).style.display='none'" />
          <div v-else class="cp-fallback">
            <svg viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="80" fill="#FAFAFB" stroke="#E5E7EB" />
              <path d="M70 80 C 80 60, 120 60, 130 80 C 120 70, 80 70, 70 80 Z" fill="#475569" />
              <circle cx="100" cy="120" r="22" fill="#475569" />
            </svg>
          </div>
          <span class="cp-pin">今日限定</span>
        </div>
        <div class="cp-body">
          <p class="cp-cat">{{ subtitle || 'Chef’s pick' }}</p>
          <h3 class="cp-name serif">{{ name }}</h3>
          <p class="cp-blurb">{{ blurb }}</p>
          <div class="cp-foot">
            <div class="cp-price">
              <span class="cur">¥</span>
              <span class="num">{{ Math.floor(price || 0) }}</span>
              <span class="frac">{{ Math.round(((price || 0) % 1) * 100).toString().padStart(2, '0') }}</span>
            </div>
            <button class="cp-add" :disabled="isShopClosed" @click="add">
              <span>{{ isShopClosed ? '店铺休息中' : '加入购物车' }}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.chef-pick {
  padding: 80px 0 40px;
  position: relative;
}
.chef-pick::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-leaf);
  opacity: 0.6;
  pointer-events: none;
}

.cp-inner {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}

.cp-quote {
  max-width: 480px;
}
.eyebrow {
  font-size: var(--fs-12);
  font-weight: 700;
  letter-spacing: 0.28em;
  color: var(--color-sage);
  margin-bottom: 24px;
}
.quote {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(32px, 3.6vw, 48px);
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}
.quote .hl {
  font-style: italic;
  color: var(--color-sage-deep);
}
.quote em {
  font-style: italic;
  color: var(--color-sage);
}
.byline {
  margin-top: 28px;
  font-family: var(--font-display);
  font-style: italic;
  color: var(--color-ink-mute);
  font-size: var(--fs-14);
  letter-spacing: 0.04em;
}
.byline-mark {
  display: inline-block;
  margin-right: 6px;
  color: var(--color-apricot);
}

.cp-card {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 28px;
  background: var(--color-paper);
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-card);
  position: relative;
}
.cp-img {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  aspect-ratio: 1;
  background: var(--color-cream-soft);
}
.cp-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cp-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cp-pin {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: var(--color-ink);
  color: var(--color-paper);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.cp-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 8px 0;
}
.cp-cat {
  font-size: var(--fs-12);
  font-weight: 700;
  letter-spacing: 0.28em;
  color: var(--color-apricot-deep);
  text-transform: uppercase;
}
.cp-name {
  font-size: var(--fs-32);
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}
.cp-blurb {
  font-size: var(--fs-14);
  line-height: 1.65;
  color: var(--color-ink-soft);
}
.cp-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}
.cp-price {
  font-family: var(--font-display);
  color: var(--color-apricot-deep);
  display: inline-flex;
  align-items: baseline;
}
.cp-price .cur {
  font-size: var(--fs-15);
  margin-right: 1px;
}
.cp-price .num {
  font-size: var(--fs-40);
  font-weight: 500;
  letter-spacing: -0.02em;
}
.cp-price .frac {
  font-size: var(--fs-15);
  font-style: italic;
}
.cp-add {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: var(--radius-pill);
  background: var(--color-ink);
  color: var(--color-paper);
  font-size: var(--fs-13);
  font-weight: 600;
  letter-spacing: 0.04em;
  transition:
    background var(--dur-base) var(--ease-out),
    transform var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out);
}
.cp-add:hover {
  background: var(--color-sage-deep);
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -8px rgba(51, 65, 85, 0.4);
}
.cp-add:disabled {
  background: var(--color-line);
  color: rgba(10, 10, 10, 0.5);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 960px) {
  .cp-inner {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .cp-card {
    grid-template-columns: 1fr;
  }
}
</style>