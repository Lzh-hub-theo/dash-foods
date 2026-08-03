import { request } from './request'
import type { Category } from '@/types/api'

/** type=1 菜品分类 / type=2 套餐分类 */
export const listCategory = (type: 1 | 2 = 1) =>
  request<Category[]>({
    url: '/user/category/list',
    method: 'GET',
    params: { type },
  })