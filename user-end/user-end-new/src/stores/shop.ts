/**
 * dash-foods · 店铺 store
 * - status：1=营业中 0=休息中（来自后端 Redis 缓存）
 * - merchant：从 getMerchantInfo 拉到的商家信息（电话 / 公告等）
 *
 * 注意：fetchStatus 失败时保留 status=0（不默认营业），由调用方根据 loaded 决定兜底。
 * 这样打烊时按钮可被正确禁用，避免演示态误判。
 */
import { defineStore } from 'pinia'
import { getMerchantInfo, getShopStatus } from '@/api/shop'
import type { ShopInfoDTO } from '@/types/api'

export const useShopStore = defineStore('shop', {
  state: () => ({
    status: 0 as number,
    loaded: false,
    merchant: null as ShopInfoDTO | null,
    merchantLoaded: false,
  }),
  getters: {
    isOpen: (s) => s.status === 1,
    /** 没拉到结果时按休息中处理（状态未确认），调用方在需要兜底时使用 */
    isOpenOrUnknown: (s) => s.loaded ? s.status === 1 : true,
    phone: (s) => s.merchant?.phone || '',
  },
  actions: {
    async fetchStatus() {
      try {
        this.status = await getShopStatus()
      } catch {
        // 失败不强行置 1；调用方按 isOpenOrUnknown 兜底
        this.status = 0
      } finally {
        this.loaded = true
      }
    },
    async fetchMerchant() {
      if (this.merchantLoaded) return
      try {
        this.merchant = (await getMerchantInfo()) ?? null
      } catch {
        this.merchant = null
      } finally {
        this.merchantLoaded = true
      }
    },
  },
})
