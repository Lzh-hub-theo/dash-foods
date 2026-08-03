<script setup lang="ts">
import { computed } from 'vue'
import { useShopStore } from '@/stores/shop'
import StatusBadge from '@/components/layout/StatusBadge.vue'

const shop = useShopStore()
const open = computed(() => shop.isOpen)
</script>

<template>
  <section class="hero" :class="{ 'is-closed': !open }">
    <div class="container hero-inner">
      <!-- 左：标题区 -->
      <div class="hero-copy">
        <p class="eyebrow stagger-item">TODAY&nbsp;·&nbsp;{{ new Date().getMonth() + 1 }}月{{ new Date().getDate() }}日&nbsp;·&nbsp;新一季菜单</p>

        <h1 class="hero-title">
          <span class="line line-1">把<em>田野</em></span>
          <span class="line line-2">装进便当盒</span>
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </a>
          <a href="#signature" class="cta-ghost">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2 15 8l7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
            </svg>
            主厨今日推荐
          </a>
        </div>
      </div>

      <!-- 右：手绘插画 + 卡片 -->
      <div class="hero-visual">
        <div class="visual-bg">
          <svg viewBox="0 0 480 540" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="plate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#FFFEFA" />
                <stop offset="1" stop-color="#F4EFE4" />
              </linearGradient>
              <radialGradient id="glow" cx="50%" cy="40%" r="60%">
                <stop offset="0" stop-color="#FFE9B8" stop-opacity="0.7" />
                <stop offset="1" stop-color="#FFE9B8" stop-opacity="0" />
              </radialGradient>
            </defs>
            <!-- 柔和光晕 -->
            <ellipse cx="240" cy="220" rx="220" ry="220" fill="url(#glow)" />
            <!-- 餐盘 -->
            <ellipse cx="240" cy="280" rx="200" ry="60" fill="#E5DFD0" opacity="0.5" />
            <circle cx="240" cy="240" r="190" fill="url(#plate)" stroke="#E5DFD0" stroke-width="1.5" />
            <circle cx="240" cy="240" r="160" fill="none" stroke="#E5DFD0" stroke-dasharray="2 6" stroke-width="1" />
            <!-- 主食沙拉：椭圆菜叶群 -->
            <g transform="translate(240, 240)">
              <ellipse cx="-50" cy="20" rx="60" ry="22" fill="#A4C49A" transform="rotate(-22 -50 20)" />
              <ellipse cx="40" cy="-10" rx="55" ry="20" fill="#3F6B3A" transform="rotate(18 40 -10)" />
              <ellipse cx="-20" cy="-40" rx="48" ry="18" fill="#708A4A" transform="rotate(-8 -20 -40)" />
              <!-- 小番茄 -->
              <circle cx="20" cy="40" r="16" fill="#D9534F" />
              <circle cx="16" cy="36" r="4" fill="#FCEDEB" opacity="0.6" />
              <circle cx="-50" cy="-50" r="14" fill="#F2A65A" />
              <circle cx="-52" cy="-52" r="3" fill="#FFFEFA" opacity="0.7" />
              <!-- 鸡蛋 -->
              <ellipse cx="60" cy="50" rx="22" ry="18" fill="#FFFEFA" stroke="#E5DFD0" />
              <circle cx="60" cy="50" r="10" fill="#F2A65A" />
              <!-- 谷物 -->
              <circle cx="80" cy="-40" r="3" fill="#E08838" />
              <circle cx="92" cy="-30" r="3" fill="#E08838" />
              <circle cx="84" cy="-26" r="3" fill="#E08838" />
              <circle cx="-90" cy="0" r="3" fill="#E08838" />
              <circle cx="-80" cy="10" r="3" fill="#E08838" />
              <circle cx="-100" cy="-10" r="3" fill="#E08838" />
              <!-- 顶部小叶子 -->
              <path d="M -10 -90 C 0 -110, 30 -110, 40 -90 C 30 -100, 0 -100, -10 -90 Z" fill="#3F6B3A" />
            </g>
            <!-- 飞溅的鼠尾草叶 -->
            <g transform="translate(70, 90)" opacity="0.8">
              <path d="M0 0 C 8 -10, 26 -10, 30 0 C 26 -2, 8 -2, 0 0 Z" fill="#3F6B3A" />
              <path d="M2 4 L 28 4" stroke="#3F6B3A" stroke-width="1" />
            </g>
            <g transform="translate(390, 80)" opacity="0.7">
              <path d="M0 0 C 8 -10, 26 -10, 30 0 C 26 -2, 8 -2, 0 0 Z" fill="#3F6B3A" />
            </g>
            <g transform="translate(420, 460)" opacity="0.85">
              <path d="M0 0 C 8 -10, 26 -10, 30 0 C 26 -2, 8 -2, 0 0 Z" fill="#3F6B3A" />
            </g>
          </svg>
        </div>

        <!-- 漂浮信息卡 -->
        <div class="float-card float-card-1">
          <span class="fc-eyebrow">CHEF&nbsp;PICK</span>
          <span class="fc-name">每日鲜采</span>
          <span class="fc-meta">8 种食材 · 当日采摘</span>
        </div>
        <div class="float-card float-card-2">
          <div class="fc-rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#F2A65A"><path d="M12 2 15 8l7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>
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
  padding: 72px 0 56px;
  overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-leaf);
  pointer-events: none;
  opacity: 0.7;
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
  font-size: var(--fs-12);
  font-weight: 600;
  letter-spacing: 0.28em;
  color: var(--color-sage);
  text-transform: uppercase;
  animation: fade-up 480ms var(--ease-out) both;
  animation-delay: 40ms;
}

