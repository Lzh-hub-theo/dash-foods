/* dash-foods · 与后端苍穹外卖接口对齐的类型 */

/** 后端统一响应结构 */
export interface Result<T = unknown> {
  code: number
  msg: string
  data: T
}

/** 分类 */
export interface Category {
  id: number
  name: string
  type: number // 1=菜品分类 2=套餐分类
  sort: number
  status: number
  createTime?: string
  updateTime?: string
  createUser?: number
  updateUser?: number
}

/** 菜品口味 */
export interface DishFlavor {
  id: number
  dishId: number
  name: string
  value: string
}

/** 菜品 VO */
export interface DishVO {
  id: number
  name: string
  categoryId: number
  categoryName?: string
  price: number
  image: string
  description: string
  status: number
  stock?: number
  updateTime?: string
  flavors?: DishFlavor[]
}

/** 套餐 */
export interface Setmeal {
  id: number
  name: string
  categoryId: number
  price: number
  image: string
  description: string
  status: number
  updateTime?: string
}

/** 套餐包含的菜品 */
export interface DishItemVO {
  name: string
  copies: number
  description: string
  image: string
}

/** 购物车条目 */
export interface ShoppingCart {
  id: number
  name: string
  image: string
  userId: number
  dishId?: number
  setmealId?: number
  dishFlavor?: string
  number: number
  amount: number
  createTime?: string
}

export interface ShoppingCartDTO {
  dishId?: number
  setmealId?: number
  dishFlavor?: string
}

/** 地址 */
export interface AddressBook {
  id: number
  userId?: number
  consignee: string
  phone: string
  sex: string
  provinceCode: string
  provinceName: string
  cityCode: string
  cityName: string
  districtCode: string
  districtName: string
  detail: string
  label: string
  isDefault: number
}

/** 登录 */
export interface UserLoginDTO {
  username: string
  password: string
}

export interface UserLoginVO {
  id: number
  username?: string
  name?: string
  openid: string
  token: string
}

/** 注册 */
export interface UserRegisterDTO {
  username: string
  password: string
  name?: string
}

/** 店铺 */
export interface ShopInfoDTO {
  phone?: string
}

/** 订单相关 */
export interface CartItemDTO {
  dishId?: number
  setmealId?: number
  stock?: number
}

export interface OrdersSubmitDTO {
  addressBookId: number
  amount: number
  cartItems: CartItemDTO[]
  deliveryStatus: number
  estimatedDeliveryTime: string
  packAmount: number
  payMethod: number
  remark?: string
  tablewareNumber: number
  tablewareStatus: number
}

export interface OrdersPaymentDTO {
  orderNumber: string
  payMethod: number
}

export interface OrderPaymentVO {
  nonceStr: string
  packageStr: string
  paySign: string
  signType: string
  timeStamp: string
}

export interface OrderDetail {
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

export interface OrderVO {
  id: number
  number: string
  status: number
  userId: number
  userName?: string
  addressBookId: number
  orderTime: string
  checkoutTime?: string
  payMethod: number
  payStatus: number
  amount: number
  remark?: string
  phone: string
  address: string
  consignee: string
  deliveryStatus?: number
  estimatedDeliveryTime?: string
  deliveryTime?: string
  cancelTime?: string
  cancelReason?: string
  rejectionReason?: string
  packAmount: number
  tablewareNumber: number
  tablewareStatus: number
  orderDishes?: string
  orderDetailList: OrderDetail[]
}

export interface PageResult<T = unknown> {
  records: T[]
  total: number
}