<script setup lang="ts">
/**
 * dash-foods · 滚动标语条（marquee）
 */
const phrases = [
  '今日鲜采 · 来自 60 公里外的合作农场',
  '主食现做 · 30 分钟内送达',
  '每单配赠一张手写感谢卡',
  '支持自定义忌口与少油少盐',
  '环保纸浆盒 · 可降解餐具',
]
</script>

<template>
  <div class="marquee-bar" aria-hidden="true">
    <div class="marquee-track">
      <div class="marquee-content">
        <span v-for="(p, i) in phrases" :key="`a-${i}`" class="phrase">
          <em class="leaf">❀</em>
          {{ p }}
        </span>
      </div>
      <div class="marquee-content" aria-hidden="true">
        <span v-for="(p, i) in phrases" :key="`b-${i}`" class="phrase">
          <em class="leaf">❀</em>
          {{ p }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.marquee-bar {
  border-top: 1px solid var(--color-line-soft);
  border-bottom: 1px solid var(--color-line-soft);
  background: var(--color-cream-soft);
  overflow: hidden;
  white-space: nowrap;
  padding: 12px 0;
}
.marquee-track {
  display: inline-flex;
  width: max-content;
  animation: marquee 40s linear infinite;
}
.marquee-content {
  display: inline-flex;
  align-items: center;
}
.phrase {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 28px;
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-14);
  color: var(--color-ink-soft);
  letter-spacing: 0.02em;
}
.phrase .leaf {
  font-style: normal;
  color: var(--color-sage);
  font-size: 12px;
}
</style>