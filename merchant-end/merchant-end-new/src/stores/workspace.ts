import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as wsApi from '@/api/workspace'
import type {
  BusinessDataVO,
  DishOverViewVO,
  OrderOverViewVO,
  SetmealOverViewVO,
} from '@/types/api'

const EMPTY_BUSINESS: BusinessDataVO = {
  turnover: 0,
  validOrderCount: 0,
  orderCompletionRate: 0,
  unitPrice: 0,
  newUsers: 0,
}
const EMPTY_DISH: DishOverViewVO = { sold: 0, discontinued: 0 }
const EMPTY_SETMEAL: SetmealOverViewVO = { sold: 0, discontinued: 0 }
const EMPTY_ORDER: OrderOverViewVO = {
  waitingOrders: 0,
  confirmed: 0,
  deliveryInProgress: 0,
  completed: 0,
  cancelled: 0,
  allOrders: 0,
}

export const useWorkspaceStore = defineStore('workspace', () => {
  const business = ref<BusinessDataVO>({ ...EMPTY_BUSINESS })
  const dishes = ref<DishOverViewVO>({ ...EMPTY_DISH })
  const setmeals = ref<SetmealOverViewVO>({ ...EMPTY_SETMEAL })
  const orders = ref<OrderOverViewVO>({ ...EMPTY_ORDER })
  const loaded = ref<boolean>(false)
  const loading = ref<boolean>(false)

  async function fetchAll() {
    loading.value = true
    try {
      const [b, d, s, o] = await Promise.all([
        wsApi.getBusinessData().catch(() => ({ ...EMPTY_BUSINESS })),
        wsApi.getDishesOverview().catch(() => ({ ...EMPTY_DISH })),
        wsApi.getSetmealsOverview().catch(() => ({ ...EMPTY_SETMEAL })),
        wsApi.getOrdersOverview().catch(() => ({ ...EMPTY_ORDER })),
      ])
      business.value = b
      dishes.value = d
      setmeals.value = s
      orders.value = o
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  return { business, dishes, setmeals, orders, loaded, loading, fetchAll }
})