import { request } from './request'
import type { ShopInfoDTO } from '@/types/api'

export const getShopStatus = () => request<number>({ url: '/user/shop/status', method: 'GET' })

export const getMerchantInfo = () =>
  request<ShopInfoDTO>({ url: '/user/shop/getMerchantInfo', method: 'GET' })