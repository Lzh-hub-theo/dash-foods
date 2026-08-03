<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { useAddressStore } from '@/stores/address'
import { useShopStore } from '@/stores/shop'
import { ElMessage } from '@/api/notify'
import { submitOrder, getOrderStatus, getEstimatedDeliveryTime } from '@/api/order'
import { invokeWechatPay, describePayResult } from '@/api/pay'
import type { AddressBook } from '@/types/api'

const cart = useCartStore()
const user = useUserStore()
const addrStore = useAddressStore()
const shop = useShopStore()
const router = useRouter()
const route = useRoute()

const addresses = computed<AddressBook[]>(() => addrStore.list)
const selectedAddrId = ref<number>(0)
const remark = ref('')
const tableware = ref<number>(1)
const estimatedTime = ref('')
const submitting = ref(false)
const polling = ref(false)

const totalAmount = computed(() => cart.totalAmount)
const packAmount = computed(() => 2)
const selectedAddress = computed(() =>
  addresses.value.find((a) => a.id === selectedAddrId.value) || addrStore.defaultAddress,
)

onMounted(async () => {
  if (!shop.loaded) shop.fetchStatus()
  if (!shop.merchantLoaded) shop.fetchMerchant()
  if (!user.isLogin) {
    ElMessage({ type: 'info', text: '请先登录后再结算' })
    router.replace({ name: 'login', query: { redirect: '/checkout' } })
    return
  }
  if (cart.isEmpty) {
    await cart.fetch()
  }
  await addrStore.fetchAll(true)
  // 优先级：query 传入 > 默认地址
  const queryId = Number(route.query.addressBookId || 0)
  if (queryId && addresses.value.some((a) => a.id === queryId)) {
    selectedAddrId.value = queryId
  } else {
    selectedAddrId.value = addrStore.defaultId || addrStore.defaultAddress?.id || 0
  }
  if (selectedAddrId.value) fetchEta()
})

watch(
  () => route.query.addressBookId,
  (v) => {
    const id = Number(v || 0)
    if (id && addresses.value.some((a) => a.id === id)) {
      selectedAddrId.value = id
      fetchEta()
    }
  },
)

function pickAddress() {
  router.push({ name: 'address-book', query: { select: '1' } })
}

function fetchEta() {
  const addr = selectedAddress.value
  if (!addr) return
  getEstimatedDeliveryTime(
    '1',
    addr.detail || `${addr.provinceName}${addr.cityName}${addr.districtName}`,
  )
    .then((eta) => {
      estimatedTime.value = eta
    })
    .catch(() => {
      estimatedTime.value = '约 32 分钟送达'
    })
}

async function submit() {
  if (shop.loaded && !shop.isOpen) {
    ElMessage({ type: 'warning', text: '店铺休息中，暂不能下单' })
    return
  }
  if (!selectedAddrId.value) {
    ElMessage({ type: 'error', text: '请选择收货地址' })
    return
  }
  if (cart.isEmpty) {
    ElMessage({ type: 'error', text: '购物车为空，无法结算' })
    return
  }

  submitting.value = true
  try {
    const taskId = await submitOrder({
      addressBookId: selectedAddrId.value,
      amount: totalAmount.value + packAmount.value,
      cartItems: cart.items.map((it) => ({
        dishId: it.dishId,
        setmealId: it.setmealId,
        stock: it.number,
      })),
      deliveryStatus: 1,
      estimatedDeliveryTime: estimatedTime.value || new Date().toISOString(),
      packAmount: packAmount.value,
      payMethod: 1,
      remark: remark.value,
      tablewareNumber: tableware.value,
      tablewareStatus: 1,
    })
    ElMessage({ type: 'success', text: '下单成功，正在为你排队出餐…' })
    const orderNumber = await pollOrderStatus(taskId)
    if (orderNumber) {
      // 拿到 orderNumber 后调起微信支付
      try {
        const payRes = await invokeWechatPay({ orderNumber, payMethod: 1 })
        describePayResult(payRes)
      } catch {
        ElMessage({ type: 'info', text: '支付未完成，可在订单页继续完成' })
      }
    }
    // A3：下单成功后清空购物车（无论支付成功与否，已下出订单就不该再残留旧条目）
    await cart.clean()
  } catch (e) {
    const msg = (e as Error)?.message || '下单失败，请稍后再试'
    ElMessage({ type: 'error', text: msg })
  } finally {
    submitting.value = false
  }
}

