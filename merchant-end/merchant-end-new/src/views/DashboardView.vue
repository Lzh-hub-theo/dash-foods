<script setup lang="ts">
// 工作台 / THE DESK
// 4 块统计 + 订单状态堆叠条 + 今日分类一览（donut）+ 最新待办订单 + 今日 Top10
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { useShopStore } from '@/stores/shop'
import { useOrderStore } from '@/stores/order'
import { useReportStore } from '@/stores/report'
import StatusBadge from '@/components/StatusBadge.vue'
import StatBlock from '@/components/StatBlock.vue'
import EmptyState from '@/components/EmptyState.vue'
import ChartCard from '@/components/ChartCard.vue'
import { getOrderStatistics } from '@/api/order'

const ws = useWorkspaceStore()
const shop = useShopStore()
const order = useOrderStore()
const report = useReportStore()

let timer: number | null = null
const stats = ref<{ toBeConfirmed: number; confirmed: number; deliveryInProgress: number } | null>(null)

const MONO = '"IBM Plex Mono", monospace'
const FONT = '"Fraunces", "Noto Serif SC", serif'

async function refreshStats() {
  stats.value = await getOrderStatistics().catch(() => null)
}

async function refreshAll() {
  await Promise.all([
    ws.fetchAll(),
    shop.fetchStatus(),
    refreshStats(),
    order.search({ page: 1, pageSize: 5, status: 2 }),
    report.fetchTodayTop10(),
  ])
}

onMounted(async () => {
  await refreshAll()
  // 每 30s 轻刷一次
  timer = window.setInterval(refreshAll, 30_000)
})

onBeforeUnmount(() => { if (timer) clearInterval(timer) })

const totalOrders = computed(() => ws.orders.allOrders || 0)
const pipelineTotal = computed(
  () =>
    (stats.value?.toBeConfirmed || 0) +
    (stats.value?.confirmed || 0) +
    (stats.value?.deliveryInProgress || 0),
)

function pct(n: number) {
  const t = pipelineTotal.value || 1
  return Math.min(100, Math.round((n / t) * 100))
}

const now = new Date()
const issue = computed(() => `VOL. I · NO. ${String(now.getDate()).padStart(2, '0')}`)
const dateline = computed(() =>
  now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase(),
)

// ===== § 03 Donut =====
const breakdown = computed(() => {
  const dSold = ws.dishes.sold || 0
  const dOff = ws.dishes.discontinued || 0
  const sSold = ws.setmeals.sold || 0
  const sOff = ws.setmeals.discontinued || 0
  return [
    { name: '菜品在售', value: dSold, color: '#C8341C' },
    { name: '菜品停售', value: dOff,  color: '#9C9384' },
    { name: '套餐在售', value: sSold, color: '#1A3A5C' },
    { name: '套餐停售', value: sOff,  color: '#4F5B3A' },
  ]
})

const breakdownTotal = computed(() =>
  breakdown.value.reduce((a, b) => a + b.value, 0),
)

const donutOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: '#14110F', borderColor: '#14110F',
    textStyle: { color: '#F6F1E4', fontFamily: MONO, fontSize: 12 },
    formatter: (p: { name: string; value: number; percent: number }) =>
      `${p.name}<br/><b>${p.value}</b> · ${p.percent.toFixed(1)}%`,
  },
  series: [{
    type: 'pie',
    radius: ['62%', '88%'],
    center: ['50%', '50%'],
    avoidLabelOverlap: true,
    itemStyle: {
      borderColor: '#F6F1E4',
      borderWidth: 2,
    },
    label: {
      show: true, position: 'outside',
      color: '#14110F',
      fontFamily: FONT, fontWeight: 700, fontSize: 11,
      formatter: (p: { name: string; percent: number }) =>
        `${p.name}\n${p.percent.toFixed(0)}%`,
    },
    labelLine: { length: 8, length2: 8 },
    data: breakdown.value,
  }],
}))

