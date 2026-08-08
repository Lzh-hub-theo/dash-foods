<script setup lang="ts">
/**
 * dash-foods · 菜品口味选择 BottomSheet
 *
 * 规格数据结构（沿用 sky-server 的 dishFlavor）：
 *   DishFlavor.value = "[\"辣度\",\"甜度\"]"
 *   DishFlavor.name  = "选项,如[微辣,中辣,重辣]" 或 "微辣"
 *
 * 这里把 value 解析成数组，单规格直接展示；多规格按列分组的 chip 选择。
 */
import { computed, ref, watch } from 'vue'
import { useFlavorStore } from '@/stores/flavor'
import { useCartStore } from '@/stores/cart'
import { ElMessage } from '@/api/notify'
import type { DishFlavor } from '@/types/api'

const flavor = useFlavorStore()
const cart = useCartStore()

/** 已选项：title -> option */
const selected = ref<Record<string, string>>({})
/** 已交互（用户点过 chip 才算"已确认"） */
const touched = ref<Record<string, boolean>>({})
/** 提交时尝试过、未通过的组（用于高亮未选组） */
const invalidGroups = ref<Set<string>>(new Set())
const counter = ref(1)
const sheetRef = ref<HTMLElement | null>(null)

interface FlavorGroup {
  title: string
  options: string[]
}

const groups = computed<FlavorGroup[]>(() => {
  const list = flavor.dish?.flavors || []
  return list.map((f: DishFlavor) => parseGroup(f))
})

