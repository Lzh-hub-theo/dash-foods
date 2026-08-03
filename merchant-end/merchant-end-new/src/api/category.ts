import { http, unwrap } from './request'
import type { Category } from '@/types/api'

/** 新增分类 */
export function createCategory(dto: Partial<Category>) {
  return unwrap<void>(http.post('/category', dto))
}

/** 修改分类 */
export function updateCategory(dto: Partial<Category>) {
  return unwrap<void>(http.put('/category', dto))
}

/** 删除分类 */
export function deleteCategory(id: number) {
  return unwrap<void>(http.delete('/category', { params: { id } }))
}

/** 启用 / 禁用 */
export function toggleCategoryStatus(id: number, status: number) {
  return unwrap<void>(http.post(`/category/status/${status}`, null, { params: { id } }))
}

/** 按类型查询（菜品分类 1 / 套餐分类 2） */
export function listCategoryByType(type: number) {
  return unwrap<Category[]>(http.get('/category/list', { params: { type } }))
}

/** 分页查询 */
export function pageCategory(params: {
  page: number
  pageSize: number
  name?: string
  type?: number
}) {
  return unwrap<{ records: Category[]; total: number }>(http.get('/category/page', { params }))
}