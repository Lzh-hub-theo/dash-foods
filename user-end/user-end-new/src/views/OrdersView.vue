<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from '@/api/notify'
import { historyOrders, getOrderDetail } from '@/api/order'
import OrderDetailDrawer from '@/components/order/OrderDetailDrawer.vue'
import { useUserStore } from '@/stores/user'
import type { OrderVO, PageResult } from '@/types/api'

const router = useRouter()
const user = useUserStore()

const orders = ref<OrderVO[]>([])
const loading = ref(false)
const loaded = ref(false)
const loadError = ref(false)
const autoRefreshing = ref(false)
const slowHint = ref(false)
let slowTimer: number | null = null

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待支付' },
  { key: 'progress', label: '进行中' },
  { key: 'done', label: '已完成' },
]
const activeTab = ref('all')

const drawerOpen = ref(false)
const currentOrder = ref<OrderVO | null>(null)
const detailLoading = ref(false)

/** 是否有进行中订单 */
const hasInProgress = computed(() =>
  orders.value.some((o) => [2, 3, 4].includes(o.status)),
)

let pollTimer: number | null = null

onMounted(async () => {
  if (!user.isLogin) {
    ElMessage({ type: 'info', text: '请先登录后再查看订单' })
    router.replace({ name: 'login', query: { redirect: '/orders' } })
    return
  }
  await fetchOrders()
  // 仅在有进行中订单时启动轮询
  startPollingIfNeeded()
})

/** 拉取订单列表（初始 + 重试 + 下拉刷新都走这里） */
async function fetchOrders() {
  loading.value = true
  loadError.value = false
  slowHint.value = false
  // 5s 后仍未结束则提示用户"网络较慢"，避免看着像卡死
  slowTimer = window.setTimeout(() => {
    if (loading.value) slowHint.value = true
  }, 5000)
  try {
    const page = (await historyOrders({ page: 1, pageSize: 30 })) as PageResult<OrderVO>
    orders.value = page?.records ?? []
    loaded.value = true
  } catch {
    loadError.value = true
    // 失败时不强行清空 orders，保留上次成功的数据给用户看
  } finally {
    if (slowTimer) {
      window.clearTimeout(slowTimer)
      slowTimer = null
    }
    slowHint.value = false
    loading.value = false
  }
}

onBeforeUnmount(() => {
  if (pollTimer) {
    window.clearInterval(pollTimer)
    pollTimer = null
  }
  if (slowTimer) {
    window.clearTimeout(slowTimer)
    slowTimer = null
  }
})

function startPollingIfNeeded() {
  if (pollTimer) return
  if (!hasInProgress.value) return
  pollTimer = window.setInterval(async () => {
    if (!hasInProgress.value) {
      stopPolling()
      return
    }
    if (document.hidden) return
    autoRefreshing.value = true
    try {
      const page = (await historyOrders({ page: 1, pageSize: 30, silent: true })) as PageResult<OrderVO>
      const next = page?.records ?? []
      orders.value = next
    } catch {
      /* 静默：轮询失败不打扰用户 */
    } finally {
      autoRefreshing.value = false
    }
  }, 10_000)
}

function stopPolling() {
  if (pollTimer) {
    window.clearInterval(pollTimer)
    pollTimer = null
  }
}

const filtered = computed(() => {
  if (activeTab.value === 'all') return orders.value
  return orders.value.filter((o) => {
    if (activeTab.value === 'pending') return o.status === 1
    if (activeTab.value === 'progress') return [2, 3, 4].includes(o.status)
    if (activeTab.value === 'done') return o.status === 5 || o.status === 6
    return true
  })
})

function statusText(status: number) {
  return {
    1: '待支付',
    2: '待商家接单',
    3: '制作中',
    4: '配送中',
    5: '已完成',
    6: '已取消',
  }[status] || '未知'
}
function statusTone(status: number) {
  if ([2, 3, 4].includes(status)) return 'progress'
  if (status === 5) return 'done'
  if (status === 6) return 'cancel'
  return 'pending'
}

/** 订单进度阶段（0=待支付 1=待接单 2=制作中 3=配送中 4=已完成/已取消） */
function statusStep(status: number) {
  return [0, 2, 3, 4, 5].indexOf(status)
}

async function openDetail(id: number) {
  detailLoading.value = true
  drawerOpen.value = true
  currentOrder.value = orders.value.find((o) => o.id === id) || null
  try {
    const vo = await getOrderDetail(id)
    currentOrder.value = vo
  } catch {
    /* 保留缓存值 */
  } finally {
    detailLoading.value = false
  }
}

function closeDrawer() {
  drawerOpen.value = false
  currentOrder.value = null
}

