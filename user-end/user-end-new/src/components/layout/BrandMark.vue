<script setup lang="ts">
/**
 * dash-foods · 品牌 Logo
 * 净白像素风：方框 + 内嵌实心方印，钢青冷调
 */
</script>

<template>
  <span class="brand-mark" aria-label="dash-foods">
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 外方框：发丝线 -->
      <rect
        x="6"
        y="6"
        width="52"
        height="52"
        fill="none"
        stroke="#0A0A0A"
        stroke-width="2"
      />
      <!-- 内嵌实心方印：钢青 -->
      <rect x="18" y="18" width="28" height="28" fill="#475569" />
      <!-- 中心小方点：浓墨，作标点 -->
      <rect x="29" y="29" width="6" height="6" fill="#0A0A0A" />
    </svg>
  </span>
</template>

<style scoped>
.brand-mark {
  display: inline-flex;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
.brand-mark svg {
  width: 100%;
  height: 100%;
}
</style>
