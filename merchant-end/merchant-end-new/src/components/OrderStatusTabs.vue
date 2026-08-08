<script setup lang="ts">
// 大号 status-tab — 顶部"版块"
const props = defineProps<{
  modelValue: number
  tabs: { value: number; label: string; count?: number }[]
}>()
const emit = defineEmits<{ 'update:modelValue': [v: number] }>()

function pick(v: number) { emit('update:modelValue', v) }
</script>

<template>
  <div class="tabs">
    <button
      v-for="t in tabs"
      :key="t.value"
      class="tab font-mono"
      :class="{ 'tab--on': props.modelValue === t.value }"
      @click="pick(t.value)"
    >
      <span class="tab__label">{{ t.label }}</span>
      <span v-if="typeof t.count === 'number'" class="tab__count tnum">{{ t.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  overflow-x: auto;
}
.tab {
  flex: 1 1 0;
  min-width: 96px;
  padding: 14px 18px;
  background: transparent;
  border: none;
  border-right: 1px solid var(--rule-soft);
  color: var(--ink-muted);
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  letter-spacing: 0.18em;
  transition: color .15s var(--ease), background .15s var(--ease);
}
.tab:last-child { border-right: none; }
.tab:hover { color: var(--ink); background: var(--paper-soft); }
.tab--on {
  background: var(--ink);
  color: var(--paper);
}
.tab--on .tab__count { color: var(--paper); }
.tab__label { text-transform: uppercase; font-weight: 500; }
.tab__count { font-size: 13px; }
</style>