.hero-title {
  margin: 22px 0 24px;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(56px, 7.4vw, 96px);
  line-height: 0.98;
  letter-spacing: -0.035em;
  color: var(--color-ink);
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
  color: var(--color-sage-deep);
}
.hero-title em {
  font-style: italic;
  color: var(--color-sage);
  position: relative;
}
.hero-title em::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.08em;
  height: 0.16em;
  background: var(--color-butter);
  border-radius: 4px;
  z-index: -1;
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
  font-size: var(--fs-17);
  line-height: 1.65;
  color: var(--color-ink-soft);
  max-width: 520px;
  animation: fade-up 600ms var(--ease-out) both;
  animation-delay: 320ms;
}
.hero-sub .underline {
  position: relative;
  font-weight: 600;
  color: var(--color-ink);
}
.hero-sub .underline::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 2px;
  background: var(--color-sage);
  border-radius: 2px;
}

.hero-meta {
  display: inline-flex;
  align-items: center;
  gap: 18px;
  margin-top: 32px;
  padding: 14px 22px;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
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
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--color-ink-mute);
  text-transform: uppercase;
}
.meta-text strong {
  font-weight: 600;
  font-family: var(--font-display);
  color: var(--color-ink);
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  margin-top: 36px;
  animation: fade-up 600ms var(--ease-out) both;
  animation-delay: 500ms;
}
.cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 28px;
  background: var(--color-ink);
  color: var(--color-paper);
  border-radius: var(--radius-pill);
  font-size: var(--fs-15);
  font-weight: 600;
  letter-spacing: 0.02em;
  transition:
    transform var(--dur-base) var(--ease-out),
    background var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out);
}
.cta-primary:hover {
  background: var(--color-sage-deep);
  transform: translateY(-2px);
  box-shadow: 0 16px 32px -10px rgba(47, 82, 48, 0.4);
}
.cta-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 22px;
  color: var(--color-ink);
  font-size: var(--fs-15);
  font-weight: 500;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-line);
  background: var(--color-paper);
  transition: border-color var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);
}
.cta-ghost:hover {
  border-color: var(--color-sage);
  color: var(--color-sage-deep);
}

/* —— 右：插画 —— */
.hero-visual {
  position: relative;
  aspect-ratio: 1 / 1.1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.visual-bg {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 30px 60px rgba(63, 107, 58, 0.18));
  animation: fade-in 800ms var(--ease-out) both;
  animation-delay: 200ms;
}
.visual-bg svg {
  width: 90%;
  height: auto;
  max-width: 520px;
}

.float-card {
  position: absolute;
  background: var(--color-paper);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-line-soft);
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: fade-up 600ms var(--ease-out) both;
}
.float-card-1 {
  top: 12%;
  left: 4%;
  animation-delay: 600ms;
}
.float-card-2 {
  bottom: 14%;
  right: 6%;
  animation-delay: 700ms;
}
.fc-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.28em;
  color: var(--color-sage);
}
.fc-name {
  font-family: var(--font-display);
  font-size: var(--fs-18);
  font-weight: 500;
  color: var(--color-ink);
}
.fc-meta {
  font-size: var(--fs-12);
  color: var(--color-ink-mute);
  letter-spacing: 0.04em;
}
.fc-rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-display);
  font-size: var(--fs-18);
  font-weight: 600;
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
  .hero-visual {
    aspect-ratio: 4 / 3;
  }
}
</style>