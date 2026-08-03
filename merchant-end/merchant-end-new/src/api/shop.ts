import { http, unwrap } from './request'

/** 获取营业状态 1 营业 / 0 打烊 */
export function getShopStatus() {
  return unwrap<number>(http.get('/shop/status'))
}

/** 设置营业状态 */
export function setShopStatus(status: number) {
  return unwrap<void>(http.put(`/shop/${status}`))
}