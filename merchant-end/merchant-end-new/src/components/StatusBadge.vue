<script setup lang="ts">
// 订单状态徽章：后端枚举映射
import { computed } from 'vue'

const props = defineProps<{ status: number }>()

interface Meta {
  label: string
  color: string   // CSS var name fragment
  bg: string
}
const META: Record<number, Meta> = {
  1: { label: '待支付',    color: 'amber', bg: 'amber-soft' },
  2: { label: '待接单',    color: 'signal', bg: 'signal-soft' },
  3: { label: '已接单',    color: 'press', bg: 'press-soft' },
  4: { label: '派送中',    color: 'press', bg: 'press-soft' },
  5: { label: '已完成',    color: 'olive', bg: 'olive-soft' },
  6: { label: '已取消',    color: 'ink-muted', bg: 'rule-faint' },
  7: { label: '已退款',    color: 'ink-muted', bg: 'rule-faint' },
}
const meta = computed(() => META[props.status] || META[6])
</script>

<template>
  <span
    class="badge font-mono"
    :style="{
      color: `var(--${meta.color})`,
      background: `var(--${meta.bg})`,
      borderColor: `var(--${meta.color})`,
    }"
  >{{ meta.label.toUpperCase() }}</span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  font-size: 11px;
  letter-spacing: 0.14em;
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;
}
</style>