function parseGroup(f: DishFlavor): FlavorGroup {
  let options: string[] = []
  try {
    // 后端常见：name = "微辣,中辣,重辣" 或 value = "[\"微辣\",\"中辣\"]"
    const raw = (f.name || '').replace(/^[[【\[]+|[\]】\]]+$/g, '').trim()
    if (raw) options = raw.split(/[,，、]/).map((s) => s.trim()).filter(Boolean)
    if (!options.length && f.value) {
      const v = JSON.parse(f.value)
      if (Array.isArray(v)) options = v
    }
  } catch {
    /* ignore */
  }
  if (!options.length) options = [f.name || '默认']
  const titleClean = (f.value || '').replace(/[\[\]"]/g, '') || '规格'
  return { title: titleClean, options }
}

const totalPrice = computed(() => {
  const p = Number(flavor.dish?.price ?? 0)
  return p * counter.value
})

/** 是否有未选中的规格组 */
const hasUnselected = computed(
  () => groups.value.some((g) => !selected.value[g.title]),
)

watch(
  () => flavor.open,
  (v) => {
    if (v) {
      // 强制每组必选：不预填，初始空态
      selected.value = {}
      touched.value = {}
      invalidGroups.value = new Set()
      counter.value = 1
      // 锁滚动
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)

function selectOption(title: string, opt: string) {
  selected.value = { ...selected.value, [title]: opt }
  touched.value = { ...touched.value, [title]: true }
  // 一旦用户做出选择，从 invalid 集合中移除
  if (invalidGroups.value.has(title)) {
    const next = new Set(invalidGroups.value)
    next.delete(title)
    invalidGroups.value = next
  }
}

const serializedFlavor = computed(() => JSON.stringify(selected.value))

function close() {
  flavor.hide()
}

function dec() {
  counter.value = Math.max(1, counter.value - 1)
}
function inc() {
  counter.value = Math.min(99, counter.value + 1)
}

async function confirm() {
  if (!flavor.dish) return
  // 必选校验：把所有未选中的组加入 invalid 集合
  const missing = groups.value.filter((g) => !selected.value[g.title])
  if (missing.length) {
    invalidGroups.value = new Set(missing.map((g) => g.title))
    ElMessage({ type: 'error', text: '请先选完所有规格' })
    return
  }
  try {
    // 按 counter 次数循环调用 cart.add（同口味会合并）
    for (let i = 0; i < counter.value; i++) {
      await cart.add({ dishId: flavor.dish.id, dishFlavor: serializedFlavor.value })
    }
    ElMessage({ type: 'success', text: `已加入 ${counter.value} 份 ${flavor.dish.name}` })
    close()
  } catch {
    ElMessage({ type: 'error', text: '加入购物车失败，请稍后再试' })
  }
}
</script>

<template>
  <Transition name="mask">
    <div v-if="flavor.open" class="sheet-mask" @click="close" />
  </Transition>
  <Transition name="sheet">
    <section
      v-if="flavor.open && flavor.dish"
      ref="sheetRef"
      class="flavor-sheet"
      role="dialog"
      aria-label="选择规格"
    >
      <header class="sheet-head">
        <div class="head-img">
          <img v-if="flavor.dish.image" :src="flavor.dish.image" :alt="flavor.dish.name" />
          <span v-else class="img-glyph">{{ flavor.dish.name?.slice(0, 1) }}</span>
        </div>
        <div class="head-info">
          <h3 class="dish-name serif">{{ flavor.dish.name }}</h3>
          <p class="dish-price">
            <span class="cur">¥</span>
            <strong>{{ Number(flavor.dish.price).toFixed(2) }}</strong>
          </p>
          <p v-if="flavor.dish.description" class="dish-desc">{{ flavor.dish.description }}</p>
        </div>
        <button class="close-btn" aria-label="关闭" @click="close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
      </header>

      <div class="sheet-body">
        <div v-for="g in groups" :key="g.title" class="group" :class="{ 'is-invalid': invalidGroups.has(g.title) }">
          <div class="group-head">
            <p class="group-title">{{ g.title }}</p>
            <span v-if="!selected[g.title]" class="group-hint">必选</span>
            <span v-else-if="invalidGroups.has(g.title)" class="group-hint is-warn">请选择</span>
          </div>
          <div class="group-options">
            <button
              v-for="opt in g.options"
              :key="opt"
              class="chip"
              :class="{ 'is-active': selected[g.title] === opt }"
              @click="selectOption(g.title, opt)"
            >
              {{ opt }}
            </button>
          </div>
        </div>
        <p v-if="hasUnselected && !Object.keys(touched).length" class="body-hint">
          请为每个规格选择一个口味
        </p>
      </div>

      <footer class="sheet-foot">
        <div class="counter">
          <button class="step" aria-label="减少" @click="dec">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>
          </button>
          <span class="num">{{ counter }}</span>
          <button class="step" aria-label="增加" @click="inc">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
        <button class="confirm-btn" @click="confirm">
          <span>加入购物车</span>
          <em class="amt">¥{{ totalPrice.toFixed(2) }}</em>
        </button>
      </footer>
    </section>
  </Transition>
</template>

<style scoped>
.sheet-mask {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 10, 0.42);
  backdrop-filter: blur(2px);
  z-index: 70;
}

.flavor-sheet {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(560px, 100vw);
  max-height: 88vh;
  background: var(--color-cream);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -32px 64px -16px rgba(10, 10, 10, 0.28);
  z-index: 71;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

@media (min-width: 720px) {
  .flavor-sheet {
    left: 50%;
    top: 50%;
    bottom: auto;
    transform: translate(-50%, -50%);
    border-radius: 20px;
    max-height: 80vh;
  }
}

.sheet-head {
  position: relative;
  display: grid;
  grid-template-columns: 88px 1fr 36px;
  gap: 18px;
  padding: 24px 28px 20px;
  border-bottom: 1px dashed var(--color-line);
  align-items: flex-start;
}
.head-img {
  width: 88px;
  height: 88px;
  border-radius: var(--radius-md);
  background: var(--color-cream-soft);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -40px;
  border: 4px solid var(--color-cream);
  box-shadow: 0 12px 24px -12px rgba(10, 10, 10, 0.25);
}
.head-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.head-img .img-glyph {
  font-family: var(--font-display);
  font-size: 40px;
  color: var(--color-sage);
  letter-spacing: -0.04em;
}
.head-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.dish-name {
  font-size: var(--fs-20);
  font-weight: 500;
  color: var(--color-ink);
  letter-spacing: -0.01em;
}
.dish-price {
  font-family: var(--font-display);
  color: var(--color-apricot-deep);
  display: inline-flex;
  align-items: baseline;
  gap: 1px;
}
.dish-price .cur {
  font-size: var(--fs-13);
}
.dish-price strong {
  font-weight: 500;
  font-size: var(--fs-22);
}
.dish-desc {
  font-size: var(--fs-12);
  color: var(--ink-mute, var(--color-ink-mute));
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  color: var(--color-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--dur-base) var(--ease-out);
}
.close-btn:hover {
  background: var(--color-ink);
  color: var(--color-paper);
  border-color: var(--color-ink);
}

.sheet-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.group-title {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-13);
  color: var(--color-ink-soft);
  letter-spacing: 0.04em;
  margin-bottom: 12px;
}
.group-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}
.group-hint {
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--color-ink-mute);
  font-family: var(--font-display);
  font-style: italic;
}
.group-hint.is-warn {
  color: var(--color-tomato);
  animation: nudge 0.4s var(--ease-out);
}
.group.is-invalid .group-title {
  color: var(--color-tomato);
}
.group.is-invalid .chip:not(.is-active) {
  border-color: rgba(51, 65, 85, 0.4);
}
.body-hint {
  margin-top: -4px;
  font-size: 12px;
  color: var(--color-ink-mute);
  font-family: var(--font-display);
  font-style: italic;
  letter-spacing: 0.02em;
}
.group-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.chip {
  padding: 8px 16px;
  font-size: var(--fs-13);
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--color-line);
  background: var(--color-paper);
  color: var(--color-ink-soft);
  transition: all var(--dur-base) var(--ease-out);
  white-space: nowrap;
}
.chip:hover {
  border-color: var(--color-sage-soft);
  color: var(--color-sage-deep);
}
.chip.is-active {
  background: var(--color-sage);
  color: var(--color-paper);
  border-color: var(--color-sage);
  font-weight: 600;
  box-shadow: 0 4px 12px -4px rgba(71, 85, 105, 0.4);
}

