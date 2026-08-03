<script setup lang="ts">
// 报刊感图表卡片：黑边纸基 + 衬线标题 + ECharts 容器
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  TransformComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import VChart from 'vue-echarts'

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  TransformComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
])

const props = withDefaults(
  defineProps<{
    /** 区块标题 */
    title: string
    /** 副标 / 章节号 */
    section?: string
    /** ECharts 配置 */
    option: echarts.EChartsCoreOption
    /** 高度 */
    height?: string
    /** 加载中 */
    loading?: boolean
  }>(),
  { height: '320px', loading: false },
)

const chartRef = ref<InstanceType<typeof VChart> | null>(null)
const ready = shallowRef(false)

// 等下一帧再让图表 resize，避免首次渲染时容器尺寸未稳定
watch(
  chartRef,
  (el) => {
    if (el) requestAnimationFrame(() => { ready.value = true })
  },
)

onBeforeUnmount(() => { ready.value = false })

const style = computed(() => ({ height: props.height, width: '100%' }))
</script>

<template>
  <article class="card">
    <header class="card__head">
      <span v-if="section" class="dateline card__section">{{ section }}</span>
      <h3 class="card__title">{{ title }}</h3>
    </header>
    <hr class="rule" />
    <div class="card__body">
      <div v-if="loading" class="card__loading font-mono">LOADING…</div>
      <VChart v-else ref="chartRef" :option="option" :style="style" autoresize />
    </div>
  </article>
</template>

<style scoped>
.card {
  background: var(--paper);
  border: 1px solid var(--rule-soft);
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.card__head {
  padding: 14px 18px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.card__section { color: var(--ink-muted); }
.card__title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 22px;
  line-height: 1.1;
  letter-spacing: -0.01em;
  margin: 0;
}
.card__body { padding: 12px 14px 16px; position: relative; }
.card__loading {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; letter-spacing: 0.22em;
  color: var(--ink-faint);
}
</style>