// ===== § 05 今日 Top10 =====
const todayTop10Option = computed(() => {
  const { names, counts } = report.todayTop10Chart
  // 横条，从下到上展示（高销量在顶）
  const top = names.slice(0, 10)
  const topCounts = counts.slice(0, 10)
  const revNames = [...top].reverse()
  const revCounts = [...topCounts].reverse()
  const maxVal = Math.max(1, ...topCounts)
  return {
    grid: { left: 130, right: 56, top: 8, bottom: 8 },
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' },
      backgroundColor: '#14110F', borderColor: '#14110F',
      textStyle: { color: '#F6F1E4', fontFamily: MONO, fontSize: 12 },
    },
    xAxis: {
      type: 'value', max: maxVal,
      axisLine: { show: false }, axisTick: { show: false },
      splitLine: { lineStyle: { color: '#DDD5BF', type: 'dashed' } },
      axisLabel: {
        color: '#6B6357', fontFamily: MONO, fontSize: 10,
        formatter: (v: number) => `${v}`,
      },
    },
    yAxis: {
      type: 'category', data: revNames,
      axisLine: { lineStyle: { color: '#14110F' } },
      axisTick: { show: false },
      axisLabel: { color: '#14110F', fontFamily: FONT, fontSize: 12, fontWeight: 600 },
    },
    series: [{
      type: 'bar', name: '销量',
      data: revCounts,
      barMaxWidth: 14,
      itemStyle: { color: '#C8341C' },
      label: {
        show: true, position: 'right',
        color: '#14110F', fontFamily: MONO, fontSize: 10,
      },
    }],
  }
})
</script>

