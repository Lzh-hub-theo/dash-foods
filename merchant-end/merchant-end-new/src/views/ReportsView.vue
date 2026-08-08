<script setup lang="ts">
// 数据统计报表 / REPORTS
import { computed, onMounted } from 'vue'
import { useReportStore } from '@/stores/report'
import { exportReport } from '@/api/report'
import ChartCard from '@/components/ChartCard.vue'
import StatBlock from '@/components/StatBlock.vue'
import EmptyState from '@/components/EmptyState.vue'

const store = useReportStore()

// 净白像素图表主题：纯白底 + 墨黑线 + 钢灰青冷点缀
const FONT = '"Fraunces", "Noto Serif SC", serif'
const MONO = '"JetBrains Mono", monospace'

const turnoverOption = computed(() => {
  const { dates, values } = store.turnoverChart
  return {
    grid: { left: 50, right: 24, top: 36, bottom: 36 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0A0A0A',
      borderColor: '#0A0A0A',
      textStyle: { color: '#FFFFFF', fontFamily: MONO, fontSize: 12 },
      formatter: (params: { axisValueLabel: string; value: number }[]) => {
        const p = params[0]
        return `${p.axisValueLabel}<br/><b>¥ ${Number(p.value).toFixed(2)}</b>`
      },
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#0A0A0A', width: 1 } },
      axisTick: { show: false },
      axisLabel: { color: '#6B7280', fontFamily: MONO, fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#EEF0F3', type: 'dashed' } },
      axisLabel: { color: '#6B7280', fontFamily: MONO, fontSize: 11, formatter: (v: number) => `¥${v}` },
    },
    series: [{
      type: 'line',
      name: '营业额',
      data: values,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#475569', width: 2.5 },
      itemStyle: { color: '#475569', borderColor: '#FFFFFF', borderWidth: 2 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(71, 85, 105, 0.18)' },
            { offset: 1, color: 'rgba(71, 85, 105, 0)' },
          ],
        },
      },
    }],
  }
})

const userOption = computed(() => {
  const { dates, newUsers, totalUsers } = store.userChart
  return {
    grid: { left: 50, right: 24, top: 56, bottom: 36 },
    legend: {
      top: 8, right: 4,
      textStyle: { color: '#374151', fontFamily: MONO, fontSize: 11 },
      icon: 'rect',
      itemWidth: 12, itemHeight: 8,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0A0A0A', borderColor: '#0A0A0A',
      textStyle: { color: '#FFFFFF', fontFamily: MONO, fontSize: 12 },
    },
    xAxis: {
      type: 'category', data: dates,
      axisLine: { lineStyle: { color: '#0A0A0A' } },
      axisTick: { show: false },
      axisLabel: { color: '#6B7280', fontFamily: MONO, fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false }, axisTick: { show: false },
      splitLine: { lineStyle: { color: '#EEF0F3', type: 'dashed' } },
      axisLabel: { color: '#6B7280', fontFamily: MONO, fontSize: 11 },
    },
    series: [
      {
        type: 'line', name: '新增用户', data: newUsers,
        smooth: true, symbol: 'circle', symbolSize: 5,
        lineStyle: { color: '#475569', width: 2 },
        itemStyle: { color: '#475569' },
      },
      {
        type: 'line', name: '用户总量', data: totalUsers,
        smooth: true, symbol: 'circle', symbolSize: 5,
        lineStyle: { color: '#334155', width: 2 },
        itemStyle: { color: '#334155' },
      },
    ],
  }
})

const orderOption = computed(() => {
  const { dates, total, valid } = store.orderChart
  return {
    grid: { left: 50, right: 24, top: 56, bottom: 36 },
    legend: {
      top: 8, right: 4,
      textStyle: { color: '#374151', fontFamily: MONO, fontSize: 11 },
      icon: 'rect', itemWidth: 12, itemHeight: 8,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0A0A0A', borderColor: '#0A0A0A',
      textStyle: { color: '#FFFFFF', fontFamily: MONO, fontSize: 12 },
    },
    xAxis: {
      type: 'category', data: dates,
      axisLine: { lineStyle: { color: '#0A0A0A' } },
      axisTick: { show: false },
      axisLabel: { color: '#6B7280', fontFamily: MONO, fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false }, axisTick: { show: false },
      splitLine: { lineStyle: { color: '#EEF0F3', type: 'dashed' } },
      axisLabel: { color: '#6B7280', fontFamily: MONO, fontSize: 11 },
    },
    series: [
      {
        type: 'bar', name: '总订单', data: total,
        barMaxWidth: 14,
        itemStyle: { color: '#334155' },
      },
      {
        type: 'bar', name: '有效订单', data: valid,
        barMaxWidth: 14,
        itemStyle: { color: '#475569' },
      },
    ],
  }
})

