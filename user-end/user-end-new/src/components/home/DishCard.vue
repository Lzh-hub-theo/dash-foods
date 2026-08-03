<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DishVO } from '@/types/api'

const props = defineProps<{
  dish: DishVO
  /** 该菜品在购物车里的总数量（所有口味合并） */
  qty?: number
  /** 是否有规格需要选择 */
  hasFlavor?: boolean
}>()

const emit = defineEmits<{
  (e: 'add', payload: { dishId: number; dishFlavor?: string }, rect: DOMRect): void
  (e: 'sub', payload: { dishId: number; dishFlavor?: string }): void
  (e: 'open-flavor', dish: DishVO, rect: DOMRect): void
}>()

const flyEl = ref<HTMLSpanElement | null>(null)
const imgFailed = ref(false)

/** 菜品类别关键字 → fallback 风格 */
const categoryKey = computed(() => {
  const cat = (props.dish.categoryName || '').toLowerCase()
  if (/饮|drink|coffee|tea|酒|juice/.test(cat)) return 'drink'
  if (/甜|dessert|cake|sweet/.test(cat)) return 'dessert'
  if (/汤|soup|炖/.test(cat)) return 'soup'
  if (/沙拉|salad/.test(cat)) return 'salad'
  if (/面|noodle|pasta|意面|乌冬/.test(cat)) return 'noodle'
  if (/饭|rice|炒|盖/.test(cat)) return 'rice'
  if (/包|bun|bao/.test(cat)) return 'bun'
  return 'default'
})

function onAdd(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  // 有规格时改走选择浮窗
  if (needFlavor.value) {
    emit('open-flavor', props.dish, rect)
    return
  }
  const payload = { dishId: props.dish.id, dishFlavor: '' }
  emit('add', payload, rect)

  // 视觉抛物
  if (flyEl.value) {
    const f = flyEl.value
    f.style.left = `${rect.left + rect.width / 2 - 12}px`
    f.style.top = `${rect.top + rect.height / 2 - 12}px`
    f.classList.remove('play')
    // force reflow
    void f.offsetWidth
    f.classList.add('play')
  }
}

function onSub() {
  // 数量大于 0 时才减；无规格则按 dishId+'' 一键减一
  if (qty.value <= 0) return
  emit('sub', { dishId: props.dish.id, dishFlavor: '' })
}

function onImgError(e: Event) {
  imgFailed.value = true
  ;(e.target as HTMLImageElement).style.display = 'none'
}

const flavors = (props.dish.flavors || []).slice(0, 2)
const statusOff = props.dish.status === 0
const showFallback = computed(() => !props.dish.image || imgFailed.value)
const qty = computed(() => props.qty ?? 0)
const needFlavor = computed(() => Boolean(props.hasFlavor && props.dish.flavors?.length))
</script>

