import { request } from './request'
import type { DishVO } from '@/types/api'

export const listDishByCategory = (categoryId: number) =>
  request<DishVO[]>({
    url: '/user/dish/list',
    method: 'GET',
    params: { categoryId },
  })