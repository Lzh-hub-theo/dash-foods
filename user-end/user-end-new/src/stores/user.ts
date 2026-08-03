/**
 * dash-foods · 用户 store
 * - 账号密码登录（对接后端 /user/user/login）
 * - 账号密码注册（对接后端 /user/user/register，注册仅落库，不自动登录）
 * - 退出登录（对接后端 /user/user/logout）
 * - 本地持久化 token + id + username + name
 */
import { defineStore } from 'pinia'
import { loginByPassword, logoutUser, registerByPassword } from '@/api/user'
import type { UserLoginVO } from '@/types/api'

interface UserState {
  id: number
  username: string
  name: string
  openid: string
  token: string
  nickname: string
  avatar: string
}

const STORAGE_KEY = 'dash_user'

function loadFromStorage(): UserState {
  if (typeof localStorage === 'undefined') return blank()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return blank()
    return { ...blank(), ...JSON.parse(raw) }
  } catch {
    return blank()
  }
}

function blank(): UserState {
  return { id: 0, username: '', name: '', openid: '', token: '', nickname: '', avatar: '' }
}

function applyLogin(this: { $state: UserState } & UserState, vo: UserLoginVO) {
  this.id = vo.id
  this.username = vo.username || ''
  this.name = vo.name || ''
  this.openid = vo.openid || ''
  this.token = vo.token || ''
  this.nickname = vo.name || vo.username || '远道而来的食客'
  if (vo.token) localStorage.setItem('dash_token', vo.token)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state))
}

export const useUserStore = defineStore('user', {
  state: (): UserState => loadFromStorage(),
  getters: {
    isLogin: (s) => Boolean(s.token),
    /** 展示名：优先用真实姓名 / 账号 */
    displayName: (s) => s.name || s.username || s.nickname || '远道而来的食客',
  },
  actions: {
    /**
     * 账号密码登录
     * @returns 成功返回 true，失败由调用方通过 ElMessage 处理
     */
    async loginByPassword(username: string, password: string) {
      const vo = await loginByPassword({ username, password })
      applyLogin.call(this as unknown as { $state: UserState } & UserState, vo)
      return vo
    },
    /**
     * 账号密码注册（仅落库，不写登录态）
     * 视图层负责：成功后提示用户 → 跳 /login
     */
    async registerByPassword(username: string, password: string, name?: string) {
      await registerByPassword({ username, password, name })
    },
    /**
     * 退出登录
     * 后端：session.invalidate() + token 写入 Redis 黑名单
     * 前端：清掉本地存储 + 重置 state
     */
    async logout() {
      try {
        await logoutUser()
      } catch {
        // 即便后端调用失败（401/网络异常），前端也要清本地态
      }
      this.$reset()
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem('dash_token')
    },
  },
})