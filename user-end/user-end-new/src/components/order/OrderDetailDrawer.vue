<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from '@/api/notify'
import {
  cancelOrder,
  reminderOrder,
  repetitionOrder,
  getOrderDetail,
} from '@/api/order'
import type { OrderVO } from '@/types/api'

const props = defineProps<{
  open: boolean
  order: OrderVO | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'changed'): void
  (e: 'update:order', order: OrderVO): void
}>()

const router = useRouter()

const tick = ref(0)
let timer: number | null = null
onMounted(() => {
  timer = window.setInterval(() => (tick.value += 1), 1000)
})
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})

const close = () => emit('close')

const statusText = (s: number) =>
  ({
    1: '待支付',
    2: '待商家接单',
    3: '已接单 · 制作中',
    4: '配送中',
    5: '已完成',
    6: '已取消',
  })[s] || '未知'

const statusTone = (s: number) => {
  if ([2, 3, 4].includes(s)) return 'progress'
  if (s === 5) return 'done'
  if (s === 6) return 'cancel'
  return 'pending'
}

/** 4 步进度：待支付(1) -> 待接单(2) -> 制作中(3) -> 配送中(4)（-> 已完成(5)/已取消(6)） */
const statusStep = computed(() => {
  const s = props.order?.status ?? 0
  if (s === 1) return 0
  if (s === 2) return 1
  if (s === 3) return 2
  if (s === 4) return 3
  if (s === 5) return 4
  return -1
})

/** 进行中订单：打开 drawer 后每 5s 拉一次详情，最多 60 次（约 5 分钟） */
let detailTimer: number | null = null
let detailPollCount = 0
const detailAutoFresh = ref(false)

function stopDetailPolling() {
  if (detailTimer) {
    window.clearInterval(detailTimer)
    detailTimer = null
  }
  detailPollCount = 0
  detailAutoFresh.value = false
}

async function refreshOrderDetail() {
  if (!props.order) return
  try {
    const vo = await getOrderDetail(props.order.id)
    if (vo) emit('update:order', vo)
  } catch {
    /* 静默 */
  }
}

watch(
  () => [props.open, props.order?.status],
  ([open, status]) => {
    stopDetailPolling()
    if (!open || typeof status !== 'number') return
    if (![2, 3, 4].includes(status)) return
    detailAutoFresh.value = true
    detailTimer = window.setInterval(async () => {
      detailPollCount += 1
      if (detailPollCount > 60) {
        stopDetailPolling()
        return
      }
      await refreshOrderDetail()
    }, 5_000)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  stopDetailPolling()
})

/** 配送倒计时（estimatedDeliveryTime - now）；空值或过期返回 null */
const deliveryEta = computed(() => {
  void tick.value
  if (!props.order?.estimatedDeliveryTime) return null
  const target = new Date(props.order.estimatedDeliveryTime).getTime()
  const diff = target - Date.now()
  if (Number.isNaN(target)) return null
  if (diff <= 0) return { past: true, text: '即将送达' }
  const m = Math.floor(diff / 60000)
  const s = Math.floor((diff % 60000) / 1000)
    .toString()
    .padStart(2, '0')
  return { past: false, text: `${m} 分 ${s} 秒` }
})

/** 距接单 / 已等待时长（用于催单判断） */
const waitingMins = computed(() => {
  void tick.value
  if (!props.order?.orderTime) return 0
  const diff = Date.now() - new Date(props.order.orderTime).getTime()
  return Math.max(0, Math.floor(diff / 60000))
})

/** 可催单阈值：进行中 + 已等待 ≥ 2 分钟且 ≤ 60 分钟 */
const canReminder = computed(() => {
  const o = props.order
  if (!o) return false
  return [2, 3].includes(o.status) && waitingMins.value >= 2 && waitingMins.value < 60
})

const canPay = computed(() => props.order?.status === 1)
const canCancel = computed(() => props.order && [1, 2].includes(props.order.status))
const canRepetition = computed(() => props.order?.status === 5)

async function onReminder() {
  if (!props.order) return
  try {
    await ElMessageBox({
      title: '催单提示',
      message: '确认提醒商家尽快出餐吗？\n频繁催单可能打扰商家哦。',
      confirmText: '催一下',
      cancelText: '再等等',
    })
  } catch {
    return
  }
  try {
    await reminderOrder(props.order.id)
    ElMessage({ type: 'success', text: '已通知商家，请耐心等待 ⏳' })
    emit('changed')
  } catch {
    ElMessage({ type: 'error', text: '催单失败，请稍后再试' })
  }
}

