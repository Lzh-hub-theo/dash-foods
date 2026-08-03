import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as orderApi from '@/api/order'
import type { OrderSearchQuery, OrderVO } from '@/types/api'
import { ElMessage } from '@/api/notify'

export const useOrderStore = defineStore('order', () => {
  const list = ref<OrderVO[]>([])
  const total = ref<number>(0)
  const loading = ref<boolean>(false)
  const lastQuery = ref<OrderSearchQuery>({ page: 1, pageSize: 10 })

  async function search(q: OrderSearchQuery) {
    loading.value = true
    lastQuery.value = q
    try {
      const data = await orderApi.searchOrders(q)
      list.value = data.records || []
      total.value = data.total || 0
    } finally {
      loading.value = false
    }
  }

  async function getDetail(id: number) {
    return orderApi.getOrderDetail(id)
  }

  async function confirm(id: number) {
    await orderApi.confirmOrder({ id, status: 6 })
    ElMessage.success('已接单')
    await search(lastQuery.value)
  }
  async function reject(id: number, reason: string) {
    await orderApi.rejectOrder({ id, cancelReason: reason })
    ElMessage.success('已拒单')
    await search(lastQuery.value)
  }
  async function cancel(id: number, reason: string) {
    await orderApi.cancelOrder({ id, cancelReason: reason })
    ElMessage.success('已取消')
    await search(lastQuery.value)
  }
  async function delivery(id: number) {
    await orderApi.deliveryOrder(id)
    ElMessage.success('已派送')
    await search(lastQuery.value)
  }
  async function complete(id: number) {
    await orderApi.completeOrder(id)
    ElMessage.success('已完成')
    await search(lastQuery.value)
  }

  return {
    list, total, loading, lastQuery,
    search, getDetail,
    confirm, reject, cancel, delivery, complete,
  }
})