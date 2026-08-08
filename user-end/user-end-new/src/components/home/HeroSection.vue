<script setup lang="ts">
import { computed } from 'vue'
import { useShopStore } from '@/stores/shop'
import StatusBadge from '@/components/layout/StatusBadge.vue'

const shop = useShopStore()
const open = computed(() => shop.isOpen)

// 像素矩阵：0 空 / 1 墨 / 2 钢 / 3 弱灰
const matrix: number[][] = [
  [0, 0, 3, 0, 0, 0, 1, 0],
  [0, 3, 0, 0, 2, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 3],
  [1, 0, 0, 0, 0, 3, 0, 0],
  [0, 0, 2, 0, 0, 0, 1, 0],
  [0, 0, 0, 3, 0, 1, 0, 0],
  [0, 2, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 1, 0, 3, 0],
  [3, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 2, 0, 0],
]
</script>

<template>
  <section class="hero" :class="{ 'is-closed': !open }">
    <div class="container hero-inner">
      <!-- 左：标题区 -->
      <div class="hero-copy">
        <p class="eyebrow stagger-item">
          TODAY&nbsp;·&nbsp;{{ new Date().getMonth() + 1 }}月{{ new Date().getDate() }}日&nbsp;·&nbsp;新一季菜单
        </p>

        <h1 class="hero-title">
          <span class="pre"><span class="sq steel"></span>一卷给味蕾的素净白</span>
          <span class="line line-1">把<em>田野</em></span>
          <span class="line line-2">装进<span class="steel-word">便当</span>盒</span>
        </h1>

        <p class="hero-sub">
          每一份 dash·foods 都从本地农场清晨采摘开始，
          由我们的主厨团队手工调配而成。
          <span class="underline">三十分钟内</span>送到你的桌上，配上一张手写卡片。
        </p>

        <div class="hero-meta">
          <StatusBadge :status="shop.status" />
          <span class="meta-divider" />
          <span class="meta-text">
            <em>今日供应</em>
            <strong>{{ new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }) }}</strong>
          </span>
          <span class="meta-divider" />
          <span class="meta-text">
            <em>配送范围</em>
            <strong>半径 3 km</strong>
          </span>
        </div>

        <div class="hero-cta">
          <a href="#menu" class="cta-primary">
            浏览今日菜单
            <span class="arr"></span>
          </a>
          <a href="#signature" class="cta-ghost">
            <span class="sq soft"></span>
            主厨今日推荐
          </a>
        </div>
      </div>

      <!-- 右：像素矩阵装饰 -->
      <div class="hero-visual">
        <div class="visual-frame">
          <span class="corner tl"></span>
          <span class="corner tr"></span>
          <span class="corner bl"></span>
          <span class="corner br"></span>
          <div class="matrix">
            <template v-for="(row, ri) in matrix" :key="ri">
              <i
                v-for="(cell, ci) in row"
                :key="ci"
                :class="{ ink: cell === 1, steel: cell === 2, soft: cell === 3 }"
              ></i>
            </template>
          </div>
          <div class="visual-cap">
            <span class="vc-label">PIXEL · MENU</span>
            <span class="vc-mono">8PX GRID · #FFFFFF</span>
          </div>
        </div>

        <!-- 漂浮信息卡 -->
        <div class="float-card float-card-1">
          <span class="fc-eyebrow">CHEF&nbsp;PICK</span>
          <span class="fc-name">每日鲜采</span>
          <span class="fc-meta">8 种食材 · 当日采摘</span>
        </div>
        <div class="float-card float-card-2">
          <div class="fc-rating">
            <span class="sq steel"></span>
            <span>4.9</span>
          </div>
          <span class="fc-name">2,488&nbsp;位食客推荐</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  padding: 96px 0 72px;
  overflow: hidden;
}
.hero-inner {
  position: relative;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 56px;
  align-items: center;
}

.hero-copy {
  max-width: 580px;
}

.eyebrow {
  font-family: var(--font-pix);
  font-size: var(--fs-12);
  font-weight: 400;
  letter-spacing: 0.18em;
  color: var(--color-steel);
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  animation: fade-up 480ms var(--ease-out) both;
  animation-delay: 40ms;
}
.eyebrow::before {
  content: '';
  width: 6px;
  height: 6px;
  background: var(--color-steel);
  display: inline-block;
}

