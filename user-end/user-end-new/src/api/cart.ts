import { request } from './request'
import type { ShoppingCart, ShoppingCartDTO } from '@/types/api'

export const addShoppingCart = (data: ShoppingCartDTO) =>
  request<void>({ url: '/user/shoppingCart/add', method: 'POST', data })

export const subShoppingCart = (data: ShoppingCartDTO) =>
  request<void>({ url: '/user/shoppingCart/sub', method: 'POST', data })

export const listShoppingCart = () =>
  request<ShoppingCart[]>({ url: '/user/shoppingCart/list', method: 'GET' })

export const cleanShoppingCart = () =>
  request<void>({ url: '/user/shoppingCart/clean', method: 'DELETE' })