<template>
  <article class="dish-card" :class="{ 'is-off': statusOff }">
    <div class="card-img">
      <span ref="flyEl" class="fly-token">+1</span>
      <!-- 真实图优先；缺失或加载失败时降级到分类 SVG 食物插画 -->
      <img
        v-if="dish.image && !imgFailed"
        :src="dish.image"
        :alt="dish.name"
        loading="lazy"
        @error="onImgError"
      />
      <div v-if="showFallback" class="img-fallback" :data-cat="categoryKey">
        <svg class="fb-illus" viewBox="0 0 200 160" fill="none">
          <!-- 通用底盘（盘） -->
          <ellipse cx="100" cy="135" rx="70" ry="10" fill="#1F2A1D" opacity="0.06" />

          <!-- rice 饭类：碗+米 -->
          <g v-if="categoryKey === 'rice'">
            <path d="M40 90 Q40 70 100 70 Q160 70 160 90 L150 130 Q150 138 142 138 L58 138 Q50 138 50 130 Z" fill="#FFFEFA" stroke="#1F2A1D" stroke-width="1.5" />
            <ellipse cx="100" cy="92" rx="48" ry="10" fill="#3F6B3A" />
            <ellipse cx="92" cy="90" rx="6" ry="3" fill="#FFFEFA" opacity="0.9" />
            <ellipse cx="108" cy="88" rx="5" ry="2.5" fill="#FFFEFA" opacity="0.8" />
            <ellipse cx="100" cy="86" rx="4" ry="2" fill="#FFFEFA" opacity="0.7" />
          </g>

          <!-- noodle 面类：碗+面线 -->
          <g v-else-if="categoryKey === 'noodle'">
            <path d="M40 90 Q40 70 100 70 Q160 70 160 90 L150 130 Q150 138 142 138 L58 138 Q50 138 50 130 Z" fill="#FFFEFA" stroke="#1F2A1D" stroke-width="1.5" />
            <ellipse cx="100" cy="90" rx="48" ry="10" fill="#F4EFE4" />
            <path d="M62 88 Q82 76 100 86 Q118 76 138 88" stroke="#F2A65A" stroke-width="1.8" fill="none" stroke-linecap="round" />
            <path d="M68 84 Q86 72 100 82 Q114 72 132 84" stroke="#F2A65A" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.85" />
            <circle cx="86" cy="86" r="3" fill="#3F6B3A" />
            <circle cx="116" cy="86" r="3" fill="#3F6B3A" />
          </g>

          <!-- soup 汤类：碗+蒸汽 -->
          <g v-else-if="categoryKey === 'soup'">
            <path d="M40 100 Q40 78 100 78 Q160 78 160 100 L150 132 Q150 140 142 140 L58 140 Q50 140 50 132 Z" fill="#FFFEFA" stroke="#1F2A1D" stroke-width="1.5" />
            <ellipse cx="100" cy="102" rx="48" ry="10" fill="#D9534F" opacity="0.85" />
            <path d="M70 64 Q66 56 70 50" stroke="#A4C49A" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.7" />
            <path d="M100 60 Q96 52 100 46" stroke="#A4C49A" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.7" />
            <path d="M130 64 Q126 56 130 50" stroke="#A4C49A" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.7" />
          </g>

          <!-- salad 沙拉：圆碗+叶 -->
          <g v-else-if="categoryKey === 'salad'">
            <ellipse cx="100" cy="120" rx="60" ry="14" fill="#FFFEFA" stroke="#1F2A1D" stroke-width="1.5" />
            <path d="M60 110 Q70 78 100 78 Q130 78 140 110 Z" fill="#A4C49A" />
            <path d="M70 100 Q80 86 92 96" stroke="#3F6B3A" stroke-width="1.5" fill="none" stroke-linecap="round" />
            <path d="M108 96 Q120 84 132 98" stroke="#3F6B3A" stroke-width="1.5" fill="none" stroke-linecap="round" />
            <circle cx="88" cy="92" r="3" fill="#D9534F" />
            <circle cx="112" cy="90" r="3" fill="#F2A65A" />
            <circle cx="100" cy="100" r="3" fill="#FFE9B8" />
          </g>

          <!-- drink 饮品：杯+吸管 -->
          <g v-else-if="categoryKey === 'drink'">
            <path d="M68 50 L72 138 Q72 144 78 144 L122 144 Q128 144 128 138 L132 50 Z" fill="#FFFEFA" stroke="#1F2A1D" stroke-width="1.5" />
            <path d="M68 50 L132 50" stroke="#1F2A1D" stroke-width="1.5" stroke-linecap="round" />
            <path d="M76 56 L74 130 Q74 134 78 134 L122 134 Q126 134 126 130 L124 56 Z" fill="#F2A65A" opacity="0.65" />
            <rect x="116" y="36" width="3" height="20" rx="1.5" fill="#3F6B3A" transform="rotate(15 117 46)" />
            <circle cx="92" cy="74" r="3" fill="#FFFEFA" opacity="0.7" />
            <circle cx="106" cy="86" r="2" fill="#FFFEFA" opacity="0.7" />
          </g>

          <!-- dessert 甜品：杯+奶油 -->
          <g v-else-if="categoryKey === 'dessert'">
            <path d="M62 96 L72 140 Q72 144 76 144 L124 144 Q128 144 128 140 L138 96 Z" fill="#FFFEFA" stroke="#1F2A1D" stroke-width="1.5" />
            <path d="M62 96 L138 96" stroke="#1F2A1D" stroke-width="1.5" />
            <ellipse cx="100" cy="96" rx="38" ry="8" fill="#F2A65A" />
            <ellipse cx="100" cy="86" rx="32" ry="6" fill="#FFE9B8" />
            <ellipse cx="100" cy="78" rx="26" ry="5" fill="#FFFEFA" stroke="#1F2A1D" stroke-width="1" />
            <circle cx="92" cy="72" r="2" fill="#D9534F" />
            <circle cx="108" cy="74" r="2" fill="#3F6B3A" />
          </g>

          <!-- bun 包子：圆胖+褶 -->
          <g v-else-if="categoryKey === 'bun'">
            <path d="M50 100 Q50 70 100 70 Q150 70 150 100 Q150 132 100 132 Q50 132 50 100 Z" fill="#FFFEFA" stroke="#1F2A1D" stroke-width="1.5" />
            <path d="M70 86 Q72 80 76 86" stroke="#1F2A1D" stroke-width="1" fill="none" />
            <path d="M88 80 Q90 74 94 80" stroke="#1F2A1D" stroke-width="1" fill="none" />
            <path d="M106 80 Q108 74 112 80" stroke="#1F2A1D" stroke-width="1" fill="none" />
            <path d="M124 86 Q126 80 130 86" stroke="#1F2A1D" stroke-width="1" fill="none" />
            <ellipse cx="100" cy="134" rx="40" ry="4" fill="#1F2A1D" opacity="0.1" />
          </g>

          <!-- default 通用：椭圆盘+首字 -->
          <g v-else>
            <ellipse cx="100" cy="120" rx="62" ry="16" fill="#FFFEFA" stroke="#1F2A1D" stroke-width="1.5" />
            <path d="M70 110 Q70 86 100 86 Q130 86 130 110 Z" fill="#A4C49A" opacity="0.8" />
          </g>
        </svg>
        <span class="fb-glyph">{{ dish.name?.slice(0, 1) || '·' }}</span>
      </div>
      <span v-if="dish.stock !== undefined && dish.stock <= 5 && dish.stock > 0" class="badge-stock">
        仅剩 {{ dish.stock }} 份
      </span>
      <span v-if="statusOff" class="badge-off">已售罄</span>
    </div>

    <div class="card-body">
      <div class="card-head">
        <h3 class="dish-name serif">{{ dish.name }}</h3>
        <div class="dish-price">
          <span class="cur">¥</span><span class="num">{{ Math.floor(dish.price) }}</span><span class="dot">.</span><span class="frac">{{ Math.round((dish.price % 1) * 100).toString().padStart(2, '0') }}</span>
        </div>
      </div>

      <p v-if="dish.description" class="dish-desc">{{ dish.description }}</p>

      <div v-if="flavors.length" class="dish-flavors">
        <span v-for="f in flavors" :key="f.id" class="flavor-chip">{{ f.name }}</span>
      </div>

      <div class="card-foot">
        <span class="sales">已售 {{ Math.floor((dish.id || 0) * 73 % 480 + 32) }}</span>
        <div class="card-action">
          <Transition name="step">
            <button
              v-if="qty > 0"
              class="btn-step"
              aria-label="减少"
              @click="onSub"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>
            </button>
          </Transition>
          <Transition name="qty">
            <span v-if="qty > 0" class="qty">{{ qty }}</span>
          </Transition>
          <button
            class="btn-add"
            :disabled="statusOff"
            aria-label="加入购物车"
            @click="onAdd"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.dish-card {
  display: flex;
  flex-direction: column;
  background: var(--color-paper);
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition:
    transform var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out);
  position: relative;
}
.dish-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: var(--color-sage-soft);
}

