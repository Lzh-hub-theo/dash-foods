<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useShopStore } from '@/stores/shop'

const shop = useShopStore()

onMounted(() => {
  if (!shop.merchantLoaded) shop.fetchMerchant()
})

const cols = [
  {
    title: '门店',
    items: ['关于 dash·foods', '主厨故事', '食材溯源', '媒体合作'],
  },
  {
    title: '点单',
    items: ['今日菜单', '套餐推荐', '膳食偏好', '礼品卡'],
  },
  {
    title: '帮助',
    items: ['配送范围', '退款政策', '联系我们', '加入我们'],
  },
]

/** 真实店铺电话（来自 getMerchantInfo）；拉不到时给占位 */
const hotline = computed(() => shop.phone || '400·823·1188')
const hotlineTel = computed(() => (shop.phone || '4008231188').replace(/[^\d+]/g, ''))
const statusLabel = computed(() =>
  shop.loaded && !shop.isOpen ? '当前休息中 · 暂不接单' : '营业时间 · 10:30 — 21:30',
)
</script>

<template>
  <footer class="app-footer" :class="{ 'is-closed': shop.loaded && !shop.isOpen }">
    <div class="container footer-grid">
      <div class="footer-brand">
        <p class="footer-eyebrow">FIELD&nbsp;·&nbsp;TO&nbsp;·&nbsp;TABLE</p>
        <h3 class="footer-headline">
          每份外卖<br />
          都是有<span class="hl">来源</span>的故事
        </h3>
        <p class="footer-desc">
          dash·foods 是一家专注轻食与现代家常菜的小餐厅。我们与本地农场合作，把当日新鲜食材变成一份可口的便当，30 分钟内送到你的桌上。
        </p>
        <div class="footer-meta">
          <span :class="{ 'is-warn': shop.loaded && !shop.isOpen }">
            {{ statusLabel }}
          </span>
          <span class="dot" />
          <span class="hotline">
            客服热线 ·
            <a :href="`tel:${hotlineTel}`" class="hotline-link">{{ hotline }}</a>
          </span>
        </div>
      </div>

      <div class="footer-cols">
        <div v-for="c in cols" :key="c.title" class="footer-col">
          <p class="col-title">{{ c.title }}</p>
          <ul class="col-items">
            <li v-for="i in c.items" :key="i">{{ i }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="footer-base">
      <div class="container footer-base-inner">
        <span>© {{ new Date().getFullYear() }} dash·foods · 餐桌之上</span>
        <span class="sep">·</span>
        <span>ICP&nbsp;备案 · 京 2024 · · · · · 号</span>
        <span class="sep">·</span>
        <span class="signoff">Made&nbsp;with&nbsp;☘&nbsp;in&nbsp;the&nbsp;field</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: 96px;
  background: var(--color-cream-soft);
  border-top: 1px solid var(--color-line-soft);
  position: relative;
  overflow: hidden;
}
.app-footer::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-leaf);
  opacity: 0.5;
  pointer-events: none;
}
.app-footer.is-closed::before {
  background: linear-gradient(180deg, rgba(71, 85, 105, 0.06), transparent 60%);
  opacity: 0.9;
}

.footer-grid {
  position: relative;
  padding: 80px 32px 56px;
  display: grid;
  grid-template-columns: 1.4fr 2fr;
  gap: 64px;
}

.footer-eyebrow {
  font-size: var(--fs-12);
  font-weight: 600;
  letter-spacing: 0.32em;
  color: var(--color-sage);
  margin-bottom: 24px;
}
.footer-headline {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 44px;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  margin-bottom: 22px;
}
.footer-headline .hl {
  font-style: italic;
  color: var(--color-sage-deep);
  position: relative;
}
.footer-headline .hl::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 6px;
  background: var(--color-butter);
  border-radius: 4px;
  z-index: -1;
  opacity: 0.85;
}
.footer-desc {
  max-width: 440px;
  font-size: var(--fs-15);
  line-height: 1.7;
  color: var(--color-ink-soft);
}
.footer-meta {
  margin-top: 28px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: var(--fs-13);
  color: var(--color-ink-mute);
  font-family: var(--font-display);
  font-style: italic;
  letter-spacing: 0.04em;
  flex-wrap: wrap;
}
.footer-meta .dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-ink-mute);
}
.footer-meta .is-warn {
  color: var(--color-tomato);
}
.hotline-link {
  font-style: normal;
  font-weight: 600;
  color: var(--color-sage-deep);
  text-decoration: none;
  letter-spacing: 0.06em;
  margin-left: 4px;
  border-bottom: 1px dashed currentColor;
  padding-bottom: 1px;
  transition: color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
}
.hotline-link:hover {
  color: var(--color-sage);
  border-bottom-color: var(--color-sage);
}

.footer-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}
.col-title {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-18);
  color: var(--color-ink);
  margin-bottom: 18px;
}
.col-items li {
  font-size: var(--fs-14);
  color: var(--color-ink-soft);
  padding: 6px 0;
  cursor: pointer;
  transition: color var(--dur-base) var(--ease-out);
}
.col-items li:hover {
  color: var(--color-sage-deep);
}

.footer-base {
  position: relative;
  border-top: 1px dashed var(--color-line);
  padding: 20px 0;
  font-size: var(--fs-12);
  color: var(--color-ink-mute);
  letter-spacing: 0.04em;
}
.footer-base-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.footer-base .sep {
  opacity: 0.4;
}
.footer-base .signoff {
  margin-left: auto;
  font-family: var(--font-display);
  font-style: italic;
}

@media (max-width: 960px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 56px 24px;
  }
  .footer-cols {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .footer-headline {
    font-size: 36px;
  }
}
</style>
