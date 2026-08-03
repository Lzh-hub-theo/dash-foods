/**
 * dash-foods · 菜单 store（分类 + 菜品 + 套餐）
 *
 * 带 localStorage TTL 缓存：5 分钟内命中跳过 fetchAll。
 */
import { defineStore } from 'pinia'
import { listCategory } from '@/api/category'
import { listDishByCategory } from '@/api/dish'
import { listSetmealByCategory, getSetmealDishes } from '@/api/setmeal'
import type { Category, DishVO, Setmeal, DishItemVO } from '@/types/api'

interface CategoryWithItems extends Category {
  dishes: DishVO[]
  setmeals: Setmeal[]
}

const CACHE_KEY = 'dash.menu.cache.v1'
const CACHE_TTL_MS = 5 * 60 * 1000

interface CachePayload {
  ts: number
  categories: CategoryWithItems[]
  activeCategoryId: number
  signature: ReturnType<typeof useMenuStore>['signature']
}

function readCache(): CachePayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as CachePayload
    if (!data?.ts || !Array.isArray(data.categories)) return null
    if (Date.now() - data.ts > CACHE_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

function writeCache(payload: Omit<CachePayload, 'ts'>) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ts: Date.now(), ...payload }),
    )
  } catch {
    /* 忽略写失败（隐私模式等） */
  }
}

export const useMenuStore = defineStore('menu', {
  state: () => ({
    categories: [] as CategoryWithItems[],
    activeCategoryId: 0 as number,
    loading: false,
    /** 套餐详情缓存 */
    setmealDishesCache: {} as Record<number, DishItemVO[]>,
    /** 套餐菜品聚合（用于"主厨推荐"） */
    signature: null as null | {
      name: string
      subtitle: string
      price: number
      image: string
      blurb: string
    },
    /** 缓存命中时间，供 UI 展示 */
    cachedAt: 0 as number,
  }),
  getters: {
    activeCategory(state) {
      return state.categories.find((c) => c.id === state.activeCategoryId) || state.categories[0]
    },
    allDishes(state): DishVO[] {
      return state.categories.flatMap((c) => c.dishes)
    },
    allSetmeals(state): Setmeal[] {
      return state.categories.flatMap((c) => c.setmeals)
    },
    isCacheFresh(state) {
      return state.cachedAt > 0 && Date.now() - state.cachedAt < CACHE_TTL_MS
    },
  },
  actions: {
    async fetchAll(force = false) {
      // 命中缓存：直接水合 store
      if (!force && this.isCacheFresh && this.categories.length) return
      if (!force) {
        const hit = readCache()
        if (hit && hit.categories.length) {
          this.categories = hit.categories
          this.activeCategoryId = hit.activeCategoryId || hit.categories[0]?.id || 0
          this.signature = hit.signature
          this.cachedAt = hit.ts
          return
        }
      }
      this.loading = true
      try {
        const cats = await listCategory(1)
        const enriched: CategoryWithItems[] = await Promise.all(
          (cats ?? []).map(async (c) => {
            const [dishes, setmeals] = await Promise.allSettled([
              listDishByCategory(c.id),
              listSetmealByCategory(c.id),
            ])
            return {
              ...c,
              dishes: dishes.status === 'fulfilled' ? dishes.value : [],
              setmeals: setmeals.status === 'fulfilled' ? setmeals.value : [],
            }
          }),
        )
        this.categories = enriched
        if (enriched.length && !this.activeCategoryId) {
          this.activeCategoryId = enriched[0].id
        }
        this.buildSignature()
        this.cachedAt = Date.now()
        writeCache({
          categories: this.categories,
          activeCategoryId: this.activeCategoryId,
          signature: this.signature,
        })
      } catch {
        this.categories = []
      } finally {
        this.loading = false
      }
    },
    setActive(id: number) {
      this.activeCategoryId = id
    },
    async fetchSetmealDishes(id: number) {
      if (this.setmealDishesCache[id]) return this.setmealDishesCache[id]
      const list = await getSetmealDishes(id)
      this.setmealDishesCache[id] = list ?? []
      return this.setmealDishesCache[id]
    },
    buildSignature() {
      const all = this.allDishes
      if (!all.length) {
        this.signature = null
        return
      }
      // 挑一个价格中等偏高、有 description 的作为"主厨推荐"
      const sorted = [...all].sort((a, b) => (b.price || 0) - (a.price || 0))
      const pick = sorted[Math.min(2, sorted.length - 1)]
      this.signature = {
        name: pick.name,
        subtitle: pick.categoryName || 'Chef’s pick',
        price: Number(pick.price) || 0,
        image: pick.image,
        blurb:
          pick.description?.slice(0, 80) ||
          '今日推荐 —— 由主厨精选当日新鲜食材手工烹制，限每日 12 份。',
      }
    },
  },
})