async function pollOrderStatus(taskId: string): Promise<string | null> {
  polling.value = true
  for (let i = 0; i < 12; i++) {
    try {
      const res = (await getOrderStatus(taskId, { silent: true })) as { orderId?: number; orderNumber?: string; number?: string } | null
      if (res && res.orderId) {
        ElMessage({ type: 'success', text: '订单已确认，前往订单详情' })
        await new Promise((r) => setTimeout(r, 200))
        router.push('/orders')
        return res.orderNumber || res.number || null
      }
    } catch {
      /* ignore */
    }
    await new Promise((r) => setTimeout(r, 1500))
  }
  polling.value = false
  ElMessage({ type: 'info', text: '订单已提交，可在"我的订单"中查看进度' })
  router.push('/orders')
  return null
}
</script>

<template>
  <div class="checkout">
    <div class="container checkout-inner">
      <header class="ck-head">
        <p class="eyebrow">CHECKOUT</p>
        <h1 class="ck-title serif">结算订单</h1>
      </header>

      <div class="ck-grid">
        <!-- 左：地址 + 备注 -->
        <div class="ck-main">
          <section class="block">
            <header class="block-head">
              <h2 class="block-title serif">配送地址</h2>
              <button class="link-btn" @click="pickAddress">
                {{ addresses.length ? '更换 / 管理' : '+ 新增地址' }}
              </button>
            </header>

            <article v-if="selectedAddress" class="addr-card is-active">
              <div class="addr-head">
                <span class="addr-name">{{ selectedAddress.consignee }}</span>
                <span class="addr-phone">{{ selectedAddress.phone }}</span>
                <span v-if="selectedAddress.label" class="addr-tag">{{ selectedAddress.label }}</span>
                <span v-if="selectedAddress.isDefault === 1" class="addr-default">默认</span>
              </div>
              <p class="addr-detail">
                {{ selectedAddress.provinceName }} {{ selectedAddress.cityName }} {{ selectedAddress.districtName }} {{ selectedAddress.detail }}
              </p>
              <button class="addr-change" @click="pickAddress">更换地址</button>
            </article>
            <div v-else class="addr-empty" @click="pickAddress">
              <div class="empty-plus">+</div>
              <p class="empty-title">还没有收货地址</p>
              <p class="addr-tip">点击这里新增第一个地址，开始你的 dash·foods 点单。</p>
            </div>
          </section>

          <section class="block">
            <header class="block-head">
              <h2 class="block-title serif">配送时间 & 备注</h2>
            </header>
            <div class="time-row">
              <span class="t-label">预计送达</span>
              <span class="t-value">{{ estimatedTime || '选择地址后将自动估算' }}</span>
            </div>
            <textarea
              v-model="remark"
              class="remark"
              rows="3"
              placeholder="忌口、餐具数量、给骑手的小纸条…（选填）"
              maxlength="120"
            />

            <div class="tableware">
              <span class="t-label">餐具数量</span>
              <div class="t-stepper">
                <button class="t-step" @click="tableware = Math.max(0, tableware - 1)">−</button>
                <span class="t-qty">{{ tableware }}</span>
                <button class="t-step" @click="tableware += 1">+</button>
              </div>
              <span class="t-hint">无需餐具请填 0</span>
            </div>
          </section>
        </div>

        <!-- 右：订单汇总 -->
        <aside class="ck-aside">
          <section class="block summary">
            <h2 class="block-title serif">订单汇总</h2>
            <ul class="sum-list">
              <li v-for="item in cart.items" :key="item.id" class="sum-item">
                <span class="sum-name">
                  {{ item.name }}
                  <em>×{{ item.number }}</em>
                </span>
                <span class="sum-price">¥{{ (item.amount * item.number).toFixed(2) }}</span>
              </li>
            </ul>
            <div class="sum-divider" />
            <div class="sum-line">
              <span>商品小计</span>
              <span>¥{{ totalAmount.toFixed(2) }}</span>
            </div>
            <div class="sum-line">
              <span>包装费</span>
              <span>¥{{ packAmount.toFixed(2) }}</span>
            </div>
            <div class="sum-line">
              <span>配送费</span>
              <span>免运费</span>
            </div>
            <div class="sum-divider" />
            <div class="sum-total">
              <span>应付</span>
              <span class="total-amount">
                <em>¥</em>
                <strong>{{ Math.floor(totalAmount + packAmount) }}</strong>
                <em class="frac">{{ Math.round(((totalAmount + packAmount) % 1) * 100).toString().padStart(2, '0') }}</em>
              </span>
            </div>
            <button
              class="submit-btn"
              :disabled="submitting || cart.isEmpty || (shop.loaded && !shop.isOpen)"
              @click="submit"
            >
              <span>{{ submitting ? (polling ? '排队出餐中…' : '提交中…') : '提交订单' }}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
            </button>
            <p v-if="shop.loaded && !shop.isOpen" class="sum-tip sum-tip-warn">
              店铺当前休息中，暂不可提交订单。
            </p>
            <p v-else class="sum-tip">点击提交即视为同意 <a href="#">配送协议</a></p>
          </section>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout {
  padding: 56px 0 96px;
}
.ck-head {
  margin-bottom: 36px;
  text-align: center;
}
.ck-head .eyebrow {
  font-size: var(--fs-12);
  font-weight: 700;
  letter-spacing: 0.32em;
  color: var(--color-sage);
  margin-bottom: 12px;
}
.ck-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(40px, 4.5vw, 56px);
  letter-spacing: -0.02em;
}

