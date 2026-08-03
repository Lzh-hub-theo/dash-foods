import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as setmealApi from '@/api/setmeal'
import type {
  Setmeal,
  SetmealDTO,
  SetmealPageQuery,
} from '@/types/api'
import { ElMessage } from '@/api/notify'

export const useSetmealStore = defineStore('setmeal', () => {
  const list = ref<Setmeal[]>([])
  const total = ref<number>(0)
  const loading = ref<boolean>(false)
  const lastQuery = ref<SetmealPageQuery>({ page: 1, pageSize: 10 })

  async function fetchPage(q: SetmealPageQuery) {
    loading.value = true
    lastQuery.value = q
    try {
      const data = await setmealApi.pageSetmeal(q)
      list.value = data.records || []
      total.value = data.total || 0
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    await fetchPage(lastQuery.value)
  }

  async function create(dto: SetmealDTO) {
    await setmealApi.createSetmeal(dto)
    ElMessage.success('套餐已添加')
    await refresh()
  }

  async function update(dto: SetmealDTO) {
    await setmealApi.updateSetmeal(dto)
    ElMessage.success('套餐已更新')
    await refresh()
  }

  async function remove(ids: number[]) {
    await setmealApi.deleteSetmeal(ids)
    ElMessage.success(`已删除 ${ids.length} 项`)
    await refresh()
  }

  async function getDetail(id: number) {
    return await setmealApi.getSetmealDetail(id)
  }

  async function toggleStatus(id: number, currentStatus: number) {
    const next = currentStatus === 1 ? 0 : 1
    await setmealApi.toggleSetmealStatus(id, next)
    ElMessage.success(next === 1 ? '已起售' : '已停售')
    await refresh()
  }

  return {
    list, total, loading, lastQuery,
    fetchPage, refresh, create, update, remove, getDetail, toggleStatus,
  }
})