import { http, unwrap } from './request'
import type {
  PageResult,
  Setmeal,
  SetmealDTO,
  SetmealPageQuery,
  SetmealVO,
} from '@/types/api'

/** 新增套餐（含 setmealDishes） */
export function createSetmeal(dto: SetmealDTO) {
  return unwrap<void>(http.post('/setmeal', dto))
}

/** 修改套餐 */
export function updateSetmeal(dto: SetmealDTO) {
  return unwrap<void>(http.put('/setmeal', dto))
}

/** 批量删除 */
export function deleteSetmeal(ids: number[]) {
  return unwrap<void>(http.delete('/setmeal', { params: { ids } }))
}

/** 起售 / 停售 */
export function toggleSetmealStatus(id: number, status: number) {
  return unwrap<void>(http.post(`/setmeal/status/${status}`, null, { params: { id } }))
}

/** 分页查询 */
export function pageSetmeal(params: SetmealPageQuery) {
  return unwrap<PageResult<Setmeal>>(http.get('/setmeal/page', { params }))
}

/** 套餐详情（含 setmealDishes + categoryName） */
export function getSetmealDetail(id: number) {
  return unwrap<SetmealVO>(http.get(`/setmeal/${id}`))
}