.ck-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 40px;
  align-items: flex-start;
}

.ck-main {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.block {
  padding: 28px;
  background: var(--color-paper);
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-lg);
}
.block-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20px;
}
.block-title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: var(--fs-24);
  letter-spacing: -0.01em;
}
.link-btn {
  font-size: var(--fs-13);
  color: var(--color-sage);
  font-weight: 500;
}

.addr-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.addr-card {
  padding: 18px 22px;
  border: 1.5px solid var(--color-line);
  border-radius: var(--radius-md);
  transition: all var(--dur-base) var(--ease-out);
  position: relative;
}
.addr-card:hover {
  border-color: var(--color-sage-soft);
  background: var(--color-cream);
}
.addr-card.is-active {
  border-color: var(--color-sage);
  background: var(--color-sage-mist);
}
.addr-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.addr-name {
  font-weight: 600;
  color: var(--color-ink);
}
.addr-phone {
  color: var(--color-ink-mute);
  font-family: var(--font-display);
  font-size: var(--fs-13);
  letter-spacing: 0.02em;
}
.addr-tag {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  padding: 2px 8px;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-xs);
  color: var(--color-ink-soft);
}
.addr-default {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  padding: 2px 8px;
  background: var(--color-apricot);
  color: var(--color-ink);
  border-radius: var(--radius-xs);
}
.addr-detail {
  font-size: var(--fs-13);
  color: var(--color-ink-soft);
  line-height: 1.55;
}
.addr-change {
  position: absolute;
  right: 18px;
  bottom: 16px;
  font-size: var(--fs-12);
  color: var(--color-sage-deep);
  font-weight: 500;
  background: transparent;
}
.addr-change:hover {
  color: var(--color-sage);
}