.card-img {
  position: relative;
  aspect-ratio: 4 / 3;
  background: var(--color-cream-soft);
  overflow: hidden;
}
.card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--dur-slow) var(--ease-out);
}
.dish-card:hover .card-img img {
  transform: scale(1.06);
}
.img-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 30% 30%, rgba(164, 196, 154, 0.32), transparent 60%),
    linear-gradient(135deg, #f4efe4, #e5dfd0);
}
.img-fallback .fb-illus {
  width: 70%;
  height: 70%;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 6px 16px rgba(31, 42, 29, 0.08));
  transition: transform var(--dur-slow) var(--ease-out);
}
.dish-card:hover .fb-illus {
  transform: scale(1.04) rotate(-2deg);
}
.img-fallback .fb-glyph {
  position: absolute;
  top: 14px;
  right: 18px;
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 400;
  color: var(--color-ink);
  opacity: 0.18;
  letter-spacing: -0.04em;
  line-height: 1;
}
.img-fallback[data-cat="drink"] .fb-glyph,
.img-fallback[data-cat="dessert"] .fb-glyph {
  color: var(--color-apricot-deep);
  opacity: 0.32;
}
.img-fallback[data-cat="soup"] .fb-glyph {
  color: var(--color-tomato);
  opacity: 0.32;
}
.img-fallback[data-cat="salad"] .fb-glyph,
.img-fallback[data-cat="noodle"] .fb-glyph {
  color: var(--color-sage-deep);
  opacity: 0.28;
}

