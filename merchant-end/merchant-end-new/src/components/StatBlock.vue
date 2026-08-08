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
  padding: 20px 22px 24px;
  border: 1px solid var(--rule);
  background: var(--paper);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 132px;
  transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease), border-color 0.3s var(--ease);
}
.stat:hover { transform: translateY(-3px); box-shadow: 0 12px 28px -14px rgba(10, 10, 10, 0.14); border-color: var(--ink); }
.stat::before {
  content: '';
  position: absolute;
  left: 0; right: 0; top: 0;
  height: 2px;
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
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 300;
  font-size: 44px;
  line-height: 1;
  letter-spacing: -0.02em;
}
.stat__unit {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--ink-muted);
  letter-spacing: 0.1em;
}
.stat__skeleton { font-family: var(--font-mono); font-size: 36px; color: var(--ink-faint); }
.stat__hint { font-family: var(--font-pix); font-size: 10px; color: var(--ink-muted); letter-spacing: 0.16em; text-transform: uppercase; }
</style>