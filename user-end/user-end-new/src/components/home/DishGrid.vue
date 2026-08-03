<script setup lang="ts">
import { computed, ref } from 'vue'
import DishCard from './DishCard.vue'
import { useMenuStore } from '@/stores/menu'
import { ElMessage } from '@/api/notify'
import type { DishVO, Setmeal, Category } from '@/types/api'

interface CategoryWithItems extends Category {
  dishes: DishVO[]
  setmeals: Setmeal[]
}

const props = defineProps<{
  categories: CategoryWithItems[]
  cartItems: { dishId?: number; setmealId?: number; number: number }[]
}>()

const emit = defineEmits<{
  (e: 'add-dish', payload: { dishId: number; dishFlavor?: string }, rect: DOMRect): void
  (e: 'sub-dish', payload: { dishId: number; dishFlavor?: string }): void
  (e: 'add-setmeal', payload: { setmealId: number }, rect: DOMRect): void
  (e: 'open-flavor', dish: DishVO, rect: DOMRect): void
}>()

const menu = useMenuStore()

const qtyMap = computed(() => {
  const map: Record<number, number> = {}
  props.cartItems.forEach((it) => {
    const key = it.dishId || -(it.setmealId || 0)
    map[key] = (map[key] || 0) + (it.number || 0)
  })
  return map
})

/** 套餐菜品明细展开状态：'closed' | 'loading' | 'open' | 'error' */
const setmealState = ref<Record<number, 'closed' | 'loading' | 'open' | 'error'>>({})

async function toggleSetmeal(id: number) {
  const cur = setmealState.value[id] || 'closed'
  if (cur === 'open' || cur === 'loading') {
    // 收起
    setmealState.value[id] = 'closed'
    return
  }
  // 命中 store 缓存则直接展开
  if (menu.setmealDishesCache[id]) {
    setmealState.value[id] = 'open'
    return
  }
  setmealState.value[id] = 'loading'
  try {
    await menu.fetchSetmealDishes(id)
    // 再次确认仍处于 loading（避免用户快速点击关闭）
    if (setmealState.value[id] === 'loading') {
      setmealState.value[id] = 'open'
    }
  } catch {
    setmealState.value[id] = 'error'
    ElMessage({ type: 'error', text: '套餐菜品加载失败，请稍后再试' })
  }
}

function onAddDish(payload: { dishId: number; dishFlavor?: string }, rect: DOMRect) {
  emit('add-dish', payload, rect)
}
function onSubDish(payload: { dishId: number; dishFlavor?: string }) {
  emit('sub-dish', payload)
}
function onAddSetmeal(payload: { setmealId: number }, rect: DOMRect) {
  emit('add-setmeal', payload, rect)
}
function onOpenFlavor(dish: DishVO, rect: DOMRect) {
  emit('open-flavor', dish, rect)
}
</script>

