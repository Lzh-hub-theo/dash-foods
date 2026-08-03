/**
 * dash-foods · Axios 请求封装
 * - 自动附带 token
 * - 统一处理 Result 包装
 * - 401 时清空登录态
 * - 网络异常 / 超时给友好提示，避免暴露原始 axios 文案
 */
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from './notify' // 本地轻提示（占位实现见 ./notify）

export interface ApiEnvelope<T> {
  code: number
  msg: string
  data: T
}

const DEFAULT_TIMEOUT = 30000

const service: AxiosInstance = axios.create({
  baseURL: '/',
  timeout: DEFAULT_TIMEOUT,
  // 开启后端 HttpSession 登录态需要跨请求携带 cookie
  withCredentials: true,
})

service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('dash_token')
  if (token && config.headers) {
    // 后端 sky.jwt.user-token-name=authentication，前端必须用同名 header
    config.headers.set('authentication', token)
  }
  return config
})

/**
 * 401 兜底：清登录态、合并一波并发 401 只弹一次 toast、跳登录页。
 * 调用方只负责 reject，不弹任何东西；toast + 跳转由 AppHeader 的 dash:logout 监听器负责。
 */
let authHandledAt = 0
let authResetTimer: number | null = null
function handleAuthFailure() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('dash_token')
  localStorage.removeItem('dash_user')
  const now = Date.now()
  if (now - authHandledAt < 1500) return
  authHandledAt = now
  if (authResetTimer) window.clearTimeout(authResetTimer)
  authResetTimer = window.setTimeout(() => {
    authHandledAt = 0
    authResetTimer = null
  }, 1500)
  window.dispatchEvent(new CustomEvent('dash:logout'))
}

service.interceptors.response.use(
  (response) => {
    const res = response.data as ApiEnvelope<unknown>
    // 后端约定 code=1 为成功
    if (res && typeof res === 'object' && 'code' in res) {
      if (res.code === 1) return res
      // 业务 code=401 / token 失效：去重后统一交由全局事件处理
      if (res.code === 401 || /token/i.test(String(res.msg ?? ''))) {
        handleAuthFailure()
      }
      // 业务错误抛出去由调用方处理
      const err = new Error(res.msg || '请求失败') as Error & { code?: number; data?: unknown }
      err.code = res.code
      ;(err as Error & { data?: unknown }).data = res.data
      throw err
    }
    return response.data
  },
  (error) => {
    // HTTP 401：去重后只弹一条 toast + 跳登录，不暴露 axios 文案
    if (error?.response?.status === 401) {
      handleAuthFailure()
      return Promise.reject(error)
    }
    // 静默请求（轮询/心跳）：不弹错误 toast，但仍 reject 出去让调用方自己处理
    if ((error?.config as { silent?: boolean } | undefined)?.silent) {
      return Promise.reject(error)
    }
    // 网络层错误：超时不暴露原始 axios 文案，给用户更清晰的提示
    const isTimeout =
      error?.code === 'ECONNABORTED' ||
      /timeout/i.test(String(error?.message ?? ''))
    const isNetwork =
      error?.message === 'Network Error' || error?.code === 'ERR_NETWORK'
    let msg = ''
    if (isTimeout) {
      msg = '请求超时，请检查网络后再试'
    } else if (isNetwork) {
      msg = '网络异常，请检查连接'
    } else if (error?.response?.status === 404) {
      msg = '接口不存在（404）'
    } else if (error?.response?.status === 500) {
      msg = '服务器开小差了，请稍后再试'
    } else if (error?.response?.status === 502 || error?.response?.status === 503) {
      msg = '服务暂不可用，请稍后再试'
    } else {
      msg =
        error?.response?.data?.msg ||
        error?.message ||
        '请求失败，请稍后再试'
    }
    ElMessage({ type: 'error', text: msg })
    return Promise.reject(error)
  },
)

type RequestConfig = Parameters<AxiosInstance['request']>[0] & { silent?: boolean }

export async function request<T = unknown>(config: RequestConfig): Promise<T> {
  // silent 透传到 axios.config，供错误拦截器识别
  const axiosConfig = { ...config, silent: config.silent ?? false } as RequestConfig
  const res = (await service.request(axiosConfig)) as ApiEnvelope<T> | T
  if (res && typeof res === 'object' && 'data' in (res as ApiEnvelope<T>)) {
    return (res as ApiEnvelope<T>).data
  }
  return res as T
}

export default service