const top10Option = computed(() => {
  const { names, counts } = store.top10Chart
  // echarts 横条按值降序，从下到上展示
  const revNames = [...names].reverse()
  const revCounts = [...counts].reverse()
  return {
    grid: { left: 110, right: 36, top: 24, bottom: 24 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0A0A0A', borderColor: '#0A0A0A',
      textStyle: { color: '#FFFFFF', fontFamily: MONO, fontSize: 12 },
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false }, axisTick: { show: false },
      splitLine: { lineStyle: { color: '#EEF0F3', type: 'dashed' } },
      axisLabel: { color: '#6B7280', fontFamily: MONO, fontSize: 11 },
    },
    yAxis: {
      type: 'category', data: revNames,
      axisLine: { lineStyle: { color: '#0A0A0A' } },
      axisTick: { show: false },
      axisLabel: { color: '#0A0A0A', fontFamily: FONT, fontSize: 13, fontWeight: 400 },
    },
    series: [{
      type: 'bar', name: '销量',
      data: revCounts,
      barMaxWidth: 18,
      itemStyle: { color: '#475569' },
      label: {
        show: true, position: 'right',
        color: '#0A0A0A', fontFamily: MONO, fontSize: 11,
        formatter: (p: { value: number }) => `${p.value}`,
      },
    }],
  }
})

// ===== Key stats =====
const totalTurnover = computed(() => {
  const arr = store.turnoverChart.values
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0)
})

const totalValidOrders = computed(() => store.order?.validOrderCount ?? 0)
const completionRate = computed(() => {
  const r = store.order?.orderCompletionRate ?? 0
  return (r * 100)
})

function fmtMoney(n: number) {
  return `¥${n.toFixed(2)}`
}
function fmtPct(n: number) {
  return `${n.toFixed(1)}%`
}

// ===== Actions =====
async function applyFilter() {
  if (!store.query.begin || !store.query.end) return
  if (store.query.begin > store.query.end) return
  await store.fetchAll()
}

function quickRange(days: number) {
  store.setRange(days)
  applyFilter()
}

async function onExport() {
  await exportReport()
}

onMounted(() => {
  store.fetchAll()
})
</script>