.badge-stock {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  background: rgba(217, 83, 79, 0.92);
  color: var(--color-paper);
  border-radius: var(--radius-pill);
}
.badge-off {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(31, 42, 29, 0.4);
  color: var(--color-paper);
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-24);
  letter-spacing: 0.04em;
}

.fly-token {
  position: fixed;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-sage);
  color: var(--color-paper);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  pointer-events: none;
  opacity: 0;
  z-index: 100;
}
.fly-token.play {
  animation: fly-to-cart 720ms var(--ease-out) forwards;
}

.card-body {
  padding: 18px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.dish-name {
  font-size: var(--fs-20);
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--color-ink);
  line-height: 1.25;
  flex: 1;
  min-width: 0;
}
.dish-price {
  font-family: var(--font-display);
  color: var(--color-apricot-deep);
  display: inline-flex;
  align-items: baseline;
  white-space: nowrap;
}
.dish-price .cur {
  font-size: var(--fs-14);
  margin-right: 1px;
  color: var(--color-apricot-deep);
}
.dish-price .num {
  font-size: var(--fs-28);
  font-weight: 500;
  letter-spacing: -0.02em;
}
.dish-price .dot {
  font-size: var(--fs-18);
  margin: 0 1px;
}
.dish-price .frac {
  font-size: var(--fs-14);
  font-style: italic;
}

.dish-desc {
  font-size: var(--fs-13);
  line-height: 1.55;
  color: var(--color-ink-soft);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dish-flavors {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.flavor-chip {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  background: var(--color-sage-mist);
  color: var(--color-sage-deep);
  letter-spacing: 0.02em;
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 4px;
}
.sales {
  font-size: var(--fs-12);
  color: var(--color-ink-mute);
  font-family: var(--font-display);
  font-style: italic;
  letter-spacing: 0.04em;
}

.card-action {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 78px;
  justify-content: flex-end;
}
.btn-step,
.btn-add {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--color-line);
  color: var(--color-ink);
  background: var(--color-paper);
  transition: all var(--dur-base) var(--ease-out);
}
.btn-add {
  background: var(--color-sage);
  color: var(--color-paper);
  border-color: var(--color-sage);
  box-shadow: 0 6px 16px -6px rgba(63, 107, 58, 0.4);
}
.btn-add:hover {
  background: var(--color-sage-deep);
  border-color: var(--color-sage-deep);
  transform: rotate(90deg);
}
.btn-step:hover {
  border-color: var(--color-sage);
  color: var(--color-sage);
}
.qty {
  font-family: var(--font-display);
  font-size: var(--fs-15);
  font-weight: 600;
  color: var(--color-ink);
  min-width: 16px;
  text-align: center;
}

/* —— 步进过渡 —— */
.step-enter-active,
.step-leave-active,
.qty-enter-active,
.qty-leave-active {
  transition:
    opacity var(--dur-fast) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}
.step-enter-from,
.step-leave-to,
.qty-enter-from,
.qty-leave-to {
  opacity: 0;
  transform: scale(0.6);
}
.step-leave-active,
.qty-leave-active {
  position: absolute;
}

.dish-card.is-off .card-action,
.dish-card.is-off .btn-add {
  pointer-events: none;
  opacity: 0.5;
}
</style>