import { request } from './request'
import type {
  OrderVO,
  OrdersSubmitDTO,
  OrdersPaymentDTO,
  OrderPaymentVO,
  PageResult,
} from '@/types/api'

export const submitOrder = (data: OrdersSubmitDTO) =>
  request<string>({ url: '/user/order/submit', method: 'POST', data })

export const payOrder = (data: OrdersPaymentDTO) =>
  request<OrderPaymentVO>({ url: '/user/order/payment', method: 'PUT', data })

export const cancelOrder = (id: number) =>
  request<void>({ url: `/user/order/cancel/${id}`, method: 'PUT' })

export const reminderOrder = (id: number) =>
  request<void>({ url: `/user/order/reminder/${id}`, method: 'GET' })

export const repetitionOrder = (id: number) =>
  request<void>({ url: `/user/order/repetition/${id}`, method: 'POST' })

export const getOrderDetail = (id: number) =>
  request<OrderVO>({ url: `/user/order/orderDetail/${id}`, method: 'GET' })

export const getOrderStatus = (taskId: string, options?: { silent?: boolean }) =>
  request<Record<string, unknown>>({
    url: `/user/order/order/status/${taskId}`,
    method: 'GET',
    silent: options?.silent,
  })

export const historyOrders = (params: {
  page?: number
  pageSize?: number
  status?: number
}) =>
  request<PageResult<OrderVO>>({
    url: '/user/order/historyOrders',
    method: 'GET',
    params,
  })

export const getEstimatedDeliveryTime = (shopId: string, customerAddress: string) =>
  request<string>({
    url: '/user/order/getEstimatedDeliveryTime',
    method: 'GET',
    params: { shopId, customerAddress },
  })