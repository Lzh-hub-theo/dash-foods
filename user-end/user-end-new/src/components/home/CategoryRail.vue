<script setup lang="ts">
import { computed } from 'vue'
import type { Category } from '@/types/api'

interface CategoryWithItems extends Category {
  dishes: { id: number }[]
  setmeals: { id: number }[]
}

const props = defineProps<{
  categories: CategoryWithItems[]
  activeId: number
}>()

const emit = defineEmits<{
  (e: 'change', id: number): void
}>()

const list = computed(() => props.categories ?? [])

function pick(id: number) {
  emit('change', id)
  // 平滑滚动到对应分类
  // 使用 scrollIntoView：CSS 已在 .cat-section 上设置 scroll-margin-top
  // 让目标标题避让 sticky header，不再依赖易错的 offsetTop
  const el = document.querySelector(`[data-cat-anchor="${id}"]`)
  if (el) {
    ;(el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <aside class="cat-rail">
    <p class="rail-eyebrow">MENU&nbsp;·&nbsp;今日菜单</p>
    <p class="rail-title">分类</p>
    <nav class="rail-list">
      <button
        v-for="c in list"
        :key="c.id"
        class="rail-item"
        :class="{ 'is-active': c.id === activeId }"
        @click="pick(c.id)"
      >
        <span class="rail-name">{{ c.name }}</span>
        <span class="rail-count">
          {{ (c.dishes?.length || 0) + (c.setmeals?.length || 0) }}
        </span>
      </button>
    </nav>

    <div class="rail-aside">
      <p class="aside-eyebrow">DAILY&nbsp;HARVEST</p>
      <p class="aside-body">
        今日菜源全部来自顺义、北务两个合作农场。每日 4:30 采摘，9:00 前抵达中央厨房。
      </p>
      <div class="aside-stamp">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="40" cy="40" r="36" stroke="#475569" stroke-width="1.4" />
          <circle cx="40" cy="40" r="30" stroke="#475569" stroke-width="0.8" stroke-dasharray="2 3" />
          <path d="M40 22 C 28 32, 28 48, 40 58 C 52 48, 52 32, 40 22 Z" fill="#475569" opacity="0.85" />
          <path d="M40 22 L 40 58" stroke="#FFFFFF" stroke-width="1.2" />
        </svg>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.cat-rail {
  position: sticky;
  top: calc(var(--header-h) + 24px);
  width: 220px;
  flex-shrink: 0;
  /* 跟随 .menu-inner 撑满高度（align-items: stretch），
     让 sticky 跨越整个菜单区域 */
  align-self: flex-start;
  max-height: calc(100vh - var(--header-h) - 48px);
  overflow-y: auto;
  scrollbar-width: thin;
}

.rail-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.32em;
  color: var(--color-sage);
  margin-bottom: 8px;
}
.rail-title {
  font-family: var(--font-display);
  font-size: var(--fs-32);
  font-weight: 400;
  color: var(--color-ink);
  margin-bottom: 22px;
  letter-spacing: -0.02em;
}

.rail-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-left: 1px solid var(--color-line);
}

.rail-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0 14px 18px;
  margin-left: -1px;
  border-left: 2px solid transparent;
  text-align: left;
  color: var(--color-ink-soft);
  transition: all var(--dur-base) var(--ease-out);
}
.rail-item:hover {
  color: var(--color-ink);
  border-left-color: var(--color-sage-soft);
}
.rail-item.is-active {
  color: var(--color-sage-deep);
  border-left-color: var(--color-sage);
  background: linear-gradient(90deg, rgba(71, 85, 105, 0.06) 0%, transparent 100%);
}
.rail-item.is-active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: var(--color-sage);
  border-radius: 50%;
  animation: pulse-soft 2s var(--ease-soft) infinite;
}
.rail-name {
  font-size: var(--fs-15);
  font-weight: 500;
}
.rail-count {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-13);
  color: var(--color-ink-mute);
  letter-spacing: 0.02em;
}
.rail-item.is-active .rail-count {
  color: var(--color-sage);
}

/* —— 底部角落印章 —— */
.rail-aside {
  margin-top: 32px;
  padding: 20px;
  border: 1px dashed var(--color-line);
  border-radius: var(--radius-lg);
  background: var(--color-paper);
  position: relative;
}
.aside-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.28em;
  color: var(--color-sage);
  margin-bottom: 10px;
}
.aside-body {
  font-size: var(--fs-12);
  line-height: 1.6;
  color: var(--color-ink-soft);
}
.aside-stamp {
  position: absolute;
  bottom: 14px;
  right: 14px;
  width: 50px;
  height: 50px;
  opacity: 0.85;
  transform: rotate(-8deg);
}

@media (max-width: 960px) {
  .cat-rail {
    width: 100%;
    position: relative;
    top: 0;
  }
  .rail-list {
    flex-direction: row;
    overflow-x: auto;
    border-left: none;
    border-bottom: 1px solid var(--color-line);
    padding-bottom: 8px;
  }
  .rail-item {
    margin-left: 0;
    border-left: none;
    border-bottom: 2px solid transparent;
    padding: 10px 16px;
    flex-shrink: 0;
  }
  .rail-item.is-active {
    border-left: none;
    border-bottom-color: var(--color-sage);
    background: transparent;
  }
  .rail-item.is-active::before {
    display: none;
  }
  .rail-aside {
    display: none;
  }
}
</style>