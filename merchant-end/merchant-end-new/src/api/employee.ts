import { http, unwrap } from './request'
import type {
  Employee,
  EmployeeDTO,
  EmployeePageQuery,
  PageResult,
  PasswordEditDTO,
} from '@/types/api'

/** 新增员工 */
export function createEmployee(dto: EmployeeDTO) {
  return unwrap<void>(http.post('/employee', dto))
}

/** 编辑员工信息 */
export function updateEmployee(dto: EmployeeDTO) {
  return unwrap<void>(http.put('/employee', dto))
}

/** 按 id 查询员工 */
export function getEmployeeDetail(id: number) {
  return unwrap<Employee>(http.get(`/employee/${id}`))
}

/** 员工分页 */
export function pageEmployee(params: EmployeePageQuery) {
  return unwrap<PageResult<Employee>>(http.get('/employee/page', { params }))
}

/** 启用 / 禁用员工 */
export function toggleEmployeeStatus(id: number, status: number) {
  return unwrap<void>(http.post(`/employee/status/${status}`, null, { params: { id } }))
}

/** 修改密码 */
export function editPassword(dto: PasswordEditDTO) {
  return unwrap<void>(http.put('/employee/editPassword', dto))
}