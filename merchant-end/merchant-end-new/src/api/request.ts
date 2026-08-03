import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from '@/api/notify'
import type { Result } from '@/types/api'

export const TOKEN_KEY = 'df_merchant_token'
export const EMP_KEY = 'df_merchant_emp'

export const http: AxiosInstance = axios.create({
  baseURL: '/admin',
  timeout: 15000,
})

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token && config.headers) {
    config.headers.token = token
  }
  return config
})

http.interceptors.response.use(
  (res) => {
    const data = res.data as Result
    if (data && typeof data === 'object' && 'code' in data) {
      // 后端 Result 约定：1 = 成功，0 = 失败；2 = 需要轮询（也按成功处理）
      if (data.code === 1 || data.code === 2) return res
      // 业务错误：弹后端 msg，没有就兜底
      const msg = data.msg || `请求失败（code=${data.code}）`
      ElMessage.error(msg)
      return Promise.reject(new Error(msg))
    }
    return res
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(EMP_KEY)
      if (location.pathname !== '/login') location.href = '/login'
    }
    ElMessage.error(err.message || '网络异常')
    return Promise.reject(err)
  },
)

/** 取出后端 data 字段 */
export function unwrap<T>(promise: Promise<{ data: Result<T> }>): Promise<T> {
  return promise.then((r) => r.data.data)
}