<script setup lang="ts">
// 订单管理 / ORDER DESK
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import { useOrderStore } from '@/stores/order'
import StatusBadge from '@/components/StatusBadge.vue'
import EmptyState from '@/components/EmptyState.vue'
import Modal from '@/components/Modal.vue'
import OrderStatusTabs from '@/components/OrderStatusTabs.vue'
import { ElMessage, ElMessageBox } from '@/api/notify'
import type { OrderVO } from '@/types/api'

const orderStore = useOrderStore()

const activeStatus = ref<number>(0)            // 0=全部
const page = ref<number>(1)
const pageSize = ref<number>(10)
const keyword = ref<string>('')                // 订单号 / 手机号
const dateFrom = ref<string>('')
const dateTo = ref<string>('')

const detailOpen = ref<boolean>(false)
const detail = ref<OrderVO | null>(null)
const detailLoading = ref<boolean>(false)
const rejectOpen = ref<boolean>(false)
const rejectTarget = ref<number | null>(null)
const rejectReason = ref<string>('')
const rejectMode = ref<'reject' | 'cancel'>('reject')

let pollTimer: number | null = null

const tabs = computed(() => [
  { value: 0, label: '全部',    count: totalPages.value * pageSize.value /* 仅估算 */ },
  { value: 2, label: '待接单',  count: countByStatus(2) },
  { value: 3, label: '已接单',  count: countByStatus(3) },
  { value: 4, label: '派送中',  count: countByStatus(4) },
  { value: 5, label: '已完成',  count: countByStatus(5) },
  { value: 6, label: '已取消',  count: countByStatus(6) },
])

function countByStatus(s: number) {
  return orderStore.list.filter((o: OrderVO) => o.status === s).length
}

const totalPages = computed(() => Math.max(1, Math.ceil(orderStore.total / pageSize.value)))

function fmtTime(s?: string) {
  if (!s) return '——'
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleString('zh-CN', { hour12: false })
}

async function refresh() {
  await orderStore.search({
    page: page.value,
    pageSize: pageSize.value,
    status: activeStatus.value || undefined,
    number: keyword.value || undefined,
    phone: keyword.value || undefined,
    beginTime: dateFrom.value ? `${dateFrom.value} 00:00:00` : undefined,
    endTime: dateTo.value ? `${dateTo.value} 23:59:59` : undefined,
  })
}

async function onSearch() {
  page.value = 1
  await refresh()
}

async function onReset() {
  keyword.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  activeStatus.value = 0
  page.value = 1
  await refresh()
}

async function onPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  page.value = p
  await refresh()
}

async function openDetail(o: OrderVO) {
  detailOpen.value = true
  detailLoading.value = true
  detail.value = null
  try {
    detail.value = await orderStore.getDetail(o.id)
  } finally {
    detailLoading.value = false
  }
}

function onDetailClose() {
  detailOpen.value = false
  detail.value = null
}

async function doConfirm(o: OrderVO) {
  const ok = await ElMessageBox('接单', `确认接单 #${o.number}?`, { confirmText: '接单' })
  if (ok) await orderStore.confirm(o.id)
}

async function doDelivery(o: OrderVO) {
  const ok = await ElMessageBox('派送', `派送订单 #${o.number}?`, { confirmText: '派送' })
  if (ok) await orderStore.delivery(o.id)
}

async function doComplete(o: OrderVO) {
  const ok = await ElMessageBox('完成', `完成订单 #${o.number}?`, { confirmText: '完成' })
  if (ok) await orderStore.complete(o.id)
}

function openReject(o: OrderVO) {
  rejectMode.value = 'reject'
  rejectTarget.value = o.id
  rejectReason.value = ''
  rejectOpen.value = true
}
async function submitReject() {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请填写拒单原因')
    return
  }
  if (rejectTarget.value == null) return
  try {
    if (rejectMode.value === 'reject') {
      await orderStore.reject(rejectTarget.value, rejectReason.value.trim())
    } else {
      await orderStore.cancel(rejectTarget.value, rejectReason.value.trim())
    }
    rejectOpen.value = false
    rejectTarget.value = null
  } catch { /* 错误已 toast */ }
}

function openCancel(o: OrderVO) {
  rejectMode.value = 'cancel'
  rejectTarget.value = o.id
  rejectReason.value = ''
  rejectOpen.value = true
}

onMounted(async () => {
  await refresh()
  // 进行中订单每 15s 轻刷一次
  pollTimer = window.setInterval(async () => {
    if (document.hidden) return
    await refresh()
  }, 15_000)
})

onBeforeUnmount(() => { if (pollTimer) clearInterval(pollTimer) })

watch(activeStatus, () => { /* noop */ })
</script>