async function onCancel() {
  if (!props.order) return
  try {
    await ElMessageBox({
      title: '取消订单',
      message: '确认取消这个订单吗？取消后无法恢复。',
      confirmText: '确认取消',
      cancelText: '再想想',
    })
  } catch {
    return
  }
  try {
    await cancelOrder(props.order.id)
    ElMessage({ type: 'success', text: '订单已取消' })
    emit('changed')
    close()
  } catch {
    ElMessage({ type: 'error', text: '取消失败，请稍后再试' })
  }
}

async function onRepetition() {
  if (!props.order) return
  try {
    await repetitionOrder(props.order.id)
    ElMessage({ type: 'success', text: '已把菜品加回购物车，去首页看看？' })
    close()
    router.push('/')
  } catch {
    ElMessage({ type: 'error', text: '再来一单失败，请稍后再试' })
  }
}

function formatTime(s?: string) {
  if (!s) return '—'
  return s.slice(0, 16).replace('T', ' ')
}

const totalDishes = computed(() =>
  (props.order?.orderDetailList || []).reduce((a, b) => a + b.number, 0),
)
</script>

<template>
  <Transition name="mask">
    <div v-if="open" class="od-mask" @click="close" />
  </Transition>
  <Transition name="drawer">
    <aside v-if="open && order" class="od-drawer" role="dialog" aria-label="订单详情">
      <header class="od-head">
        <div>
          <p class="eyebrow">ORDER&nbsp;DETAIL</p>
          <h2 class="title serif">订单详情</h2>
        </div>
        <button class="close-btn" aria-label="关闭" @click="close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </header>

      <section class="od-status" :class="`is-${statusTone(order.status)}`">
        <div class="status-row">
          <span class="status-pill">{{ statusText(order.status) }}</span>
          <span class="order-no">{{ order.number }}</span>
        </div>
        <!-- 4 段进度条：待支付 → 待接单 → 制作中 → 配送中（→ 已完成） -->
        <ol
          v-if="statusStep >= 0"
          class="step-track"
          aria-label="订单进度"
        >
          <li
            v-for="(label, i) in ['待支付', '待接单', '制作中', '配送中']"
            :key="label"
            class="step-item"
            :class="{
              'is-on': statusStep >= i,
              'is-active': statusStep === i && order.status < 5,
              'is-end': statusStep === i && order.status === 5,
            }"
          >
            <span class="step-dot" />
            <span class="step-label">{{ label }}</span>
          </li>
          <span
            v-if="statusStep === 4"
            class="step-final"
            aria-hidden="false"
          >已完成</span>
        </ol>
        <div v-if="detailAutoFresh" class="auto-hint">
          <span class="auto-dot" />
          自动刷新订单状态
        </div>
        <p v-if="[2, 3, 4].includes(order.status)" class="eta-line">
          <span class="eta-label">{{
            order.status === 4 ? '预计送达' : '预计还需'
          }}</span>
          <span class="eta-time serif">{{ deliveryEta?.text || '计算中…' }}</span>
        </p>
        <p v-else-if="order.status === 1" class="eta-line is-warn">请尽快完成支付</p>
        <p v-else-if="order.status === 5" class="eta-line">订单已完成，期待下次相遇</p>
        <p v-else-if="order.status === 6" class="eta-line is-cancel">
          {{ order.cancelReason ? `已取消 · ${order.cancelReason}` : '订单已取消' }}
        </p>
      </section>

      <section class="od-block">
        <h3 class="block-title serif">菜品明细</h3>
        <ul class="dish-list">
          <li v-for="d in order.orderDetailList" :key="d.id" class="dish-row">
            <div class="dish-img">
              <img v-if="d.image" :src="d.image" :alt="d.name" loading="lazy" @error="($event.target as HTMLImageElement).style.display='none'" />
              <span v-else class="dish-glyph">{{ d.name?.slice(0, 1) }}</span>
            </div>
            <div class="dish-meta">
              <p class="dish-name">{{ d.name }}</p>
              <p v-if="d.dishFlavor" class="dish-flavor">{{ d.dishFlavor }}</p>
            </div>
            <div class="dish-num">
              <span class="num">×{{ d.number }}</span>
              <span class="price">¥{{ (d.amount * d.number).toFixed(2) }}</span>
            </div>
          </li>
        </ul>
        <div class="block-foot">
          <span>共 {{ totalDishes }} 件</span>
          <span class="sum">合计 <strong>¥{{ Number(order.amount).toFixed(2) }}</strong></span>
        </div>
      </section>

      <section class="od-block">
        <h3 class="block-title serif">配送信息</h3>
        <ul class="info-list">
          <li>
            <span class="info-k">收货人</span>
            <span class="info-v">{{ order.consignee }} · {{ order.phone }}</span>
          </li>
          <li>
            <span class="info-k">地址</span>
            <span class="info-v">{{ order.address }}</span>
          </li>
          <li v-if="order.estimatedDeliveryTime">
            <span class="info-k">预计送达</span>
            <span class="info-v serif italic">{{ formatTime(order.estimatedDeliveryTime) }}</span>
          </li>
          <li>
            <span class="info-k">下单时间</span>
            <span class="info-v">{{ formatTime(order.orderTime) }}</span>
          </li>
          <li v-if="order.remark">
            <span class="info-k">备注</span>
            <span class="info-v">{{ order.remark }}</span>
          </li>
        </ul>
      </section>

      <footer class="od-foot">
        <button
          v-if="canReminder"
          class="foot-btn ghost"
          :disabled="waitingMins >= 60"
          @click="onReminder"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12h3l3-9 4 18 3-9h5" />
          </svg>
          催单
        </button>
        <button v-if="canRepetition" class="foot-btn primary" @click="onRepetition">
          再来一单
        </button>
        <button v-if="canPay" class="foot-btn primary" @click="$emit('changed')">
          立即支付
        </button>
        <button v-if="canCancel" class="foot-btn danger" @click="onCancel">
          取消订单
        </button>
      </footer>
    </aside>
  </Transition>
