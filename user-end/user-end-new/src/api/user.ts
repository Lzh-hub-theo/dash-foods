import { request } from './request'
import type { UserLoginDTO, UserLoginVO, UserRegisterDTO } from '@/types/api'

/**
 * C 端账号密码登录
 */
export const loginByPassword = (data: UserLoginDTO) =>
  request<UserLoginVO>({ url: '/user/user/login', method: 'POST', data })

/**
 * C 端账号密码注册（仅落库，不自动登录）
 */
export const registerByPassword = (data: UserRegisterDTO) =>
  request<void>({ url: '/user/user/register', method: 'POST', data })

/**
 * C 端退出登录
 */
export const logoutUser = () =>
  request<void>({ url: '/user/user/logout', method: 'POST' })