<template>
  <section class="orders">
    <!-- 顶部 tabs -->
    <OrderStatusTabs v-model="activeStatus" :tabs="tabs" />

    <!-- 搜索行 -->
    <div class="orders__filters">
      <div class="filter">
        <span class="dateline">单号 / 手机号</span>
        <input v-model="keyword" class="input" placeholder="订单号或手机号" @keyup.enter="onSearch" />
      </div>
      <div class="filter">
        <span class="dateline">起始</span>
        <input v-model="dateFrom" type="date" class="input" />
      </div>
      <div class="filter">
        <span class="dateline">截止</span>
        <input v-model="dateTo" type="date" class="input" />
      </div>
      <div class="filter__actions">
        <button class="btn btn-sm" @click="onSearch">查询</button>
        <button class="btn btn-sm btn-ghost" @click="onReset">重置</button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="orders__table-wrap">
      <div v-if="orderStore.loading && orderStore.list.length === 0" class="orders__loading font-mono">LOADING…</div>
      <EmptyState v-else-if="orderStore.list.length === 0" message="未找到匹配的订单" hint="TRY A DIFFERENT FILTER" />
      <table v-else class="tbl orders__tbl">
        <thead>
          <tr>
            <th>订单号</th>
            <th>状态</th>
            <th>客户</th>
            <th>手机号</th>
            <th>商品数</th>
            <th class="t-right">金额</th>
            <th>下单时间</th>
            <th class="t-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in orderStore.list" :key="o.id">
            <td class="font-mono tnum">{{ o.number }}</td>
            <td><StatusBadge :status="o.status" /></td>
            <td>{{ o.consignee || o.userName || '——' }}</td>
            <td class="font-mono">{{ o.phone || '——' }}</td>
            <td>
              <span class="font-mono tnum">{{ o.orderDetailList?.length || 0 }}</span>
              <span class="orders__items font-mono">件</span>
            </td>
            <td class="t-right font-mono tnum">¥{{ o.amount.toFixed(2) }}</td>
            <td class="font-mono orders__time">{{ fmtTime(o.orderTime) }}</td>
            <td class="t-right">
              <div class="actions">
                <button class="btn btn-sm btn-ghost" @click="openDetail(o)">查看</button>
                <button v-if="o.status === 2" class="btn btn-sm btn-signal" @click="doConfirm(o)">接单</button>
                <button v-if="o.status === 2" class="btn btn-sm" @click="openReject(o)">拒单</button>
                <button v-if="o.status === 3" class="btn btn-sm btn-signal" @click="doDelivery(o)">派送</button>
                <button v-if="o.status === 4" class="btn btn-sm btn-signal" @click="doComplete(o)">完成</button>
                <button v-if="o.status === 2 || o.status === 3" class="btn btn-sm btn-ghost" @click="openCancel(o)">取消</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="orders__pager font-mono" v-if="orderStore.total > 0">
      <span>共 {{ orderStore.total }} 条 · 第 {{ page }} / {{ totalPages }} 页</span>
      <div class="pager__btns">
        <button class="btn btn-sm btn-ghost" :disabled="page <= 1" @click="onPage(page - 1)">上一页</button>
        <button class="btn btn-sm btn-ghost" :disabled="page >= totalPages" @click="onPage(page + 1)">下一页</button>
      </div>
    </div>

    <!-- 详情 Modal -->
    <Modal :open="detailOpen" title="订单详情" width="640px" @close="onDetailClose">
      <div v-if="detailLoading" class="font-mono" style="padding: 24px 0; letter-spacing: .2em;">加载中…</div>
      <div v-else-if="detail" class="detail">
        <div class="detail__row">
          <span class="dateline">订单号</span>
          <span class="font-mono tnum">{{ detail.number }}</span>
        </div>
        <div class="detail__row">
          <span class="dateline">状态</span>
          <StatusBadge :status="detail.status" />
        </div>
        <div class="detail__row">
          <span class="dateline">收货人</span>
          <span>{{ detail.consignee || '——' }} <span class="font-mono">{{ detail.phone || '' }}</span></span>
        </div>
        <div class="detail__row detail__row--stack">
          <span class="dateline">收货地址</span>
          <span>{{ detail.address || '——' }}</span>
        </div>
        <div class="detail__row">
          <span class="dateline">下单时间</span>
          <span class="font-mono">{{ fmtTime(detail.orderTime) }}</span>
        </div>
        <div v-if="detail.checkoutTime" class="detail__row">
          <span class="dateline">结账时间</span>
          <span class="font-mono">{{ fmtTime(detail.checkoutTime) }}</span>
        </div>
        <div v-if="detail.deliveryTime" class="detail__row">
          <span class="dateline">派送时间</span>
          <span class="font-mono">{{ fmtTime(detail.deliveryTime) }}</span>
        </div>
        <div v-if="detail.cancelReason" class="detail__row">
          <span class="dateline">取消原因</span>
          <span>{{ detail.cancelReason }}</span>
        </div>
        <div v-if="detail.rejectionReason" class="detail__row">
          <span class="dateline">拒单原因</span>
          <span>{{ detail.rejectionReason }}</span>
        </div>
        <hr class="rule" />
        <div class="dateline" style="margin-bottom: 8px;">菜品明细</div>
        <ul class="dishes">
          <li v-for="d in detail.orderDetailList" :key="d.id" class="dish">
            <span class="dish__name">{{ d.name }}</span>
            <span class="dish__flavor font-mono" v-if="d.dishFlavor">{{ d.dishFlavor }}</span>
            <span class="dish__qty font-mono">×{{ d.number }}</span>
            <span class="dish__amt font-mono tnum">¥{{ (d.amount * d.number).toFixed(2) }}</span>
          </li>
        </ul>
        <hr class="rule" />
        <div class="detail__row detail__row--big">
          <span class="dateline">合计</span>
          <span class="font-mono tnum detail__total">¥{{ detail.amount.toFixed(2) }}</span>
        </div>
      </div>
    </Modal>

    <!-- 拒单 / 取消 Modal 共用 -->
    <Modal
      :open="rejectOpen"
      :title="rejectMode === 'reject' ? '拒单' : '取消订单'"
      width="460px"
      @close="rejectOpen = false"
    >
      <p class="modal__hint font-mono">请填写原因</p>
      <textarea v-model="rejectReason" class="input" rows="3" placeholder="例如：库存不足 / 用户取消" />
      <template #footer>
        <button class="btn btn-sm btn-ghost" @click="rejectOpen = false">取消</button>
        <button class="btn btn-sm btn-signal" @click="submitReject">确认</button>
      </template>
    </Modal>
  </section>
