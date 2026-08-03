/**
 * dash-foods · 口味选择浮窗状态
 *
 * DishCard 不直接持有 sheet，而是 emit `open-flavor` 到 HomeView，
 * HomeView 写入本 store，FlavorSheet 读出来自渲染。
 */
import { defineStore } from 'pinia'
import type { DishVO } from '@/types/api'

export const useFlavorStore = defineStore('flavor', {
  state: () => ({
    dish: null as DishVO | null,
    open: false,
  }),
  actions: {
    show(dish: DishVO) {
      this.dish = dish
      this.open = true
    },
    hide() {
      this.open = false
    },
  },
})