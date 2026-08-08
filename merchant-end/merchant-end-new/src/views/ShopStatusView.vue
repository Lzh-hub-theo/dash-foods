<script setup lang="ts">
// 营业状态 / SHOP STATUS
import { onMounted, computed } from 'vue'
import { useShopStore } from '@/stores/shop'
import { ElMessage } from '@/api/notify'

const shop = useShopStore()

const headline = computed(() => (shop.isOpen ? '门店营业中' : '门店已打烊'))
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
          <span class="shop__btn-l font-mono">{{ shop.isOpen ? '打烊' : '开张' }}</span>
          <span class="shop__btn-arrow">→</span>
        </button>
      </div>

      <div class="shop__indicators">
        <div class="ind">
          <div class="dateline">前台</div>
          <div class="ind__big tnum headline">{{ shop.isOpen ? '开启' : '关闭' }}</div>
        </div>
        <div class="ind">
          <div class="dateline">后厨</div>
          <div class="ind__big tnum headline">{{ shop.isOpen ? '开启' : '关闭' }}</div>
        </div>
        <div class="ind">
          <div class="dateline">配送</div>
          <div class="ind__big tnum headline">{{ shop.isOpen ? '开启' : '关闭' }}</div>
        </div>
        <div class="ind">
          <div class="dateline">全部渠道</div>
          <div class="ind__big tnum headline">{{ shop.isOpen ? '开启' : '关闭' }}</div>
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
  border: 1px solid var(--ink);
  background: var(--paper-deep);
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow: hidden;
  transition: box-shadow 0.3s var(--ease);
}
.shop__cover:hover { box-shadow: 0 14px 32px -14px rgba(10, 10, 10, 0.12); }
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
.shop__eyebrow {
  font-family: var(--font-pix);
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}
.shop__title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(40px, 5vw, 64px);
  letter-spacing: -0.02em;
  line-height: 1;
}
.shop__lede {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 400;
  line-height: 1.7;
  max-width: 60ch;
  color: var(--ink-soft);
}

.shop__actions { margin-top: 14px; }
.shop__btn {
  display: inline-flex;
  align-items: center;
  gap: 20px;
  padding: 22px 38px;
  background: var(--paper);
  border: 1px solid var(--ink);
  font-family: var(--font-display);
  font-weight: 400;
  font-style: italic;
  font-size: 34px;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: transform 0.22s var(--ease), box-shadow 0.22s var(--ease), background 0.2s var(--ease), color 0.2s var(--ease);
}
.shop__btn::before {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--ink);
  display: inline-block;
  flex: none;
}
.shop__btn:hover { transform: translateY(-3px); box-shadow: 0 12px 28px -8px rgba(10, 10, 10, 0.25); }
.shop__btn--on { background: var(--ink); color: var(--paper); }
.shop__btn--on::before { background: var(--paper); }
.shop__btn-l {
  font-family: var(--font-pix);
  font-size: 16px;
  letter-spacing: 0.18em;
  font-weight: 400;
  text-transform: uppercase;
  font-style: normal;
}
.shop__btn-arrow {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 32px;
  line-height: 1;
}

.shop__indicators {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 18px;
}
.ind {
  border: 1px solid var(--rule);
  padding: 11px 14px;
  background: var(--paper);
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: transform 0.22s var(--ease), box-shadow 0.22s var(--ease), border-color 0.22s var(--ease);
}
.ind:hover { transform: translateY(-3px); box-shadow: 0 10px 22px -10px rgba(10, 10, 10, 0.14); border-color: var(--ink); }
.ind .dateline {
  font-family: var(--font-pix);
  font-size: 9px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}
.ind__big {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 300;
  font-size: 22px;
  line-height: 1;
  letter-spacing: -0.01em;
}

.shop__note { display: flex; flex-direction: column; gap: 10px; max-width: 70ch; }
.shop__note .dateline {
  font-family: var(--font-pix);
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}
.shop__note p {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.7;
  color: var(--ink-soft);
}

@media (max-width: 720px) {
  .shop__cover { padding: 32px 24px 36px; }
  .shop__indicators { grid-template-columns: repeat(2, 1fr); }
  .shop__btn { font-size: 26px; padding: 18px 26px; }
}
</style>