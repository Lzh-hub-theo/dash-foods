import { http, unwrap } from './request'
import type { EmployeeLoginDTO, EmployeeLoginVO, PasswordEditDTO } from '@/types/api'

/** 员工登录 */
export function login(dto: EmployeeLoginDTO) {
  return unwrap<EmployeeLoginVO>(http.post('/employee/login', dto))
}

/** 员工登出 */
export function logout() {
  return unwrap<string>(http.post('/employee/logout'))
}

/** 修改密码 */
export function editPassword(dto: PasswordEditDTO) {
  return unwrap<void>(http.put('/employee/editPassword', dto))
}