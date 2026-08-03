/**
 * dash-foods · 地址簿 store
 */
import { defineStore } from 'pinia'
import {
  listAddressBook,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAddressDefault,
} from '@/api/address'
import type { AddressBook } from '@/types/api'

export const useAddressStore = defineStore('address', {
  state: () => ({
    list: [] as AddressBook[],
    defaultId: 0 as number,
    loading: false,
    loaded: false,
  }),
  getters: {
    defaultAddress(state): AddressBook | null {
      if (!state.list.length) return null
      const def = state.list.find((a) => a.isDefault === 1 && a.id === state.defaultId)
      return def || state.list.find((a) => a.isDefault === 1) || state.list[0]
    },
  },
  actions: {
    async fetchAll(force = false) {
      if (this.loaded && !force) return
      this.loading = true
      try {
        const list = (await listAddressBook()) ?? []
        this.list = list
        this.loaded = true
        // 同步默认地址
        const def = await getAddressDefault().catch(() => null)
        this.defaultId = def?.id ?? list.find((a) => a.isDefault === 1)?.id ?? list[0]?.id ?? 0
      } catch {
        this.list = []
      } finally {
        this.loading = false
      }
    },
    async save(payload: AddressBook) {
      // 把同用户的其他地址的 isDefault 复位
      if (payload.isDefault === 1) {
        this.list.forEach((a) => {
          if (a.id !== payload.id) a.isDefault = 0
        })
      }
      if (payload.id) {
        await updateAddress(payload)
        const idx = this.list.findIndex((a) => a.id === payload.id)
        if (idx >= 0) this.list[idx] = { ...this.list[idx], ...payload }
        else this.list.unshift(payload)
      } else {
        await addAddress(payload)
        // 简化处理：保存后整体刷新列表
        await this.fetchAll(true)
      }
    },
    async remove(id: number) {
      await deleteAddress(id)
      this.list = this.list.filter((a) => a.id !== id)
      if (this.defaultId === id) this.defaultId = this.list[0]?.id ?? 0
    },
    async setDefault(id: number) {
      const target = this.list.find((a) => a.id === id)
      if (!target) return
      await setDefaultAddress({ ...target, isDefault: 1 })
      this.list.forEach((a) => (a.isDefault = a.id === id ? 1 : 0))
      this.defaultId = id
    },
  },
})