import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authApi from '@/api/auth'
import { EMP_KEY, TOKEN_KEY } from '@/api/request'

interface EmpInfo {
  id: number
  name: string
  userName: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '')
  const emp = ref<EmpInfo | null>(loadEmp())

  const isLoggedIn = computed(() => !!token.value)

  function loadEmp(): EmpInfo | null {
    const raw = localStorage.getItem(EMP_KEY)
    if (!raw) return null
    try { return JSON.parse(raw) as EmpInfo } catch { return null }
  }

  async function login(username: string, password: string) {
    const vo = await authApi.login({ username, password })
    token.value = vo.token
    const e: EmpInfo = { id: vo.id, name: vo.name, userName: vo.userName }
    emp.value = e
    localStorage.setItem(TOKEN_KEY, vo.token)
    localStorage.setItem(EMP_KEY, JSON.stringify(e))
  }

  async function logout() {
    try { await authApi.logout() } catch { /* ignore */ }
    token.value = ''
    emp.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EMP_KEY)
  }

  return { token, emp, isLoggedIn, login, logout }
})