<template>
  <section class="desk">
    <!-- HERO / 头版头条 -->
    <header class="desk__hero">
      <div class="hero__col">
        <div class="dateline">{{ dateline }} · {{ issue }}</div>
        <h1 class="hero__title headline">TODAY AT<br />THE DESK.</h1>
        <p class="hero__lede">
          今天的营业、订单与菜单正在此集结。
          {{ shop.isOpen ? '门店已开张，订单正陆续涌入。' : '门店处于打烊状态，可前往「营业状态」一键开张。' }}
        </p>
      </div>
      <div class="hero__col hero__col--right">
        <div class="hero__weather">
          <div class="dateline">SERVICE</div>
          <div class="hero__weather-row">
            <span class="hero__big tnum headline">{{ shop.isOpen ? 'OPEN' : 'CLOSED' }}</span>
            <span class="font-mono hero__weather-sub">{{ shop.statusLabel.toUpperCase() }}</span>
          </div>
          <div class="dateline">LIVE ORDERS</div>
          <div class="hero__big hero__big--sm tnum headline">{{ pipelineTotal }}</div>
        </div>
      </div>
    </header>

    <hr class="rule-thick" />

    <!-- § 01 4 块统计 -->
    <h3 class="desk__section-title headline">
      <span class="desk__no font-mono">§ 01</span>
      TODAY'S NUMBERS · 今日运营数据
    </h3>

    <div class="desk__stats">
      <StatBlock
        label="TURNOVER · 营业额"
        :value="ws.business.turnover.toFixed(2)"
        unit="¥"
        accent="ink"
        :loading="ws.loading"
        hint="TODAY · 实时"
      />
      <StatBlock
        label="VALID ORDERS · 有效订单"
        :value="ws.business.validOrderCount"
        unit="单"
        accent="press"
        :loading="ws.loading"
        :hint="`COMPLETION ${(ws.business.orderCompletionRate * 100).toFixed(1)}%`"
      />
      <StatBlock
        label="NEW USERS · 新增用户"
        :value="ws.business.newUsers"
        unit="人"
        accent="olive"
        :loading="ws.loading"
        hint="TODAY · 实时"
      />
      <StatBlock
        label="AVG PRICE · 客单价"
        :value="ws.business.unitPrice.toFixed(2)"
        unit="¥"
        accent="signal"
        :loading="ws.loading"
        hint="PER ORDER"
      />
    </div>

    <!-- § 02 订单流转堆叠条 -->
    <h3 class="desk__section-title headline">
      <span class="desk__no font-mono">§ 02</span>
      ORDER FLOW · 订单流转
    </h3>

    <div class="desk__flow">
      <div class="flow__bar" :aria-label="`总进行中订单 ${pipelineTotal}`">
        <div
          class="flow__seg flow__seg--signal"
          :style="{ flex: stats?.toBeConfirmed || 0 }"
          :title="`待接单 ${stats?.toBeConfirmed || 0}`"
        >
          <span class="flow__seg-label font-mono">TO-CONFIRM · {{ stats?.toBeConfirmed || 0 }}</span>
        </div>
        <div
          class="flow__seg flow__seg--press"
          :style="{ flex: stats?.confirmed || 0 }"
          :title="`已接单 ${stats?.confirmed || 0}`"
        >
          <span class="flow__seg-label font-mono">CONFIRMED · {{ stats?.confirmed || 0 }}</span>
        </div>
        <div
          class="flow__seg flow__seg--olive"
          :style="{ flex: stats?.deliveryInProgress || 0 }"
          :title="`派送中 ${stats?.deliveryInProgress || 0}`"
        >
          <span class="flow__seg-label font-mono">DELIVERY · {{ stats?.deliveryInProgress || 0 }}</span>
        </div>
      </div>
      <div class="flow__legend font-mono">
        <span>WAITING · 0%</span>
        <span>{{ pct(stats?.toBeConfirmed || 0) }}% TO-CONFIRM</span>
        <span>{{ pct(stats?.confirmed || 0) }}% CONFIRMED</span>
        <span>{{ pct(stats?.deliveryInProgress || 0) }}% DELIVERY</span>
      </div>
    </div>

    <!-- § 03 / § 04 双栏：今日分类一览 + 最新待接订单 -->
    <div class="desk__row">
      <article class="desk__col">
        <div class="desk__col-head">
          <span class="dateline">§ 03 · OVERVIEW</span>
          <h4 class="desk__col-title headline">今日分类一览</h4>
        </div>
        <hr class="rule" />
        <div class="overview">
          <div class="overview__chart">
            <ChartCard
              v-if="breakdownTotal > 0"
              title="BREAKDOWN"
              section="菜品/套餐在售 vs 停售"
              :option="donutOption"
              :loading="ws.loading"
              height="220px"
            />
            <EmptyState v-else message="暂无菜单数据" hint="ADD DISHES TO START" />
          </div>
          <dl class="overview__list">
            <div class="overview__row">
              <dt>DISHES SOLD</dt>
              <dd class="tnum">{{ ws.dishes.sold }}</dd>
            </div>
            <div class="overview__row">
              <dt>DISHES OFF</dt>
              <dd class="tnum">{{ ws.dishes.discontinued }}</dd>
            </div>
            <div class="overview__row">
              <dt>SETMEALS SOLD</dt>
              <dd class="tnum">{{ ws.setmeals.sold }}</dd>
            </div>
            <div class="overview__row">
              <dt>SETMEALS OFF</dt>
              <dd class="tnum">{{ ws.setmeals.discontinued }}</dd>
            </div>
            <div class="overview__row overview__row--accent">
              <dt>ORDERS · ALL</dt>
              <dd class="tnum">{{ totalOrders }}</dd>
            </div>
          </dl>
        </div>
      </article>

      <article class="desk__col desk__col--wide">
        <div class="desk__col-head">
          <span class="dateline">§ 04 · INCOMING</span>
          <h4 class="desk__col-title headline">最新待接订单</h4>
          <router-link class="desk__more font-mono" :to="{ name: 'orders' }">VIEW ALL →</router-link>
        </div>
        <hr class="rule" />
        <div v-if="order.loading && order.list.length === 0" class="desk__loading font-mono">LOADING…</div>
        <EmptyState v-else-if="order.list.length === 0" message="今日暂无待接订单" hint="WAITING FOR INCOMING" />
        <ul v-else class="incoming">
          <li v-for="o in order.list" :key="o.id" class="incoming__item">
            <div class="incoming__no">
              <div class="dateline">NO.</div>
              <div class="font-mono tnum incoming__no-val">{{ o.number }}</div>
            </div>
            <div class="incoming__user">
              <div class="incoming__name">{{ o.consignee || o.userName || '客户' }}</div>
              <div class="font-mono incoming__phone">{{ o.phone || '——' }}</div>
            </div>
            <div class="incoming__amount">
              <div class="dateline">AMT</div>
              <div class="tnum font-mono incoming__amount-val">¥{{ o.amount.toFixed(2) }}</div>
            </div>
            <StatusBadge :status="o.status" />
          </li>
        </ul>
      </article>
    </div>

    <!-- § 05 今日 Top 10 -->
    <h3 class="desk__section-title headline">
      <span class="desk__no font-mono">§ 05</span>
      TODAY'S TOP 10 · 今日销量榜
      <router-link class="desk__more font-mono" :to="{ name: 'reports' }">FULL REPORT →</router-link>
    </h3>

    <article class="desk__col desk__col--full">
      <div v-if="report.todayTop10Loading && report.todayTop10Chart.names.length === 0" class="desk__loading font-mono">
        LOADING…
      </div>
      <EmptyState v-else-if="report.todayTop10Chart.names.length === 0" message="今日暂无销售记录" hint="ORDERS WILL APPEAR HERE" />
      <ChartCard
        v-else
        title="TODAY'S TOP 10"
        section="按销量降序，最多 10 项"
        :option="todayTop10Option"
        :loading="report.todayTop10Loading"
        height="380px"
      />
    </article>
  </section>
