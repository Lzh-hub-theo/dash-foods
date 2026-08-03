<script setup lang="ts">
// 极简 Modal
import { onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps<{ open: boolean; title?: string; width?: string }>()
const emit = defineEmits<{ 'update:open': [v: boolean]; close: [] }>()

function close() {
  emit('update:open', false)
  emit('close')
}
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }

onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))

watch(() => props.open, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="m-overlay" @click.self="close">
        <div class="m-dialog" :style="{ maxWidth: width || '560px' }">
          <header class="m-head">
            <h3 class="m-title headline">{{ title || '' }}</h3>
            <button class="m-x font-mono" @click="close">CLOSE</button>
          </header>
          <hr class="rule" />
          <div class="m-body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="m-foot">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.m-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20,17,15,0.55);
  z-index: 9000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 60px 20px;
  overflow-y: auto;
  backdrop-filter: blur(2px);
}
.m-dialog {
  width: 100%;
  background: var(--paper);
  border: 2px solid var(--ink);
  box-shadow: 10px 10px 0 var(--ink);
  animation: m-pop .2s var(--ease);
}
@keyframes m-pop {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.m-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
}
.m-title { font-size: 24px; font-weight: 800; }
.m-x {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--ink-muted);
  border: 1px solid var(--rule-soft);
  padding: 6px 10px;
}
.m-x:hover { color: var(--ink); border-color: var(--ink); }
.m-body { padding: 20px 24px; }
.m-foot {
  padding: 14px 24px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  border-top: 1px solid var(--rule-faint);
}
.fade-enter-active, .fade-leave-active { transition: opacity .15s var(--ease); }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>