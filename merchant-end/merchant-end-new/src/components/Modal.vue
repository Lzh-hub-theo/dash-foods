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
  background: rgba(10, 10, 10, 0.45);
  z-index: 9000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 60px 20px;
  overflow-y: auto;
  backdrop-filter: blur(4px);
}
.m-dialog {
  width: 100%;
  background: var(--paper);
  border: 1px solid var(--rule);
  box-shadow: 0 24px 48px -16px rgba(10, 10, 10, 0.28);
  animation: m-pop .25s var(--ease);
}
@keyframes m-pop {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.m-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
}
.m-title { font-size: 24px; font-weight: 400; font-style: italic; }
.m-x {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.18em;
  color: var(--ink-muted);
  border: 1px solid var(--rule);
  padding: 6px 10px;
  transition: border-color 0.18s var(--ease), color 0.18s var(--ease);
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