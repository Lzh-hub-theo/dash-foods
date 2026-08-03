// 数据统计报表接口
import { http, unwrap } from '@/api/request'
import { ElMessage } from '@/api/notify'
import type {
  OrderReportVO,
  ReportQuery,
  SalesTop10ReportVO,
  TurnoverReportVO,
  UserReportVO,
} from '@/types/api'

/** 营业额 */
export function turnoverStatistics(q: ReportQuery) {
  return unwrap<TurnoverReportVO>(
    http.get('/report/turnoverStatistics', { params: q }),
  )
}

/** 用户 */
export function userStatistics(q: ReportQuery) {
  return unwrap<UserReportVO>(
    http.get('/report/userStatistics', { params: q }),
  )
}

/** 订单 */
export function orderStatistics(q: ReportQuery) {
  return unwrap<OrderReportVO>(
    http.get('/report/ordersStatistics', { params: q }),
  )
}

/** Top10 */
export function top10(q: ReportQuery) {
  return unwrap<SalesTop10ReportVO>(
    http.get('/report/top10', { params: q }),
  )
}

/**
 * 导出最近 30 天 Excel 报表
 * 后端返回 xlsx 二进制流；通过 blob URL 触发浏览器下载
 */
export async function exportReport(): Promise<void> {
  try {
    const res = await http.get('/report/export', {
      responseType: 'blob',
      timeout: 30000,
    })
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    // 如果后端把错误以 json 形式写回（responseType blob 会把 json 也打成 blob），尝试反序列化检测
    if (blob.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      && blob.size < 1024) {
      try {
        const text = await blob.text()
        const obj = JSON.parse(text)
        if (obj && obj.msg) ElMessage.error(obj.msg)
      } catch { /* ignore */ }
      return
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const ts = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `DashFoods-Report-${ts}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('报表已开始下载')
  } catch {
    /* toast */
  }
}