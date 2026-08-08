<script setup lang="ts">
import type { ShoppingCart } from '@/types/api'

defineProps<{
  item: ShoppingCart
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'sub'): void
}>()
</script>

<template>
  <article class="cart-row">
    <div class="row-img">
      <img
        v-if="item.image"
        :src="item.image"
        :alt="item.name"
        loading="lazy"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <div v-else class="row-fallback">{{ item.name?.slice(0, 1) || '·' }}</div>
    </div>
    <div class="row-body">
      <div class="row-head">
        <h4 class="row-name">{{ item.name }}</h4>
        <div class="row-price">
          <span class="cur">¥</span><span class="num">{{ Math.floor(item.amount) }}</span><span class="frac">{{ Math.round((item.amount % 1) * 100).toString().padStart(2, '0') }}</span>
        </div>
      </div>
      <p v-if="item.dishFlavor" class="row-flavor">{{ item.dishFlavor }}</p>
      <div class="row-foot">
        <span class="row-meta">× ¥{{ item.amount.toFixed(2) }}</span>
        <div class="stepper">
          <button class="step-btn" aria-label="减少" @click="emit('sub')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>
          </button>
          <span class="step-qty">{{ item.number }}</span>
          <button class="step-btn step-add" aria-label="增加" @click="emit('add')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.cart-row {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 14px;
  padding: 14px 4px;
  border-bottom: 1px dashed var(--color-line);
}
.cart-row:last-child {
  border-bottom: 0;
}

.row-img {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-cream-soft);
  flex-shrink: 0;
}
.row-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.row-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FAFAFB;
  font-family: var(--font-display);
  font-size: 28px;
  color: var(--color-sage);
}

.row-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.row-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.row-name {
  font-family: var(--font-body);
  font-size: var(--fs-14);
  font-weight: 600;
  color: var(--color-ink);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.row-price {
  font-family: var(--font-display);
  color: var(--color-apricot-deep);
  display: inline-flex;
  align-items: baseline;
}
.row-price .cur {
  font-size: 11px;
  margin-right: 1px;
}
.row-price .num {
  font-size: var(--fs-18);
  font-weight: 500;
}
.row-price .frac {
  font-size: 11px;
  font-style: italic;
}
.row-flavor {
  font-size: 11px;
  color: var(--color-ink-mute);
  letter-spacing: 0.04em;
}
.row-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}
.row-meta {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-12);
  color: var(--color-ink-mute);
}
.stepper {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
}
.step-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-ink);
  background: transparent;
  transition: background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);
}
.step-btn:hover {
  background: var(--color-sage-mist);
  color: var(--color-sage-deep);
}
.step-btn.step-add {
  background: var(--color-sage);
  color: var(--color-paper);
}
.step-btn.step-add:hover {
  background: var(--color-sage-deep);
}
.step-qty {
  min-width: 22px;
  text-align: center;
  font-family: var(--font-display);
  font-size: var(--fs-14);
  font-weight: 600;
  color: var(--color-ink);
}
</style>