</template>

<style scoped>
.desk { display: flex; flex-direction: column; gap: 28px; }

.desk__hero {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 36px;
  padding: 12px 0 8px;
}
.hero__col { display: flex; flex-direction: column; gap: 8px; }
.hero__col--right { align-items: flex-end; }
.hero__title {
  font-size: clamp(56px, 8vw, 96px);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 0.88;
}
.hero__lede {
  font-family: var(--font-display);
  font-size: 18px;
  line-height: 1.5;
  color: var(--ink);
  max-width: 52ch;
  margin-top: 4px;
}
.hero__weather {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: right;
  border: 2px solid var(--ink);
  padding: 16px 22px;
  background: var(--paper-deep);
  min-width: 280px;
}
.hero__weather-row { display: flex; align-items: baseline; justify-content: flex-end; gap: 10px; }
.hero__big { font-size: 44px; font-weight: 900; line-height: 1; }
.hero__big--sm { font-size: 28px; margin-top: 4px; }
.hero__weather-sub { font-size: 11px; letter-spacing: 0.2em; color: var(--ink-muted); }

.desk__section-title {
  display: flex;
  align-items: baseline;
  gap: 14px;
  font-size: 22px;
  font-weight: 800;
  border-bottom: 1px solid var(--rule);
  padding-bottom: 10px;
  margin-bottom: 4px;
  flex: 1 1 auto;
}
.desk__no {
  font-size: 11px;
  letter-spacing: 0.24em;
  color: var(--ink-muted);
}
.desk__more {
  margin-left: auto;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--ink-muted);
}
.desk__more:hover { color: var(--signal); }

.desk__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

/* Flow */
.desk__flow { display: flex; flex-direction: column; gap: 8px; }
.flow__bar {
  display: flex;
  height: 56px;
  border: 2px solid var(--ink);
  overflow: hidden;
}
.flow__seg {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  border-right: 1px solid var(--ink);
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--paper);
  transition: flex .35s var(--ease);
  white-space: nowrap;
}
.flow__seg:last-child { border-right: none; }
.flow__seg--signal { background: var(--signal); }
.flow__seg--press  { background: var(--press); }
.flow__seg--olive  { background: var(--olive); }
.flow__seg-label { padding: 0 10px; }
.flow__legend {
  display: flex;
  gap: 18px;
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}

/* Row */
.desk__row {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 20px;
}
.desk__col {
  background: var(--paper-deep);
  border: 1px solid var(--rule-soft);
  padding: 18px 20px;
}
.desk__col--wide { /* default wide via row grid */ }
.desk__col--full { width: 100%; }
.desk__col-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 8px;
}
.desk__col-title {
  font-size: 20px;
  font-weight: 800;
  flex: 1;
}

/* § 03 overview */
.overview {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.overview__chart {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 220px;
}
.overview__list { display: flex; flex-direction: column; }
.overview__row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: baseline;
  padding: 10px 0;
  border-bottom: 1px solid var(--rule-faint);
}
.overview__row:last-child { border-bottom: none; }
.overview__row--accent { background: var(--paper-soft); margin: 0 -20px; padding: 10px 20px; border-top: 2px solid var(--ink); border-bottom: 2px solid var(--ink); }
.overview__row dt {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--ink-muted);
  text-transform: uppercase;
}
.overview__row dd {
  margin: 0;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
}

/* Incoming */
.incoming { display: flex; flex-direction: column; }
.incoming__item {
  display: grid;
  grid-template-columns: 120px 1fr auto auto;
  gap: 14px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--rule-faint);
}
.incoming__item:last-child { border-bottom: none; }
.incoming__no-val { font-size: 13px; }
.incoming__name { font-family: var(--font-display); font-weight: 700; font-size: 16px; }
.incoming__phone { font-size: 11px; letter-spacing: 0.14em; color: var(--ink-muted); }
.incoming__amount-val { font-weight: 600; font-size: 15px; }

.desk__loading {
  padding: 32px 0;
  text-align: center;
  letter-spacing: 0.22em;
  color: var(--ink-muted);
}

@media (max-width: 1100px) {
  .desk__stats { grid-template-columns: repeat(2, 1fr); }
  .desk__row { grid-template-columns: 1fr; }
  .desk__hero { grid-template-columns: 1fr; }
  .hero__col--right { align-items: flex-start; }
}
</style>