@keyframes nudge {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-3px);
  }
  75% {
    transform: translateX(3px);
  }
}

.sheet-foot {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 24px calc(20px + env(safe-area-inset-bottom, 0));
  border-top: 1px solid var(--color-line-soft);
  background: var(--color-paper);
}
.counter {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--color-line);
  background: var(--color-cream);
}
.counter .step {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-paper);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-ink);
  transition: all var(--dur-base) var(--ease-out);
}
.counter .step:hover {
  background: var(--color-sage);
  color: var(--color-paper);
}
.counter .num {
  font-family: var(--font-display);
  font-size: var(--fs-16);
  font-weight: 600;
  min-width: 32px;
  text-align: center;
}

.confirm-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 22px;
  height: 48px;
  border-radius: var(--radius-pill);
  background: var(--color-ink);
  color: var(--color-paper);
  font-size: var(--fs-14);
  font-weight: 600;
  letter-spacing: 0.04em;
  transition: background var(--dur-base) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}
.confirm-btn:hover {
  background: var(--color-sage-deep);
  transform: translateY(-1px);
}
.confirm-btn .amt {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-15);
  font-weight: 500;
}

/* —— 动效 —— */
.mask-enter-active,
.mask-leave-active {
  transition: opacity var(--dur-base) var(--ease-out);
}
.mask-enter-from,
.mask-leave-to {
  opacity: 0;
}

.sheet-enter-active,
.sheet-leave-active {
  transition:
    opacity var(--dur-base) var(--ease-out),
    transform var(--dur-slow) var(--ease-out);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(40px);
}
@media (min-width: 720px) {
  .sheet-enter-from,
  .sheet-leave-to {
    transform: translate(-50%, -45%) scale(0.96);
  }
}

@media (max-width: 640px) {
  .sheet-head {
    grid-template-columns: 72px 1fr 32px;
    padding: 20px 20px 16px;
  }
  .head-img {
    width: 72px;
    height: 72px;
    margin-top: -32px;
  }
  .sheet-body,
  .sheet-foot {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>