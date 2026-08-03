import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as catApi from '@/api/category'
import type { Category } from '@/types/api'
import { ElMessage } from '@/api/notify'

export const useCategoryStore = defineStore('category', () => {
  const list = ref<Category[]>([])
  const total = ref<number>(0)
  const loading = ref<boolean>(false)
  const lastQuery = ref<{ page: number; pageSize: number; name?: string; type?: number }>({
    page: 1,
    pageSize: 10,
  })

  async function fetchPage(
    q: { page: number; pageSize: number; name?: string; type?: number },
  ) {
    loading.value = true
    lastQuery.value = q
    try {
      const data = await catApi.pageCategory(q)
      list.value = data.records || []
      total.value = data.total || 0
    } finally {
      loading.value = false
    }
  }

  async function create(dto: Partial<Category>) {
    await catApi.createCategory(dto)
    ElMessage.success('分类已添加')
    await fetchPage(lastQuery.value)
  }

  async function update(dto: Partial<Category>) {
    await catApi.updateCategory(dto)
    ElMessage.success('分类已更新')
    await fetchPage(lastQuery.value)
  }

  async function remove(id: number) {
    await catApi.deleteCategory(id)
    ElMessage.success('分类已删除')
    await fetchPage(lastQuery.value)
  }

  async function toggleStatus(id: number, currentStatus: number) {
    const next = currentStatus === 1 ? 0 : 1
    await catApi.toggleCategoryStatus(id, next)
    ElMessage.success(next === 1 ? '已启用' : '已停用')
    await fetchPage(lastQuery.value)
  }

  return { list, total, loading, lastQuery, fetchPage, create, update, remove, toggleStatus }
})