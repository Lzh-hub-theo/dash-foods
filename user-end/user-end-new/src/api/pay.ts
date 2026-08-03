/**
 * dash-foods · 微信支付 V3 调起（浏览器模拟层）
 *
 * 真实小程序环境下应使用 wx.requestPayment。
 * 此处为桌面浏览器，先尝试调起 WeixinJSBridge，失败则降级到友好提示。
 */
import { ElMessage } from './notify'
import { payOrder } from './order'
import type { OrderPaymentVO } from '@/types/api'

interface PayArgs {
  orderNumber: string
  payMethod?: number
}

interface PayResult {
  success: boolean
  mocked?: boolean
  reason?: string
}

declare global {
  interface Window {
    WeixinJSBridge?: {
      invoke: (method: string, params: Record<string, unknown>, cb: (res: { err_msg?: string }) => void) => void
    }
  }
}

export async function invokeWechatPay(args: PayArgs): Promise<PayResult> {
  const vo = await payOrder({
    orderNumber: args.orderNumber,
    payMethod: args.payMethod ?? 1,
  })
  return await doInvoke(vo)
}

function doInvoke(vo: OrderPaymentVO): Promise<PayResult> {
  return new Promise((resolve) => {
    // 在微信内置浏览器里 WeixinJSBridge 存在
    if (typeof window !== 'undefined' && window.WeixinJSBridge) {
      window.WeixinJSBridge.invoke(
        'getBrandWCPayRequest',
        {
          appId: '',
          timeStamp: vo.timeStamp,
          nonceStr: vo.nonceStr,
          package: vo.packageStr,
          signType: vo.signType,
          paySign: vo.paySign,
        },
        (res) => {
          if (res.err_msg === 'get_brand_wcpay_request:ok') {
            resolve({ success: true })
          } else if (res.err_msg === 'get_brand_wcpay_request:cancel') {
            resolve({ success: false, reason: '已取消支付' })
          } else {
            resolve({ success: false, reason: res.err_msg || '支付失败' })
          }
        },
      )
      return
    }
    // 浏览器无 JSBridge：mock 成功（开发环境友好）
    resolve({ success: true, mocked: true })
  })
}

export function describePayResult(res: PayResult) {
  if (res.success && res.mocked) {
    ElMessage({ type: 'success', text: '支付成功（浏览器 mock）' })
  } else if (res.success) {
    ElMessage({ type: 'success', text: '支付成功' })
  } else {
    ElMessage({ type: 'error', text: res.reason || '支付失败' })
  }
}