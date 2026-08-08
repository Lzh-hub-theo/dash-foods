<script setup lang="ts">
defineProps<{ message?: string; hint?: string }>()
</script>

<template>
  <div class="empty">
    <div class="empty__mark">—</div>
    <div class="empty__msg headline">{{ message || '暂无数据' }}</div>
    <div v-if="hint" class="empty__hint font-mono">{{ hint }}</div>
  </div>
</template>

<style scoped>
.empty {
  padding: 64px 24px;
  text-align: center;
  color: var(--ink-muted);
  border: 1px dashed var(--rule);
  background: var(--paper-deep);
}
.empty__mark {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 300;
  font-size: 56px;
  line-height: 1;
  margin-bottom: 12px;
  letter-spacing: 0.1em;
  color: var(--ink-faint);
}
.empty__msg {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 400;
  color: var(--ink);
  margin-bottom: 6px;
}
.empty__hint {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
</style>