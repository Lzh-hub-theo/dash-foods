// 后端统一响应结构
export interface Result<T = unknown> {
  code: number
  data: T
  msg: string
}

// 分页结果
export interface PageResult<T> {
  records: T[]
  total: number
}

// 员工登录请求
export interface EmployeeLoginDTO {
  username: string
  password: string
}

// 员工登录响应
export interface EmployeeLoginVO {
  id: number
  name: string
  token: string
  userName: string
}

// 改密请求
export interface PasswordEditDTO {
  empId: number
  oldPassword: string
  newPassword: string
}

// 分类
export interface Category {
  id: number
  name: string
  sort: number
  type: number
  status: number
  createTime?: string
  updateTime?: string
}

// 分类分页
export type CategoryPageQuery = {
  page: number
  pageSize: number
  name?: string
  type?: number
}

// 订单（订单管理搜索返回的 record）
export interface OrderVO {
  id: number
  number: string
  status: number
  userId: number
  userName: string
  phone: string
  address: string
  consignee: string
  amount: number
  orderTime: string
  payStatus: number
  payMethod: number
  orderDetailList: OrderDetailItem[]
  // 下面是详情接口独有的字段（conditionSearch 不一定有，置可选）
  cancelReason?: string
  cancelTime?: string
  checkoutTime?: string
  deliveryStatus?: number
  deliveryTime?: string
  estimatedDeliveryTime?: string
  addressBookId?: number
  packAmount?: number
  rejectionReason?: string
  remark?: string
  tablewareNumber?: number
  tablewareStatus?: number
  orderDishes?: string
}

export interface OrderDetailItem {
  id: number
  orderId: number
  dishId?: number
  setmealId?: number
  name: string
  image: string
  number: number
  amount: number
  dishFlavor?: string
}

export interface OrderSearchQuery {
  page?: number
  pageSize?: number
  number?: string
  phone?: string
  status?: number
  beginTime?: string
  endTime?: string
  userId?: number
}

export interface OrdersConfirmDTO {
  id: number
  status: number
}

export interface OrdersCancelDTO {
  id: number
  cancelReason: string
}

// 工作台 — 今日数据
export interface BusinessDataVO {
  turnover: number
  validOrderCount: number
  orderCompletionRate: number
  unitPrice: number
  newUsers: number
}

export interface DishOverViewVO {
  sold: number
  discontinued: number
}

export interface SetmealOverViewVO {
  sold: number
  discontinued: number
}

export interface OrderOverViewVO {
  waitingOrders: number
  confirmed: number
  deliveryInProgress: number
  completed: number
  cancelled: number
  allOrders: number
}

export interface OrderStatisticsVO {
  toBeConfirmed: number
  confirmed: number
  deliveryInProgress: number
}

// ====== 菜品 ======

// 口味（value 是后端逗号分隔的字符串，前端在编辑时按","拆/合）
export interface DishFlavor {
  id?: number
  dishId?: number
  name: string
  value: string
}

export interface Dish {
  id: number
  name: string
  categoryId: number
  price: number
  image: string
  description: string
  status: number         // 0 停售 1 起售
  stock?: number
  createTime?: string
  updateTime?: string
}

// 新增菜品 body（不含 id/categoryName/updateTime）
export interface DishDTO {
  id?: number
  name: string
  categoryId: number
  price: number
  image: string
  description: string
  status: number
  stock?: number
  flavors: DishFlavor[]
}

// 修改菜品 body（沿用 DishVO 字段）
export interface DishVO extends DishDTO {
  categoryName?: string
  updateTime?: string
}

export interface DishPageQuery {
  page: number
  pageSize: number
  name?: string
  categoryId?: number
  status?: number
}

// ====== 套餐 ======

export interface SetmealDish {
  id?: number
  setmealId?: number
  dishId: number
  name?: string           // 冗余字段，后端在 listBySetmealId 时填
  price?: number
  copies: number          // 份数
}

export interface Setmeal {
  id: number
  categoryId: number
  name: string
  price: number
  status: number
  description: string
  image: string
  createTime?: string
  updateTime?: string
}

export interface SetmealDTO {
  id?: number
  categoryId: number
  name: string
  price: number
  status: number
  description: string
  image: string
  setmealDishes: SetmealDish[]
}

export interface SetmealVO extends SetmealDTO {
  categoryName?: string
  updateTime?: string
}

export interface SetmealPageQuery {
  page: number
  pageSize: number
  name?: string
  categoryId?: number
  status?: number
}

// ====== 员工 ======

export interface Employee {
  id: number
  username: string
  name: string
  phone?: string
  sex?: string
  idNumber?: string
  status: number          // 1 启用 0 禁用
  createTime?: string
  updateTime?: string
}

// 新增时含 password，编辑时不带 password
export interface EmployeeDTO {
  id?: number
  username: string
  name: string
  phone?: string
  sex?: string
  idNumber?: string
  password?: string
}

export interface EmployeePageQuery {
  page: number
  pageSize: number
  name?: string
}

// ====== 数据报表 ======

/** 报表通用查询参数 */
export interface ReportQuery {
  begin: string   // yyyy-MM-dd
  end: string     // yyyy-MM-dd
}

/** 营业额统计：逗号分隔字符串 */
export interface TurnoverReportVO {
  dateList: string
  turnoverList: string
}

/** 用户统计：新增 / 总量 */
export interface UserReportVO {
  dateList: string
  totalUserList: string
  newUserList: string
}

/** 订单统计 */
export interface OrderReportVO {
  dateList: string
  orderCountList: string
  validOrderCountList: string
  totalOrderCount: number
  validOrderCount: number
  orderCompletionRate: number
}

/** 销量 Top10 */
export interface SalesTop10ReportVO {
  nameList: string
  numberList: string
}

// ====== 通用 ======

// 文件上传响应（后端返回的是相对/绝对图片 URL）
export type UploadResult = string