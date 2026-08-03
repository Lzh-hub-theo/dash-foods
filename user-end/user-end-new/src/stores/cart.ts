/**
 * dash-foods · 购物车 store
 * - 后端持久化为准，每次操作同步调用接口
 * - 同时保留一份本地缓存用于乐观更新
 */
import { defineStore } from 'pinia'
import {
  addShoppingCart,
  cleanShoppingCart,
  listShoppingCart,
  subShoppingCart,
} from '@/api/cart'
import type { ShoppingCart } from '@/types/api'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as ShoppingCart[],
    loading: false,
    drawerOpen: false,
  }),
  getters: {
    totalCount: (s) => s.items.reduce((acc, it) => acc + it.number, 0),
    totalAmount: (s) =>
      Number(
        s.items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0).toFixed(2),
      ),
    isEmpty: (s) => s.items.length === 0,
  },
  actions: {
    async fetch() {
      this.loading = true
      try {
        const list = await listShoppingCart()
        this.items = list ?? []
      } catch {
        // 后端未启或未登录时保留空数组
        this.items = []
      } finally {
        this.loading = false
      }
    },
    async add(payload: { dishId?: number; setmealId?: number; dishFlavor?: string }) {
      // 乐观更新
      const exists = this.items.find(
        (it) =>
          (payload.dishId && it.dishId === payload.dishId && it.dishFlavor === (payload.dishFlavor ?? '')) ||
          (payload.setmealId && it.setmealId === payload.setmealId),
      )
      if (exists) {
        exists.number += 1
      }
      try {
        await addShoppingCart(payload)
        await this.fetch()
      } catch {
        /* fetch 失败保留乐观状态 */
      }
    },
    async sub(payload: { dishId?: number; setmealId?: number; dishFlavor?: string }) {
      const exists = this.items.find(
        (it) =>
          (payload.dishId && it.dishId === payload.dishId && it.dishFlavor === (payload.dishFlavor ?? '')) ||
          (payload.setmealId && it.setmealId === payload.setmealId),
      )
      if (exists) {
        exists.number = Math.max(0, exists.number - 1)
        if (exists.number === 0) {
          this.items = this.items.filter((it) => it !== exists)
        }
      }
      try {
        await subShoppingCart(payload)
        await this.fetch()
      } catch {
        /* ignore */
      }
    },
    async clean() {
      this.items = []
      try {
        await cleanShoppingCart()
      } catch {
        /* ignore */
      }
    },
    openDrawer() {
      this.drawerOpen = true
    },
    closeDrawer() {
      this.drawerOpen = false
    },
  },
})