async function refreshList() {
  try {
    const page = (await historyOrders({ page: 1, pageSize: 30, silent: true })) as PageResult<OrderVO>
    orders.value = page?.records ?? []
  } catch {
    /* ignore */
  }
  // 详情变更后检查轮询条件
  if (hasInProgress.value) {
    startPollingIfNeeded()
  } else {
    stopPolling()
  }
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="orders-page">
    <div class="orders">
      <div class="container orders-inner">
        <header class="orders-head">
          <p class="eyebrow">MY&nbsp;ORDERS</p>
          <h1 class="orders-title serif">我的订单</h1>
          <p class="orders-sub">这里记录你在 dash·foods 的每一次点单。</p>
        </header>

        <div class="tabs-bar">
          <nav class="tabs">
            <button
              v-for="t in tabs"
              :key="t.key"
              class="tab"
              :class="{ 'is-active': activeTab === t.key }"
              @click="activeTab = t.key"
            >
              {{ t.label }}
              <span v-if="t.key === 'pending' && orders.filter(o => o.status === 1).length" class="tab-dot" />
            </button>
          </nav>
          <span v-if="autoRefreshing" class="tab-refreshing">
            <span class="tab-refreshing-dot" />
            自动刷新中
          </span>
        </div>

        <div v-if="loading" class="state">
          <p>{{ slowHint ? '网络有点慢，请稍候…' : '正在加载订单…' }}</p>
        </div>

        <div v-else-if="loadError" class="state state-error">
          <p class="empty-title">订单加载失败</p>
          <p class="empty-sub">可能是网络或服务问题，点此重试</p>
          <button class="ghost-btn" @click="fetchOrders">重新加载</button>
        </div>

        <div v-else-if="!filtered.length" class="empty">
          <div class="empty-illus">
            <svg viewBox="0 0 140 140" fill="none">
              <circle cx="70" cy="70" r="60" stroke="#E5DFD0" stroke-width="1.5" stroke-dasharray="3 4" />
              <path d="M50 70 L 90 70" stroke="#A4C49A" stroke-width="2" stroke-linecap="round" />
              <path d="M70 50 L 70 90" stroke="#A4C49A" stroke-width="2" stroke-linecap="round" />
              <circle cx="70" cy="70" r="6" fill="#A4C49A" />
            </svg>
          </div>
          <p class="empty-title">还没有订单</p>
          <p class="empty-sub">去门店逛逛，挑几道喜欢的菜吧。</p>
          <button class="ghost-btn" @click="goHome">回到门店首页</button>
        </div>

        <ul v-else class="order-list">
          <li v-for="o in filtered" :key="o.id" class="order-card" @click="openDetail(o.id)">
            <header class="oc-head">
              <div class="oc-id">
                <span class="oc-num">{{ o.number }}</span>
                <span class="oc-time">{{ o.orderTime?.slice(0, 16) }}</span>
              </div>
              <span class="oc-status" :class="`is-${statusTone(o.status)}`">
                {{ statusText(o.status) }}
              </span>
            </header>
            <div class="oc-body">
              <div class="oc-dishes">
                <span v-for="d in (o.orderDetailList || []).slice(0, 4)" :key="d.id" class="oc-dish">
                  {{ d.name }}
                  <em>×{{ d.number }}</em>
                </span>
                <span v-if="(o.orderDetailList?.length || 0) > 4" class="oc-more">
                  等 {{ o.orderDetailList.length }} 件
                </span>
              </div>
            </div>
            <div v-if="[2, 3, 4].includes(o.status)" class="oc-progress" :aria-label="`当前阶段 ${statusStep(o.status) + 1}/4`">
              <span
                v-for="(_, i) in 4"
                :key="i"
                class="oc-progress-dot"
                :class="{ 'is-on': i <= statusStep(o.status), 'is-active': i === statusStep(o.status) }"
              />
              <span class="oc-progress-text">
                {{
                  o.status === 2 ? '待商家接单' : o.status === 3 ? '制作中' : '配送中'
                }}
              </span>
            </div>
            <footer class="oc-foot">
              <span class="oc-count">
                共 <strong>{{ (o.orderDetailList || []).reduce((a, b) => a + b.number, 0) }}</strong> 件
              </span>
              <span class="oc-total">
                合计 <strong>¥{{ Number(o.amount).toFixed(2) }}</strong>
              </span>
              <span class="oc-detail-hint">查看详情 ›</span>
            </footer>
          </li>
        </ul>
      </div>
    </div>

    <OrderDetailDrawer
      :open="drawerOpen"
      :order="currentOrder"
      @update:order="(o) => (currentOrder = o)"
      @close="closeDrawer"
      @changed="refreshList"
    />
  </div>
</template>

<style scoped>
.orders-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.orders {
  flex: 1;
  padding: 56px 0 96px;
}
.orders-head {
  text-align: center;
  margin-bottom: 32px;
}
.orders-head .eyebrow {
  font-size: var(--fs-12);
  font-weight: 700;
  letter-spacing: 0.32em;
  color: var(--color-sage);
  margin-bottom: 12px;
}
.orders-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(40px, 4.5vw, 56px);
  letter-spacing: -0.02em;
}
.orders-sub {
  margin-top: 12px;
  font-size: var(--fs-14);
  color: var(--color-ink-mute);
}

