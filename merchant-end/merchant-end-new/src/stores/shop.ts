import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as shopApi from '@/api/shop'

export const useShopStore = defineStore('shop', () => {
  const status = ref<number>(0)        // 1 营业 / 0 打烊
  const loaded = ref<boolean>(false)

  const isOpen = computed(() => status.value === 1)
  const statusLabel = computed(() => (isOpen.value ? '营业中' : '已打烊'))

  async function fetchStatus() {
    try {
      status.value = await shopApi.getShopStatus()
      loaded.value = true
    } catch {
      // 失败保留默认
    }
  }

  async function toggle() {
    const next = isOpen.value ? 0 : 1
    await shopApi.setShopStatus(next)
    status.value = next
    loaded.value = true
  }

  return { status, loaded, isOpen, statusLabel, fetchStatus, toggle }
})