.addr-empty {
  padding: 40px 32px;
  text-align: center;
  border: 1.5px dashed var(--color-line);
  border-radius: var(--radius-md);
  color: var(--color-ink-mute);
  cursor: pointer;
  transition: all var(--dur-base) var(--ease-out);
}
.addr-empty:hover {
  border-color: var(--color-sage);
  background: var(--color-cream);
}
.empty-plus {
  font-family: var(--font-display);
  font-size: 44px;
  font-weight: 300;
  color: var(--color-sage);
  line-height: 1;
  margin-bottom: 8px;
}
.empty-title {
  font-family: var(--font-display);
  font-size: var(--fs-18);
  color: var(--color-ink);
  margin-bottom: 4px;
}
.addr-tip {
  margin-top: 6px;
  font-size: var(--fs-12);
  font-family: var(--font-display);
  font-style: italic;
}

.time-row,
.tableware {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
}
.tableware {
  border-top: 1px dashed var(--color-line);
  margin-top: 12px;
}
.t-label {
  font-size: var(--fs-13);
  color: var(--color-ink-mute);
  width: 80px;
}
.t-value {
  font-family: var(--font-display);
  font-size: var(--fs-16);
  color: var(--color-sage-deep);
  font-weight: 500;
}
.t-hint {
  margin-left: auto;
  font-size: var(--fs-12);
  color: var(--color-ink-mute);
}

.remark {
  width: 100%;
  margin-top: 12px;
  padding: 14px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-line);
  background: var(--color-cream);
  font-family: var(--font-body);
  font-size: var(--fs-14);
  color: var(--color-ink);
  resize: vertical;
}
.remark:focus {
  outline: none;
  border-color: var(--color-sage);
  background: var(--color-paper);
}

.t-stepper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  border-radius: var(--radius-pill);
  background: var(--color-paper);
  border: 1px solid var(--color-line);
}
.t-step {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--color-cream-soft);
  font-size: var(--fs-18);
  color: var(--color-ink);
  transition: background var(--dur-base) var(--ease-out);
}
.t-step:hover {
  background: var(--color-sage);
  color: var(--color-paper);
}
.t-qty {
  font-family: var(--font-display);
  font-size: var(--fs-16);
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

/* —— 右侧汇总 —— */
.summary {
  position: sticky;
  top: calc(var(--header-h) + 24px);
}

.sum-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
}
.sum-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: var(--fs-13);
  color: var(--color-ink-soft);
}
.sum-item em {
  font-style: normal;
  font-family: var(--font-display);
  color: var(--color-ink-mute);
  margin-left: 4px;
}
.sum-price {
  font-family: var(--font-display);
  color: var(--color-ink);
}

.sum-divider {
  height: 1px;
  background: var(--color-line);
  margin: 16px 0;
}

.sum-line {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-13);
  color: var(--color-ink-soft);
  padding: 4px 0;
}

.sum-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 12px;
}
.sum-total span:first-child {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-15);
  color: var(--color-ink);
}
.total-amount {
  font-family: var(--font-display);
  color: var(--color-apricot-deep);
  display: inline-flex;
  align-items: baseline;
}
.total-amount em {
  font-style: normal;
  font-size: var(--fs-15);
  margin-right: 2px;
}
.total-amount strong {
  font-size: var(--fs-40);
  font-weight: 500;
  letter-spacing: -0.02em;
}
.total-amount .frac {
  font-size: var(--fs-15);
  font-style: italic;
  margin-left: 1px;
}

.submit-btn {
  width: 100%;
  margin-top: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 54px;
  border-radius: var(--radius-md);
  background: var(--color-ink);
  color: var(--color-paper);
  font-size: var(--fs-15);
  font-weight: 600;
  letter-spacing: 0.04em;
  transition:
    background var(--dur-base) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}
.submit-btn:hover:not(:disabled) {
  background: var(--color-sage-deep);
  transform: translateY(-1px);
}
.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sum-tip {
  margin-top: 12px;
  font-size: var(--fs-12);
  color: var(--color-ink-mute);
  text-align: center;
}
.sum-tip a {
  color: var(--color-sage);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.sum-tip-warn {
  color: var(--color-tomato);
  font-family: var(--font-display);
  font-style: italic;
  letter-spacing: 0.02em;
}

@media (max-width: 960px) {
  .ck-grid {
    grid-template-columns: 1fr;
  }
  .summary {
    position: relative;
    top: 0;
  }
}
</style>