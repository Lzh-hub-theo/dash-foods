import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as empApi from '@/api/employee'
import type {
  Employee,
  EmployeeDTO,
  EmployeePageQuery,
  PasswordEditDTO,
} from '@/types/api'
import { ElMessage } from '@/api/notify'

export const useEmployeeStore = defineStore('employee', () => {
  const list = ref<Employee[]>([])
  const total = ref<number>(0)
  const loading = ref<boolean>(false)
  const lastQuery = ref<EmployeePageQuery>({ page: 1, pageSize: 10 })

  async function fetchPage(q: EmployeePageQuery) {
    loading.value = true
    lastQuery.value = q
    try {
      const data = await empApi.pageEmployee(q)
      list.value = data.records || []
      total.value = data.total || 0
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    await fetchPage(lastQuery.value)
  }

  async function create(dto: EmployeeDTO) {
    await empApi.createEmployee(dto)
    ElMessage.success('员工已添加')
    await refresh()
  }

  async function update(dto: EmployeeDTO) {
    await empApi.updateEmployee(dto)
    ElMessage.success('员工已更新')
    await refresh()
  }

  async function getDetail(id: number) {
    return await empApi.getEmployeeDetail(id)
  }

  async function toggleStatus(id: number, currentStatus: number) {
    const next = currentStatus === 1 ? 0 : 1
    await empApi.toggleEmployeeStatus(id, next)
    ElMessage.success(next === 1 ? '已启用' : '已禁用')
    await refresh()
  }

  async function changePassword(dto: PasswordEditDTO) {
    await empApi.editPassword(dto)
    ElMessage.success('密码已修改')
  }

  return {
    list, total, loading, lastQuery,
    fetchPage, refresh, create, update, getDetail, toggleStatus, changePassword,
  }
})