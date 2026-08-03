import { request } from './request'
import type { Setmeal, DishItemVO } from '@/types/api'

export const listSetmealByCategory = (categoryId: number) =>
  request<Setmeal[]>({
    url: '/user/setmeal/list',
    method: 'GET',
    params: { categoryId },
  })

export const getSetmealDishes = (id: number) =>
  request<DishItemVO[]>({
    url: `/user/setmeal/dish/${id}`,
    method: 'GET',
  })