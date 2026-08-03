<script setup lang="ts">
// 大号数据块：标签 + 衬线大字 + 等宽数字 + 副标
defineProps<{
  label: string
  value: string | number
  unit?: string
  hint?: string
  accent?: 'ink' | 'signal' | 'press' | 'olive' | 'amber'
  loading?: boolean
}>()
</script>

<template>
  <div class="stat" :data-accent="accent || 'ink'">
    <div class="dateline stat__label">{{ label }}</div>
    <div class="stat__value-row">
      <span v-if="loading" class="stat__skeleton font-mono">——</span>
      <span v-else class="stat__value headline tnum">{{ value }}</span>
      <span v-if="unit" class="stat__unit font-mono">{{ unit }}</span>
    </div>
    <div v-if="hint" class="stat__hint font-mono">{{ hint }}</div>
  </div>
</template>

<style scoped>
.stat {
  padding: 18px 20px 22px;
  border: 1px solid var(--rule-soft);
  background: var(--paper-deep);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 132px;
}
.stat::before {
  content: '';
  position: absolute;
  left: 0; right: 0; top: 0;
  height: 4px;
  background: var(--ink);
}
.stat[data-accent='signal']::before { background: var(--signal); }
.stat[data-accent='press']::before   { background: var(--press); }
.stat[data-accent='olive']::before   { background: var(--olive); }
.stat[data-accent='amber']::before   { background: var(--amber); }
.stat__label { color: var(--ink-muted); }
.stat__value-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.stat__value {
  font-size: 44px;
  line-height: 1;
  font-weight: 900;
}
.stat__unit {
  font-size: 13px;
  color: var(--ink-muted);
  letter-spacing: 0.1em;
}
.stat__skeleton { font-size: 36px; color: var(--ink-faint); }
.stat__hint { font-size: 11px; color: var(--ink-muted); letter-spacing: 0.12em; text-transform: uppercase; }
</style>