.hero-title {
  margin: 22px 0 24px;
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(48px, 7vw, 96px);
  line-height: 1;
  letter-spacing: -0.025em;
  color: var(--color-ink);
}
.hero-title .pre {
  display: block;
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 300;
  color: var(--color-ink-3);
  font-size: 20px;
  margin-bottom: 18px;
  animation: fade-up 480ms var(--ease-out) both;
  animation-delay: 60ms;
}
.hero-title .pre .sq {
  margin-right: 10px;
}
.hero-title .line {
  display: block;
  overflow: hidden;
}
.hero-title .line-1 {
  animation: line-rise 720ms var(--ease-out) both;
  animation-delay: 80ms;
}
.hero-title .line-2 {
  animation: line-rise 720ms var(--ease-out) both;
  animation-delay: 180ms;
}
.hero-title em {
  font-style: italic;
  font-weight: 400;
  color: var(--color-ink);
}
.hero-title .steel-word {
  color: var(--color-steel);
  font-style: italic;
  font-weight: 400;
}
@keyframes line-rise {
  from {
    transform: translateY(110%);
  }
  to {
    transform: translateY(0);
  }
}

.hero-sub {
  font-size: var(--fs-17, 17px);
  line-height: 1.8;
  color: var(--color-ink-soft);
  max-width: 520px;
  animation: fade-up 600ms var(--ease-out) both;
  animation-delay: 320ms;
}
.hero-sub .underline {
  position: relative;
  font-weight: 500;
  color: var(--color-ink);
}
.hero-sub .underline::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 2px;
  background: var(--color-steel);
}

.hero-meta {
  display: inline-flex;
  align-items: center;
  gap: 18px;
  margin-top: 32px;
  padding: 14px 22px;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: 0;
  box-shadow: var(--shadow-soft);
  animation: fade-up 600ms var(--ease-out) both;
  animation-delay: 400ms;
}
.meta-divider {
  width: 1px;
  height: 16px;
  background: var(--color-line);
}
.meta-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-13);
}
.meta-text em {
  font-style: normal;
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--color-ink-mute);
  text-transform: uppercase;
}
.meta-text strong {
  font-weight: 500;
  font-family: var(--font-display);
  color: var(--color-ink);
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
  animation: fade-up 600ms var(--ease-out) both;
  animation-delay: 500ms;
}
.cta-primary,
.cta-ghost {
  font-family: var(--font-display);
  font-size: var(--fs-15);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 11px;
  padding: 13px 24px;
  border: 1px solid var(--color-ink);
  transition: all 0.22s var(--ease-out);
  position: relative;
}
.cta-primary {
  background: var(--color-ink);
  color: var(--color-bg);
}
.cta-primary::before {
  content: '';
  width: 6px;
  height: 6px;
  background: var(--color-bg);
  display: inline-block;
}
.cta-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px -8px rgba(10, 10, 10, 0.35);
}
.cta-ghost {
  background: transparent;
  color: var(--color-ink);
}
.cta-ghost::before {
  content: '';
  width: 6px;
  height: 6px;
  background: var(--color-ink);
  display: inline-block;
}
.cta-ghost:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px -8px rgba(10, 10, 10, 0.22);
}
.cta-primary .arr {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-right: 1px solid currentColor;
  border-top: 1px solid currentColor;
  transform: rotate(45deg);
  margin-left: 2px;
}

/* —— 右：像素矩阵装饰 —— */
.hero-visual {
  position: relative;
  aspect-ratio: 1 / 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.visual-frame {
  position: relative;
  width: 100%;
  max-width: 460px;
  aspect-ratio: 1 / 1;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fade-in 800ms var(--ease-out) both;
  animation-delay: 200ms;
}
.matrix {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  width: 70%;
}
.matrix i {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: var(--color-line-soft);
  display: block;
}
.matrix i.ink {
  background: var(--color-ink);
}
.matrix i.steel {
  background: var(--color-steel);
}
.matrix i.soft {
  background: var(--color-ink-4);
}
.visual-cap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 14px;
  display: flex;
  justify-content: space-between;
  padding: 0 18px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-ink-3);
}
.vc-label {
  font-family: var(--font-pix);
  letter-spacing: 0.14em;
}

.float-card {
  position: absolute;
  background: var(--color-paper);
  border-radius: 0;
  padding: 14px 18px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-line);
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: fade-up 600ms var(--ease-out) both;
}
.float-card-1 {
  top: 6%;
  left: -3%;
  animation-delay: 600ms;
}
.float-card-2 {
  bottom: 8%;
  right: -3%;
  animation-delay: 700ms;
}
.fc-eyebrow {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.18em;
  color: var(--color-steel);
  text-transform: uppercase;
}
.fc-name {
  font-family: var(--font-display);
  font-size: var(--fs-18);
  font-weight: 500;
  font-style: italic;
  color: var(--color-ink);
}
.fc-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-ink-mute);
}
.fc-rating {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-display);
  font-size: var(--fs-18);
  font-weight: 500;
  color: var(--color-ink);
  margin-bottom: 2px;
}

.is-closed .hero-title,
.is-closed .hero-sub {
  filter: grayscale(0.2);
}

@media (max-width: 1024px) {
  .hero-inner {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .visual-frame {
    max-width: 380px;
  }
}
</style>