</template>

<style scoped>
.od-mask {
  position: fixed;
  inset: 0;
  background: rgba(31, 42, 29, 0.32);
  backdrop-filter: blur(2px);
  z-index: 70;
}
.od-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 480px;
  max-width: 92vw;
  background: var(--color-cream);
  z-index: 71;
  display: flex;
  flex-direction: column;
  box-shadow: -32px 0 64px -16px rgba(31, 42, 29, 0.25);
  border-left: 1px solid var(--color-line);
}

.od-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 28px 16px;
  border-bottom: 1px solid var(--color-line-soft);
}
.eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.32em;
  color: var(--color-sage);
  margin-bottom: 8px;
}
.title {
  font-family: var(--font-display);
  font-size: var(--fs-28);
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--color-ink);
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
}

.od-status {
  padding: 24px 28px;
  background:
    radial-gradient(circle at 0% 0%, rgba(164, 196, 154, 0.18), transparent 50%),
    var(--color-paper);
  border-bottom: 1px solid var(--color-line-soft);
}
.od-status.is-done {
  background:
    radial-gradient(circle at 0% 0%, rgba(255, 233, 184, 0.4), transparent 50%),
    var(--color-paper);
}
.od-status.is-cancel {
  background:
    radial-gradient(circle at 0% 0%, rgba(217, 83, 79, 0.12), transparent 50%),
    var(--color-paper);
}
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.status-pill {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  padding: 5px 14px;
  border-radius: var(--radius-pill);
  background: var(--color-sage);
  color: var(--color-paper);
}
.od-status.is-progress .status-pill {
  background: var(--color-sage);
}
.od-status.is-pending .status-pill {
  background: var(--color-butter);
  color: var(--color-ink);
}
.od-status.is-done .status-pill {
  background: var(--color-cream-soft);
  color: var(--color-ink-mute);
}
.od-status.is-cancel .status-pill {
  background: var(--color-tomato);
  color: var(--color-paper);
}
.order-no {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-13);
  color: var(--color-ink-mute);
}
.eta-line {
  font-family: var(--font-display);
  font-size: var(--fs-14);
  color: var(--color-ink-soft);
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
}
.eta-line.is-warn {
  color: var(--color-tomato);
}
.eta-line.is-cancel {
  color: var(--color-ink-mute);
}
.eta-label {
  font-family: var(--font-body);
  font-size: var(--fs-12);
  letter-spacing: 0.08em;
  color: var(--color-ink-mute);
}
.eta-time {
  font-size: var(--fs-24);
  font-weight: 500;
  color: var(--color-sage-deep);
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
}
.eta-line.is-cancel .eta-time {
  color: var(--color-ink-mute);
}