.tabs-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0 auto 36px;
  max-width: 720px;
}
.tabs {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
}
.tab {
  position: relative;
  padding: 8px 18px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-13);
  font-weight: 500;
  color: var(--color-ink-soft);
  transition: all var(--dur-base) var(--ease-out);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.tab:hover {
  color: var(--color-ink);
}
.tab.is-active {
  background: var(--color-ink);
  color: var(--color-paper);
}
.tab-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-apricot);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 0;
}
.empty-illus {
  width: 140px;
  height: 140px;
}
.empty-title {
  font-family: var(--font-display);
  font-size: var(--fs-24);
  color: var(--color-ink);
}
.empty-sub {
  font-size: var(--fs-14);
  color: var(--color-ink-mute);
}
.ghost-btn {
  margin-top: 12px;
  padding: 12px 24px;
  border-radius: var(--radius-pill);
  background: var(--color-ink);
  color: var(--color-paper);
  font-size: var(--fs-13);
  font-weight: 600;
  letter-spacing: 0.04em;
  transition: background var(--dur-base) var(--ease-out);
}
.ghost-btn:hover {
  background: var(--color-sage-deep);
}

.state {
  padding: 80px 0;
  text-align: center;
  color: var(--color-ink-mute);
  font-family: var(--font-display);
  font-style: italic;
}

.state-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-style: normal;
}

.state-error .empty-title {
  font-family: var(--font-display);
  font-size: var(--fs-20);
  color: var(--color-ink);
  font-weight: 500;
}

.state-error .empty-sub {
  font-size: var(--fs-13);
  color: var(--color-ink-mute);
  margin-bottom: 8px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 760px;
  margin: 0 auto;
}
.order-card {
  padding: 22px 24px;
  background: var(--color-paper);
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--dur-base) var(--ease-out);
}
.order-card:hover {
  border-color: var(--color-sage-soft);
  box-shadow: var(--shadow-card);
  transform: translateY(-2px);
}
.oc-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px dashed var(--color-line);
}
.oc-num {
  font-family: var(--font-display);
  font-size: var(--fs-18);
  font-weight: 500;
  color: var(--color-ink);
  margin-right: 12px;
}
.oc-time {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-13);
  color: var(--color-ink-mute);
}
.oc-status {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
}
.oc-status.is-progress {
  background: var(--color-sage-mist);
  color: var(--color-sage-deep);
}
.oc-status.is-pending {
  background: var(--color-butter);
  color: var(--color-ink);
}
.oc-status.is-done {
  background: var(--color-cream-soft);
  color: var(--color-ink-mute);
}
.oc-status.is-cancel {
  background: var(--color-tomato);
  color: var(--color-paper);
}

.oc-body {
  padding: 16px 0;
}
.oc-dishes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  font-size: var(--fs-13);
  color: var(--color-ink-soft);
}
.oc-dish em {
  font-style: normal;
  font-family: var(--font-display);
  color: var(--color-ink-mute);
  margin-left: 2px;
}
.oc-more {
  font-size: var(--fs-12);
  color: var(--color-ink-mute);
  font-family: var(--font-display);
  font-style: italic;
}

.oc-foot {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding-top: 14px;
  border-top: 1px dashed var(--color-line);
  font-size: var(--fs-13);
  color: var(--color-ink-mute);
}
.oc-foot strong {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--color-ink);
  margin: 0 4px;
}
.oc-total strong {
  color: var(--color-apricot-deep);
  font-size: var(--fs-18);
  font-weight: 500;
  letter-spacing: -0.01em;
}
.oc-detail-hint {
  margin-left: auto;
  font-size: var(--fs-12);
  color: var(--color-sage);
  font-family: var(--font-display);
  font-style: italic;
}

@media (max-width: 720px) {
  .order-card {
    padding: 18px 18px;
  }
  .oc-foot {
    flex-wrap: wrap;
    gap: 10px 16px;
  }
  .oc-detail-hint {
    margin-left: 0;
  }
}

/* —— 进度条 —— */
.oc-progress {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-12);
  color: var(--color-ink-mute);
  font-family: var(--font-display);
  font-style: italic;
  letter-spacing: 0.02em;
}
.oc-progress-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-line);
  transition: background var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out);
}
.oc-progress-dot.is-on {
  background: var(--color-sage);
}
.oc-progress-dot.is-active {
  background: var(--color-apricot);
  transform: scale(1.4);
  box-shadow: 0 0 0 4px rgba(242, 166, 90, 0.18);
}
.oc-progress-text {
  margin-left: 6px;
  color: var(--color-sage-deep);
  font-style: normal;
  font-weight: 500;
}

/* —— 自动刷新指示 —— */
.tab-refreshing {
  margin-left: auto;
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fs-12);
  color: var(--color-ink-mute);
  font-family: var(--font-display);
  font-style: italic;
  letter-spacing: 0.02em;
}
.tab-refreshing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-sage);
  animation: pulse 1.4s var(--ease-out) infinite;
}
@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(0.85);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>