<template>
  <div class="dish-grid">
    <section
      v-for="cat in categories"
      :key="cat.id"
      :data-cat-anchor="cat.id"
      class="cat-section"
    >
      <header class="section-head">
        <div class="head-main">
          <h2 class="section-title serif">{{ cat.name }}</h2>
          <span class="section-count">
            {{ (cat.dishes?.length || 0) + (cat.setmeals?.length || 0) }} 品
          </span>
        </div>
        <p class="section-sub">
          主厨 <em>Anna</em> 推荐 —— 时令食材 · 当日现做
        </p>
      </header>

      <!-- 套餐：横向大卡 -->
      <div v-if="cat.setmeals?.length" class="setmeal-list">
        <article v-for="sm in cat.setmeals" :key="sm.id" class="setmeal-card">
          <div class="sm-img">
            <img v-if="sm.image" :src="sm.image" :alt="sm.name" loading="lazy" @error="($event.target as HTMLImageElement).style.display='none'" />
            <div v-else class="img-fallback">
              <span>{{ sm.name?.slice(0, 1) }}</span>
            </div>
          </div>
          <div class="sm-body">
            <div class="sm-head">
              <h3 class="sm-name serif">{{ sm.name }}</h3>
              <div class="sm-price">
                <span class="cur">¥</span><span class="num">{{ Math.floor(sm.price) }}</span><span class="frac">{{ Math.round((sm.price % 1) * 100).toString().padStart(2, '0') }}</span>
              </div>
            </div>
            <p class="sm-desc">{{ sm.description || '主厨限定套餐，含主食、蛋白与时蔬。' }}</p>
            <button
              class="sm-detail"
              :disabled="(setmealState[sm.id] || 'closed') === 'loading'"
              @click="toggleSetmeal(sm.id)"
            >
              <span v-if="(setmealState[sm.id] || 'closed') === 'loading'">加载中…</span>
              <span v-else-if="(setmealState[sm.id] || 'closed') === 'open'">收起菜单 ↑</span>
              <span v-else>查看包含菜品 →</span>
            </button>
            <Transition name="collapse">
              <div v-if="(setmealState[sm.id] || 'closed') === 'open'" class="sm-detail-list">
                <div v-if="menu.setmealDishesCache[sm.id]?.length" class="sm-dishes">
                  <div
                    v-for="(d, i) in menu.setmealDishesCache[sm.id]"
                    :key="`${sm.id}-${i}-${d.name}`"
                    class="sm-dish-row"
                  >
                    <div class="sm-dish-img">
                      <img
                        v-if="d.image"
                        :src="d.image"
                        :alt="d.name"
                        loading="lazy"
                        @error="($event.target as HTMLImageElement).style.display='none'"
                      />
                      <span v-else class="sm-dish-glyph">{{ d.name?.slice(0, 1) }}</span>
                    </div>
                    <div class="sm-dish-meta">
                      <p class="sm-dish-name">{{ d.name }}</p>
                      <p v-if="d.description" class="sm-dish-desc">{{ d.description }}</p>
                    </div>
                    <span class="sm-dish-copies">×{{ d.copies }}</span>
                  </div>
                </div>
                <p v-else class="sm-detail-empty">暂无菜品详情</p>
              </div>
            </Transition>
            <Transition name="collapse">
              <p v-if="(setmealState[sm.id] || 'closed') === 'error'" class="sm-detail-error">
                加载失败，<button class="sm-retry" @click="toggleSetmeal(sm.id)">重试</button>
              </p>
            </Transition>
            <div class="sm-foot">
              <span class="sm-tag">{{ qtyMap[-(sm.id)] || 0 }} 份已加入</span>
              <button
                class="btn-add"
                aria-label="加入套餐"
                @click="(e) => onAddSetmeal({ setmealId: sm.id }, (e.currentTarget as HTMLElement).getBoundingClientRect())"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                加入购物车
              </button>
            </div>
          </div>
        </article>
      </div>

      <!-- 单品：3 列网格 -->
      <div class="dish-list">
        <DishCard
          v-for="d in cat.dishes"
          :key="d.id"
          :dish="d"
          :qty="qtyMap[d.id] || 0"
          :has-flavor="Boolean(d.flavors?.length)"
          @add="onAddDish"
          @sub="onSubDish"
          @open-flavor="onOpenFlavor"
        />
      </div>
    </section>

    <div v-if="!categories.length" class="empty">
      <p>菜单正在准备中……</p>
    </div>
  </div>
</template>

<style scoped>
.dish-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 72px;
}

.cat-section {
  scroll-margin-top: calc(var(--header-h) + 24px);
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 28px;
  padding-bottom: 18px;
  border-bottom: 1px dashed var(--color-line);
}
.head-main {
  display: inline-flex;
  align-items: baseline;
  gap: 14px;
}
.section-title {
  font-size: var(--fs-40);
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  position: relative;
}
.section-title::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: var(--color-sage);
  border-radius: 50%;
}
.section-count {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-15);
  color: var(--color-apricot-deep);
  letter-spacing: 0.02em;
}
.section-sub {
  font-size: var(--fs-13);
  color: var(--color-ink-mute);
  letter-spacing: 0.02em;
}
.section-sub em {
  font-style: italic;
  color: var(--color-sage);
  font-family: var(--font-display);
}

/* —— 套餐横向卡 —— */
.setmeal-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 32px;
}
.setmeal-card {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 28px;
  background: var(--color-paper);
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-lg);
  overflow: hidden;
  padding: 20px;
  transition: all var(--dur-base) var(--ease-out);
}
.setmeal-card:hover {
  border-color: var(--color-sage-soft);
  box-shadow: var(--shadow-hover);
}
.sm-img {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  aspect-ratio: 1;
  background: var(--color-cream-soft);
}
.sm-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.sm-img .img-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffe9b8, #f2a65a);
}
.sm-img .img-fallback span {
  font-family: var(--font-display);
  font-size: 72px;
  color: var(--color-paper);
  letter-spacing: -0.04em;
}