</template>

<style scoped>
.orders { display: flex; flex-direction: column; gap: 18px; }

.orders__filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 12px;
  align-items: end;
  padding: 16px 0;
  border-bottom: 1px solid var(--rule);
}
.filter { display: flex; flex-direction: column; gap: 4px; }
.filter :deep(.dateline) {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}
.filter__actions { display: flex; gap: 8px; }

.orders__table-wrap { min-height: 320px; }
.orders__loading {
  padding: 80px 0;
  text-align: center;
  letter-spacing: 0.22em;
  color: var(--ink-muted);
  font-family: var(--font-pix);
  font-size: 11px;
}
.orders__tbl { table-layout: auto; }
.orders__tbl td { vertical-align: middle; }
.t-right { text-align: right; }
.orders__items {
  font-family: var(--font-pix);
  font-size: 9px;
  color: var(--ink-muted);
  margin-left: 4px;
  letter-spacing: 0.1em;
}
.orders__time { font-size: 12px; letter-spacing: 0.04em; color: var(--ink-soft); }

.actions { display: inline-flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }

.orders__pager {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.18em;
  color: var(--ink-muted);
  text-transform: uppercase;
  padding-top: 8px;
  border-top: 1px solid var(--rule-soft);
}
.pager__btns { display: flex; gap: 6px; }

/* detail */
.detail { display: flex; flex-direction: column; gap: 12px; }
.detail__row {
  display: grid;
  grid-template-columns: 130px 1fr;
  align-items: baseline;
  gap: 12px;
}
.detail__row :deep(.dateline) {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}
.detail__row--stack { align-items: start; }
.detail__row--big {
  font-size: 18px;
  align-items: baseline;
}
.detail__total {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 300;
  font-size: 32px;
  letter-spacing: -0.01em;
}
.dishes { display: flex; flex-direction: column; }
.dish {
  display: grid;
  grid-template-columns: 1.4fr 1.2fr auto auto;
  gap: 12px;
  align-items: baseline;
  padding: 8px 0;
  border-bottom: 1px dashed var(--rule-soft);
}
.dish:last-child { border-bottom: none; }
.dish__name { font-family: var(--font-display); font-size: 15px; font-weight: 400; }
.dish__flavor { font-size: 11px; color: var(--ink-muted); letter-spacing: 0.06em; }
.dish__qty { color: var(--ink-muted); }
.dish__amt { font-weight: 500; }

.modal__hint {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.18em;
  color: var(--ink-muted);
  margin-bottom: 10px;
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .orders__filters { grid-template-columns: 1fr 1fr; }
  .filter__actions { grid-column: 1 / -1; justify-content: flex-end; }
  .orders__tbl { font-size: 12px; }
  .orders__tbl th:nth-child(4), .orders__tbl td:nth-child(4),
  .orders__tbl th:nth-child(7), .orders__tbl td:nth-child(7) { display: none; }
  .actions { flex-direction: column; align-items: stretch; }
}
</style>