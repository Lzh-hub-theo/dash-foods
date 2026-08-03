<script setup lang="ts">
/**
 * dash-foods · 营业状态徽章
 * 营业中：绿色脉冲点；休息中：暗灰
 */
defineProps<{ status: number }>()
</script>

<template>
  <span :class="['status-badge', status === 1 ? 'is-open' : 'is-closed']">
    <span class="dot" />
    <span class="label">{{ status === 1 ? '营业中' : '休息中' }}</span>
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-13);
  font-weight: 600;
  letter-spacing: 0.04em;
  border: 1px solid currentColor;
  background: var(--color-paper);
  color: var(--color-sage-deep);
  transition: all var(--dur-base) var(--ease-out);
}
.status-badge .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  position: relative;
}
.status-badge.is-open .dot {
  color: var(--color-sage);
  animation: pulse-soft 2.2s var(--ease-soft) infinite;
}
.status-badge.is-closed {
  color: var(--color-ink-mute);
  background: var(--color-cream-soft);
  border-color: var(--color-line);
}
.status-badge.is-closed .dot {
  background: var(--color-ink-mute);
}
</style>