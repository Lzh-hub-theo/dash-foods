<script setup lang="ts">
// 启停状态 pill（0=停用/灰墨、1=启用/鼠尾草绿），点击可切换；v-model=loading 控制禁用
import { ref, computed } from 'vue'

const props = defineProps<{
  status: number              // 0 or 1
  loading?: boolean
  onLabel?: string
  offLabel?: string
}>()
const emit = defineEmits<{ toggle: [] }>()

const busy = ref(false)
const isOn = computed(() => props.status === 1)

async function onClick() {
  if (props.loading || busy.value) return
  busy.value = true
  try { emit('toggle') } finally { busy.value = false }
}
</script>

<template>
  <button
    class="pill"
    :class="isOn ? 'pill--on' : 'pill--off'"
    :disabled="loading || busy"
    @click.stop="onClick"
  >
    <span class="pill__dot" />
    <span class="pill__label">{{ isOn ? (onLabel || 'ON SALE') : (offLabel || 'OFF SHELF') }}</span>
  </button>
</template>

<style scoped>
.pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px;
  border: 1px solid var(--rule);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  cursor: pointer;
  transition: background 0.15s var(--ease), color 0.15s var(--ease);
}
.pill:hover { background: var(--ink); color: var(--paper); border-color: var(--ink); }
.pill:disabled { opacity: 0.5; cursor: wait; }

.pill__dot {
  width: 6px; height: 6px; border-radius: 50%;
  display: inline-block;
}
.pill--on { background: var(--paper); color: var(--ink); }
.pill--on .pill__dot { background: var(--olive); box-shadow: 0 0 0 3px var(--olive-soft); }
.pill--off { background: var(--paper-deep); color: var(--ink-muted); border-color: var(--rule-soft); }
.pill--off .pill__dot { background: var(--ink-faint); }
</style>