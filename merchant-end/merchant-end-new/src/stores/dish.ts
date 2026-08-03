import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as dishApi from '@/api/dish'
import type { Dish, DishDTO, DishPageQuery, DishVO } from '@/types/api'
import { ElMessage } from '@/api/notify'

export const useDishStore = defineStore('dish', () => {
  const list = ref<Dish[]>([])
  const total = ref<number>(0)
  const loading = ref<boolean>(false)
  const lastQuery = ref<DishPageQuery>({ page: 1, pageSize: 10 })

  async function fetchPage(q: DishPageQuery) {
    loading.value = true
    lastQuery.value = q
    try {
      const data = await dishApi.pageDish(q)
      list.value = data.records || []
      total.value = data.total || 0
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    await fetchPage(lastQuery.value)
  }

  async function create(dto: DishDTO) {
    await dishApi.createDish(dto)
    ElMessage.success('菜品已添加')
    await refresh()
  }

  async function update(dto: DishVO) {
    await dishApi.updateDish(dto)
    ElMessage.success('菜品已更新')
    await refresh()
  }

  async function remove(ids: number[]) {
    await dishApi.deleteDish(ids)
    ElMessage.success(`已删除 ${ids.length} 项`)
    await refresh()
  }

  async function getDetail(id: number) {
    return await dishApi.getDishDetail(id)
  }

  async function toggleStatus(id: number, currentStatus: number) {
    const next = currentStatus === 1 ? 0 : 1
    await dishApi.toggleDishStatus(id, next)
    ElMessage.success(next === 1 ? '已起售' : '已停售')
    await refresh()
  }

  return {
    list, total, loading, lastQuery,
    fetchPage, refresh, create, update, remove, getDetail, toggleStatus,
  }
})