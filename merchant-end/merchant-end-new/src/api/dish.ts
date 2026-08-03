import { http, unwrap } from './request'
import type { Dish, DishDTO, DishPageQuery, DishVO, PageResult } from '@/types/api'

/** 新增菜品（含口味） */
export function createDish(dto: DishDTO) {
  return unwrap<void>(http.post('/dish', dto))
}

/** 修改菜品（含口味） */
export function updateDish(dto: DishVO) {
  return unwrap<void>(http.put('/dish', dto))
}

/** 批量删除菜品 */
export function deleteDish(ids: number[]) {
  return unwrap<void>(http.delete('/dish', { params: { ids } }))
}

/** 菜品起售 / 停售 */
export function toggleDishStatus(id: number, status: number) {
  return unwrap<void>(http.post(`/dish/status/${status}`, null, { params: { id } }))
}

/** 菜品分页 */
export function pageDish(params: DishPageQuery) {
  return unwrap<PageResult<Dish>>(http.get('/dish/page', { params }))
}

/** 菜品详情（含口味 + categoryName） */
export function getDishDetail(id: number) {
  return unwrap<DishVO>(http.get(`/dish/${id}`))
}

/** 按分类 id 查菜品（未分页、用于套餐编辑时挑选） */
export function listDishByCategory(categoryId: number) {
  return unwrap<Dish[]>(http.get('/dish/list', { params: { categoryId } }))
}