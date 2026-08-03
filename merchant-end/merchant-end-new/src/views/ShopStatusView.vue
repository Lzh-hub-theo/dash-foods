<script setup lang="ts">
// 营业状态 / SHOP STATUS
import { onMounted, computed } from 'vue'
import { useShopStore } from '@/stores/shop'
import { ElMessage } from '@/api/notify'

const shop = useShopStore()

const headline = computed(() => (shop.isOpen ? 'THE SHOP IS OPEN.' : 'THE SHOP IS CLOSED.'))
const lede = computed(() =>
  shop.isOpen
    ? '新订单正在涌入。员工可正常接单、菜品可下单。'
    : '门店当前不接单。新订单将被系统暂存，待开张后统一处理。',
)

async function toggle() {
  try {
    await shop.toggle()
    ElMessage.success(shop.isOpen ? '已开张，欢迎光临' : '已打烊，晚安')
  } catch { /* 已 toast */ }
}

onMounted(() => shop.fetchStatus())
</script>

<template>
  <section class="shop">
    <div class="shop__cover" :data-on="shop.isOpen ? '1' : '0'">
      <div class="dateline shop__eyebrow">§ SHOP STATUS · 营业状态</div>
      <h1 class="shop__title headline">{{ headline }}</h1>
      <p class="shop__lede">{{ lede }}</p>

      <div class="shop__actions">
        <button
          class="shop__btn"
          :class="{ 'shop__btn--on': shop.isOpen }"
          @click="toggle"
        >
          <span class="shop__btn-l font-mono">{{ shop.isOpen ? 'CLOSED NOW' : 'OPEN NOW' }}</span>
          <span class="shop__btn-arrow">→</span>
        </button>
      </div>

      <div class="shop__indicators">
        <div class="ind">
          <div class="dateline">FRONT</div>
          <div class="ind__big tnum headline">{{ shop.isOpen ? 'ON' : 'OFF' }}</div>
        </div>
        <div class="ind">
          <div class="dateline">KITCHEN</div>
          <div class="ind__big tnum headline">{{ shop.isOpen ? 'ON' : 'OFF' }}</div>
        </div>
        <div class="ind">
          <div class="dateline">DELIVERY</div>
          <div class="ind__big tnum headline">{{ shop.isOpen ? 'ON' : 'OFF' }}</div>
        </div>
        <div class="ind ind--accent">
          <div class="dateline">ALL CHANNELS</div>
          <div class="ind__big tnum headline">{{ shop.isOpen ? 'ON' : 'OFF' }}</div>
        </div>
      </div>
    </div>

    <hr class="rule-thick" />

    <article class="shop__note">
      <div class="dateline">EDITOR'S NOTE · 告示</div>
      <p>
        营业状态的变更会即时同步至客户端与小程序。打烊期间，用户仍可浏览菜单但无法下单。
        若频繁切换，请确认后厨与配送资源已就位。
      </p>
    </article>
  </section>
</template>

<style scoped>
.shop { display: flex; flex-direction: column; gap: 24px; }
.shop__cover {
  position: relative;
  padding: 56px 56px 64px;
  border: 2px solid var(--ink);
  background: var(--paper-deep);
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}
.shop__cover[data-on='1'] {
  background:
    linear-gradient(180deg, transparent 0%, var(--olive-soft) 100%),
    var(--paper-deep);
}
.shop__cover[data-on='0'] {
  background:
    linear-gradient(180deg, transparent 0%, var(--signal-soft) 100%),
    var(--paper-deep);
}
.shop__cover::before {
  content: '';
  position: absolute;
  inset: -2px;
  border: 2px solid var(--ink);
  pointer-events: none;
  transform: translate(10px, 10px);
  z-index: -1;
}
.shop__eyebrow { color: var(--ink-muted); }
.shop__title {
  font-size: clamp(64px, 9vw, 128px);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 0.88;
}
.shop__lede {
  font-family: var(--font-display);
  font-size: 18px;
  line-height: 1.55;
  max-width: 60ch;
  color: var(--ink);
}

.shop__actions { margin-top: 12px; }
.shop__btn {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 18px 28px;
  background: var(--paper);
  border: 2px solid var(--ink);
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 28px;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: transform .15s var(--ease), background .15s var(--ease), color .15s var(--ease);
}
.shop__btn:hover { transform: translate(-2px, -2px); box-shadow: 4px 4px 0 var(--ink); }
.shop__btn:active { transform: translate(0, 0); box-shadow: none; }
.shop__btn--on { background: var(--ink); color: var(--paper); }
.shop__btn--on:hover { box-shadow: 4px 4px 0 var(--signal); }
.shop__btn-l { font-size: 14px; letter-spacing: 0.18em; font-weight: 600; text-transform: uppercase; }
.shop__btn-arrow { font-family: var(--font-display); font-size: 28px; line-height: 1; }

.shop__indicators {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-top: 18px;
}
.ind {
  border: 1px solid var(--rule-soft);
  padding: 14px 16px;
  background: var(--paper);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ind--accent {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}
.ind__big { font-size: 28px; font-weight: 900; line-height: 1; }

.shop__note { display: flex; flex-direction: column; gap: 8px; max-width: 70ch; }
.shop__note p {
  font-family: var(--font-display);
  font-size: 16px;
  line-height: 1.6;
  color: var(--ink);
}

@media (max-width: 720px) {
  .shop__cover { padding: 32px 24px 36px; }
  .shop__indicators { grid-template-columns: repeat(2, 1fr); }
  .shop__btn { font-size: 22px; padding: 14px 20px; }
}
</style>