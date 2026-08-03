<script setup lang="ts">
/**
 * dash-foods · 品牌 Logo SVG
 * 由一片鼠尾草叶 + "d" 字母组成的极简徽标
 */
</script>

<template>
  <span class="brand-mark" aria-label="dash-foods">
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="leafGrad" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0" stop-color="#A4C49A" />
          <stop offset="1" stop-color="#3F6B3A" />
        </linearGradient>
      </defs>
      <!-- 圆盘 -->
      <circle cx="32" cy="32" r="30" fill="#F4EFE4" stroke="#3F6B3A" stroke-width="1.5" />
      <!-- 主叶 -->
      <path
        d="M20 44 C 18 30, 30 16, 46 18 C 44 32, 36 44, 20 44 Z"
        fill="url(#leafGrad)"
      />
      <!-- 叶脉 -->
      <path
        d="M22 42 C 28 36, 36 28, 44 22"
        stroke="#F4EFE4"
        stroke-width="1.2"
        stroke-linecap="round"
        fill="none"
      />
      <!-- d 字母 -->
      <text
        x="44"
        y="44"
        text-anchor="middle"
        font-family="Fraunces, Georgia, serif"
        font-style="italic"
        font-weight="600"
        font-size="20"
        fill="#1F2A1D"
      >
        d
      </text>
    </svg>
  </span>
</template>

<style scoped>
.brand-mark {
  display: inline-flex;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}
.brand-mark svg {
  width: 100%;
  height: 100%;
}
</style>