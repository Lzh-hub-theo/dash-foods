// 数据统计 store —— 维护四份数据集 + 当前查询区间
import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as reportApi from '@/api/report'
import type {
  OrderReportVO,
  ReportQuery,
  SalesTop10ReportVO,
  TurnoverReportVO,
  UserReportVO,
} from '@/types/api'
import { ElMessage } from '@/api/notify'

function todayStr(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export const useReportStore = defineStore('report', () => {
  const query = ref<ReportQuery>({
    begin: todayStr(-6),
    end: todayStr(0),
  })

  const turnover = ref<TurnoverReportVO | null>(null)
  const user = ref<UserReportVO | null>(null)
  const order = ref<OrderReportVO | null>(null)
  const top10 = ref<SalesTop10ReportVO | null>(null)

  /** 今日 Top10（用于工作台，区间 = 今天） */
  const todayTop10 = ref<SalesTop10ReportVO | null>(null)
  const todayTop10Loading = ref<boolean>(false)

  const loading = ref<boolean>(false)

  /** 把后端逗号串切成数组；空字符串返回空数组 */
  function splitList(s?: string): string[] {
    if (!s) return []
    return s.split(',').map((x) => x.trim()).filter(Boolean)
  }

  /** 把数值串数组转为 number[]（保留 0） */
  function toNumberArray(s?: string): number[] {
    return splitList(s).map((x) => {
      const n = Number(x)
      return Number.isFinite(n) ? n : 0
    })
  }

  /** 日期数组（短格式 MM-DD） */
  function shortDates(s?: string): string[] {
    return splitList(s).map((d) => d.slice(5))
  }

  const turnoverChart = ref<{ dates: string[]; values: number[] }>({ dates: [], values: [] })
  const userChart = ref<{ dates: string[]; newUsers: number[]; totalUsers: number[] }>({
    dates: [],
    newUsers: [],
    totalUsers: [],
  })
  const orderChart = ref<{ dates: string[]; total: number[]; valid: number[] }>({
    dates: [],
    total: [],
    valid: [],
  })
  const top10Chart = ref<{ names: string[]; counts: number[] }>({ names: [], counts: [] })
  const todayTop10Chart = ref<{ names: string[]; counts: number[] }>({ names: [], counts: [] })

  function rebuildDerived() {
    if (turnover.value) {
      turnoverChart.value = {
        dates: shortDates(turnover.value.dateList),
        values: toNumberArray(turnover.value.turnoverList),
      }
    } else {
      turnoverChart.value = { dates: [], values: [] }
    }
    if (user.value) {
      userChart.value = {
        dates: shortDates(user.value.dateList),
        newUsers: toNumberArray(user.value.newUserList),
        totalUsers: toNumberArray(user.value.totalUserList),
      }
    } else {
      userChart.value = { dates: [], newUsers: [], totalUsers: [] }
    }
    if (order.value) {
      orderChart.value = {
        dates: shortDates(order.value.dateList),
        total: toNumberArray(order.value.orderCountList),
        valid: toNumberArray(order.value.validOrderCountList),
      }
    } else {
      orderChart.value = { dates: [], total: [], valid: [] }
    }
    if (top10.value) {
      top10Chart.value = {
        names: splitList(top10.value.nameList),
        counts: toNumberArray(top10.value.numberList),
      }
    } else {
      top10Chart.value = { names: [], counts: [] }
    }
    if (todayTop10.value) {
      todayTop10Chart.value = {
        names: splitList(todayTop10.value.nameList),
        counts: toNumberArray(todayTop10.value.numberList),
      }
    } else {
      todayTop10Chart.value = { names: [], counts: [] }
    }
  }

  /** 仅拉今日 Top10（用于工作台嵌入） */
  async function fetchTodayTop10() {
    todayTop10Loading.value = true
    try {
      const today = todayStr(0)
      const r = await reportApi.top10({ begin: today, end: today })
      todayTop10.value = r
      todayTop10Chart.value = {
        names: splitList(r.nameList),
        counts: toNumberArray(r.numberList),
      }
    } catch {
      /* toast */
    } finally {
      todayTop10Loading.value = false
    }
  }

  async function fetchAll(q?: ReportQuery) {
    if (q) query.value = q
    loading.value = true
    try {
      const [t, u, o, t10] = await Promise.all([
        reportApi.turnoverStatistics(query.value),
        reportApi.userStatistics(query.value),
        reportApi.orderStatistics(query.value),
        reportApi.top10(query.value),
      ])
      turnover.value = t
      user.value = u
      order.value = o
      top10.value = t10
      rebuildDerived()
    } catch (e) {
      ElMessage.error('报表加载失败')
    } finally {
      loading.value = false
    }
  }

  /** 快捷区间切换 */
  function setRange(days: number) {
    query.value = { begin: todayStr(-(days - 1)), end: todayStr(0) }
  }

  return {
    query,
    turnover,
    user,
    order,
    top10,
    todayTop10,
    todayTop10Chart,
    todayTop10Loading,
    loading,
    turnoverChart,
    userChart,
    orderChart,
    top10Chart,
    fetchAll,
    fetchTodayTop10,
    setRange,
  }
})