.sm-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
}
.sm-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.sm-name {
  font-size: var(--fs-24);
  font-weight: 500;
}
.sm-price {
  font-family: var(--font-display);
  color: var(--color-apricot-deep);
  display: inline-flex;
  align-items: baseline;
}
.sm-price .cur {
  font-size: var(--fs-13);
  margin-right: 1px;
}
.sm-price .num {
  font-size: var(--fs-28);
  font-weight: 500;
}
.sm-price .frac {
  font-size: var(--fs-13);
  font-style: italic;
}
.sm-desc {
  font-size: var(--fs-13);
  line-height: 1.6;
  color: var(--color-ink-soft);
  max-width: 560px;
}
.sm-detail {
  align-self: flex-start;
  font-size: var(--fs-13);
  color: var(--color-sage);
  font-weight: 500;
  letter-spacing: 0.02em;
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 1px;
  text-decoration-color: var(--color-sage-soft);
  transition: text-decoration-color var(--dur-base) var(--ease-out);
}
.sm-detail:hover {
  text-decoration-color: var(--color-sage);
}
.sm-detail-list {
  margin-top: 4px;
}
.sm-detail-empty {
  font-size: var(--fs-12);
  color: var(--color-ink-mute);
  font-family: var(--font-display);
  font-style: italic;
  letter-spacing: 0.02em;
}
.sm-detail-error {
  margin-top: 4px;
  font-size: var(--fs-12);
  color: var(--color-tomato);
  font-family: var(--font-display);
  font-style: italic;
  letter-spacing: 0.02em;
}
.sm-retry {
  text-decoration: underline;
  text-underline-offset: 3px;
  color: var(--color-sage-deep);
  font-weight: 500;
}
.sm-dishes {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
  padding: 14px 16px;
  background: var(--color-cream-soft);
  border-radius: var(--radius-md);
  border: 1px dashed var(--color-line);
}
.sm-dish-row {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 12px;
  align-items: center;
}
.sm-dish-img {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-paper);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sm-dish-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.sm-dish-glyph {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--color-sage);
}
.sm-dish-meta {
  min-width: 0;
}
.sm-dish-name {
  font-size: var(--fs-13);
  color: var(--color-ink);
  font-weight: 500;
  line-height: 1.4;
}
.sm-dish-desc {
  margin-top: 2px;
  font-size: 11px;
  color: var(--color-ink-mute);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.sm-dish-copies {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-13);
  color: var(--color-apricot-deep);
  font-weight: 500;
}

.collapse-enter-active,
.collapse-leave-active {
  transition:
    opacity var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-out),
    max-height var(--dur-base) var(--ease-out);
  overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
}
.collapse-enter-to,
.collapse-leave-from {
  max-height: 480px;
}

.sm-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}
.sm-tag {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-13);
  color: var(--color-ink-mute);
  letter-spacing: 0.02em;
}
.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: var(--radius-pill);
  background: var(--color-sage);
  color: var(--color-paper);
  font-size: var(--fs-13);
  font-weight: 600;
  letter-spacing: 0.04em;
  transition:
    background var(--dur-base) var(--ease-out),
    transform var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out);
  box-shadow: 0 6px 16px -6px rgba(63, 107, 58, 0.5);
}
.btn-add:hover {
  background: var(--color-sage-deep);
  transform: translateY(-1px);
  box-shadow: 0 10px 20px -8px rgba(63, 107, 58, 0.5);
}
.btn-add:active {
  transform: translateY(0);
}

/* —— 菜品网格 —— */
.dish-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.empty {
  padding: 80px 0;
  text-align: center;
  font-family: var(--font-display);
  font-style: italic;
  color: var(--color-ink-mute);
  font-size: var(--fs-18);
}

@media (max-width: 1100px) {
  .dish-list {
    grid-template-columns: repeat(2, 1fr);
  }
  .setmeal-card {
    grid-template-columns: 180px 1fr;
  }
}
@media (max-width: 720px) {
  .dish-list {
    grid-template-columns: 1fr;
  }
  .setmeal-card {
    grid-template-columns: 1fr;
  }
  .sm-img {
    aspect-ratio: 16 / 9;
  }
}
</style>