<template>
  <section class="reports">
    <header class="reports__head">
      <span class="dateline">§ REPORTS · 数据报表</span>
    </header>

    <hr class="rule-thick" />

    <!-- 区间筛选 -->
    <div class="reports__filters">
      <label class="field">
        <span class="field__label dateline">FROM · 起始</span>
        <input v-model="store.query.begin" type="date" class="input" />
      </label>
      <label class="field">
        <span class="field__label dateline">TO · 截止</span>
        <input v-model="store.query.end" type="date" class="input" />
      </label>
      <div class="reports__quick">
        <button class="btn btn-sm btn-ghost" @click="quickRange(1)">今日</button>
        <button class="btn btn-sm btn-ghost" @click="quickRange(7)">近 7 日</button>
        <button class="btn btn-sm btn-ghost" @click="quickRange(30)">近 30 日</button>
      </div>
      <div class="reports__apply">
        <button class="btn btn-sm" @click="applyFilter">应用</button>
        <button class="btn btn-sm btn-ghost" @click="onExport">导出 Excel</button>
      </div>
    </div>

    <!-- § 01 关键指标 -->
    <section class="reports__section">
      <div class="reports__sec-head">
        <span class="dateline">§ 01</span>
        <h3 class="reports__sec-title">KEY FIGURES · 关键指标</h3>
      </div>
      <div class="reports__stats">
        <StatBlock
          label="TURNOVER · 营业额"
          :value="fmtMoney(totalTurnover)"
          unit="CNY"
          accent="signal"
          :loading="store.loading"
        />
        <StatBlock
          label="有效订单"
          :value="totalValidOrders"
          unit="单"
          accent="olive"
          :loading="store.loading"
        />
        <StatBlock
          label="订单完成率"
          :value="fmtPct(completionRate)"
          accent="press"
          :loading="store.loading"
        />
        <StatBlock
          label="NEW USERS · 新增用户"
          :value="(store.userChart.newUsers || []).reduce((a, b) => a + b, 0)"
          unit="人"
          :loading="store.loading"
        />
      </div>
    </section>

    <!-- § 02 营业额 -->
    <section class="reports__section">
      <div class="reports__sec-head">
        <span class="dateline">§ 02</span>
        <h3 class="reports__sec-title">TURNOVER · 营业额走势</h3>
      </div>
      <ChartCard
        title="营业额"
        section="每日营业额（CNY）"
        :option="turnoverOption"
        :loading="store.loading"
      />
    </section>

    <!-- § 03 用户 + § 04 订单 双栏 -->
    <section class="reports__section reports__section--2col">
      <div class="reports__col">
        <div class="reports__sec-head">
          <span class="dateline">§ 03</span>
          <h3 class="reports__sec-title">USERS · 用户增长</h3>
        </div>
        <ChartCard
          title="用户"
          section="新增 / 总量"
          :option="userOption"
          :loading="store.loading"
        />
      </div>
      <div class="reports__col">
        <div class="reports__sec-head">
          <span class="dateline">§ 04</span>
          <h3 class="reports__sec-title">ORDERS · 订单量</h3>
        </div>
        <ChartCard
          title="订单"
          section="总订单 / 有效订单"
          :option="orderOption"
          :loading="store.loading"
        />
      </div>
    </section>

    <!-- § 05 Top 10 -->
    <section class="reports__section">
      <div class="reports__sec-head">
        <span class="dateline">§ 05</span>
        <h3 class="reports__sec-title">TOP 10 · 销量榜</h3>
      </div>
      <EmptyState v-if="store.top10Chart.names.length === 0" message="暂无销量数据" hint="PICK A WIDER RANGE" />
      <ChartCard
        v-else
        title="销量榜 TOP 10"
        section="区间内销量前 10 名菜品"
        :option="top10Option"
        :loading="store.loading"
        height="380px"
      />
    </section>

    <!-- § 06 订单汇总表 -->
    <section class="reports__section">
      <div class="reports__sec-head">
        <span class="dateline">§ 06</span>
        <h3 class="reports__sec-title">ORDER SUMMARY · 订单汇总</h3>
      </div>
      <div class="reports__summary">
        <div class="reports__sum-cell">
          <div class="dateline reports__sum-label">TOTAL · 订单总数</div>
          <div class="reports__sum-value tnum">{{ store.order?.totalOrderCount ?? 0 }}</div>
        </div>
        <div class="reports__sum-cell">
          <div class="dateline reports__sum-label">VALID · 有效订单</div>
          <div class="reports__sum-value tnum">{{ store.order?.validOrderCount ?? 0 }}</div>
        </div>
        <div class="reports__sum-cell">
          <div class="dateline reports__sum-label">COMPLETION · 完成率</div>
          <div class="reports__sum-value tnum">{{ fmtPct(completionRate) }}</div>
        </div>
        <div class="reports__sum-cell">
          <div class="dateline reports__sum-label">RANGE · 区间</div>
          <div class="reports__sum-value reports__sum-range font-mono">
            {{ store.query.begin }}<br />~ {{ store.query.end }}
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.reports { display: flex; flex-direction: column; gap: 14px; }
.reports__head {
  display: flex; align-items: flex-end; gap: 18px;
  padding-top: 4px;
}
.reports__head .dateline {
  font-family: var(--font-pix);
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}

/* 筛选条 */
.reports__filters {
  display: grid;
  grid-template-columns: 200px 200px auto auto;
  gap: 12px; align-items: end;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--rule);
}
.field { display: flex; flex-direction: column; gap: 4px; }
.field__label { color: var(--ink-muted); }
.reports__quick { display: flex; gap: 6px; }
.reports__apply { display: flex; gap: 6px; justify-content: flex-end; }

/* 章节 */
.reports__section { display: flex; flex-direction: column; gap: 10px; }
.reports__section--2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.reports__col { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.reports__sec-head {
  display: flex; align-items: baseline; gap: 12px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--rule-soft);
}
.reports__sec-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 18px;
  letter-spacing: -0.01em;
  margin: 0;
}

/* 关键指标 */
.reports__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

/* 汇总表 */
.reports__summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.reports__sum-cell {
  padding: 18px 20px;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-top: 2px solid var(--ink);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease), border-color 0.3s var(--ease);
}
.reports__sum-cell:hover { transform: translateY(-3px); box-shadow: 0 12px 28px -14px rgba(10, 10, 10, 0.14); border-color: var(--ink); }
.reports__sum-cell:nth-child(2) { border-top-color: var(--olive); }
.reports__sum-cell:nth-child(3) { border-top-color: var(--press); }
.reports__sum-cell:nth-child(4) { border-top-color: var(--amber); }
.reports__sum-label { color: var(--ink-muted); }
.reports__sum-value {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 300;
  font-size: 30px;
  line-height: 1;
  letter-spacing: -0.02em;
}
.reports__sum-range {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.04em;
}

@media (max-width: 1100px) {
  .reports__filters { grid-template-columns: 1fr 1fr; }
  .reports__quick, .reports__apply { grid-column: 1 / -1; }
  .reports__section--2col { grid-template-columns: 1fr; }
  .reports__stats, .reports__summary { grid-template-columns: repeat(2, 1fr); }
}
</style>