/* —— 4 段进度条 —— */
.step-track {
  list-style: none;
  margin: 12px 0 8px;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  position: relative;
}
.step-track::before {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  top: 7px;
  height: 2px;
  background: var(--color-line);
  border-radius: 1px;
  z-index: 0;
}
.step-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  z-index: 1;
}
.step-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-paper);
  border: 2px solid var(--color-line);
  transition: background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out);
}
.step-item.is-on .step-dot {
  background: var(--color-sage);
  border-color: var(--color-sage);
}
.step-item.is-active .step-dot {
  background: var(--color-apricot);
  border-color: var(--color-apricot);
  transform: scale(1.3);
  box-shadow: 0 0 0 4px rgba(242, 166, 90, 0.18);
}
.step-item.is-end .step-dot {
  background: var(--color-cream-soft);
  border-color: var(--color-line);
}
.step-label {
  font-size: var(--fs-12);
  color: var(--color-ink-mute);
  font-family: var(--font-display);
  font-style: italic;
  letter-spacing: 0.02em;
}
.step-item.is-active .step-label,
.step-item.is-on .step-label {
  color: var(--color-ink);
  font-style: normal;
}
.step-item.is-active .step-label {
  color: var(--color-apricot-deep);
  font-weight: 600;
}
.step-final {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fs-12);
  font-family: var(--font-display);
  font-style: italic;
  color: var(--color-sage-deep);
  letter-spacing: 0.04em;
}

/* —— 自动刷新提示 —— */
.auto-hint {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-family: var(--font-display);
  font-style: italic;
  color: var(--color-ink-mute);
  letter-spacing: 0.02em;
}
.auto-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-sage);
  animation: pulse 1.4s var(--ease-out) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1); }
}

.od-block {
  padding: 22px 28px;
  border-bottom: 1px solid var(--color-line-soft);
}
.block-title {
  font-family: var(--font-display);
  font-size: var(--fs-15);
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--color-ink);
  margin-bottom: 16px;
}

.dish-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.dish-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.dish-img {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-cream-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}
.dish-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dish-glyph {
  font-family: var(--font-display);
  font-size: 24px;
  color: var(--color-sage);
}
.dish-meta {
  flex: 1;
  min-width: 0;
}
.dish-name {
  font-size: var(--fs-13);
  font-weight: 500;
  color: var(--color-ink);
}
.dish-flavor {
  margin-top: 2px;
  font-size: 11px;
  color: var(--color-ink-mute);
  font-family: var(--font-display);
  font-style: italic;
}
.dish-num {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.dish-num .num {
  font-family: var(--font-display);
  font-size: var(--fs-12);
  color: var(--color-ink-mute);
}
.dish-num .price {
  font-family: var(--font-display);
  font-size: var(--fs-13);
  color: var(--color-ink);
  font-weight: 500;
}
.block-foot {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed var(--color-line);
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: var(--fs-13);
  color: var(--color-ink-mute);
}
.block-foot .sum {
  font-family: var(--font-display);
  color: var(--color-ink);
}
.block-foot .sum strong {
  font-size: var(--fs-20);
  font-weight: 500;
  color: var(--color-apricot-deep);
  margin-left: 6px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.info-list li {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 12px;
  font-size: var(--fs-13);
}
.info-k {
  color: var(--color-ink-mute);
  letter-spacing: 0.04em;
}
.info-v {
  color: var(--color-ink-soft);
  line-height: 1.55;
}
.italic {
  font-style: italic;
}

.od-foot {
  margin-top: auto;
  display: flex;
  gap: 12px;
  padding: 20px 28px 28px;
  border-top: 1px solid var(--color-line-soft);
  background: var(--color-paper);
}
.foot-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 46px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-13);
  font-weight: 600;
  letter-spacing: 0.04em;
  transition:
    background var(--dur-base) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}
.foot-btn.ghost {
  background: var(--color-paper);
  border: 1.5px solid var(--color-line);
  color: var(--color-ink);
}
.foot-btn.ghost:hover {
  border-color: var(--color-sage);
  color: var(--color-sage-deep);
}
.foot-btn.primary {
  background: var(--color-ink);
  color: var(--color-paper);
}
.foot-btn.primary:hover {
  background: var(--color-sage-deep);
  transform: translateY(-1px);
}
.foot-btn.danger {
  background: var(--color-paper);
  border: 1.5px solid var(--color-tomato);
  color: var(--color-tomato);
}
.foot-btn.danger:hover {
  background: var(--color-tomato);
  color: var(--color-paper);
}
.foot-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

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
</style>