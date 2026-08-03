import { http, unwrap } from './request'
import type {
  OrderSearchQuery,
  OrderVO,
  OrdersCancelDTO,
  OrdersConfirmDTO,
} from '@/types/api'

/** 订单搜索（conditionSearch） */
export function searchOrders(params: OrderSearchQuery) {
  return unwrap<{ records: OrderVO[]; total: number }>(
    http.get('/order/conditionSearch', { params }),
  )
}

/** 订单详情 */
export function getOrderDetail(id: number) {
  return unwrap<OrderVO>(http.get(`/order/details/${id}`))
}

/** 接单（status 字段对应 6=已确认） */
export function confirmOrder(dto: OrdersConfirmDTO) {
  return unwrap<void>(http.put('/order/confirm', dto))
}

/** 拒单 */
export function rejectOrder(dto: OrdersCancelDTO) {
  return unwrap<void>(http.put('/order/rejection', dto))
}

/** 取消 */
export function cancelOrder(dto: OrdersCancelDTO) {
  return unwrap<void>(http.put('/order/cancel', dto))
}

/** 派送 */
export function deliveryOrder(id: number) {
  return unwrap<void>(http.put(`/order/delivery/${id}`))
}

/** 完成 */
export function completeOrder(id: number) {
  return unwrap<void>(http.put(`/order/complete/${id}`))
}

/** 状态统计 */
export function getOrderStatistics() {
  return unwrap<{
    toBeConfirmed: number
    confirmed: number
    deliveryInProgress: number
  }>(http.get('/order/statistics'))
}