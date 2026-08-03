import { http, unwrap } from './request'
import type {
  BusinessDataVO,
  DishOverViewVO,
  OrderOverViewVO,
  SetmealOverViewVO,
} from '@/types/api'

/** 今日运营数据 */
export function getBusinessData() {
  return unwrap<BusinessDataVO>(http.get('/workspace/businessData'))
}

/** 菜品总览 */
export function getDishesOverview() {
  return unwrap<DishOverViewVO>(http.get('/workspace/overviewDishes'))
}

/** 套餐总览 */
export function getSetmealsOverview() {
  return unwrap<SetmealOverViewVO>(http.get('/workspace/overviewSetmeals'))
}

/** 订单总览 */
export function getOrdersOverview() {
  return unwrap<OrderOverViewVO>(http.get('/workspace/overviewOrders'))
}