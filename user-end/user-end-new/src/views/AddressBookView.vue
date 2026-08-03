<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAddressStore } from '@/stores/address'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from '@/api/notify'
import type { AddressBook } from '@/types/api'

const router = useRouter()
const route = useRoute()
const user = useUserStore()
const store = useAddressStore()

/** /address?select=1：从结算页跳进来选地址 */
const selectMode = computed(() => route.query.select === '1')

const loaded = ref(false)

onMounted(async () => {
  if (!user.isLogin) {
    ElMessage({ type: 'info', text: '请先登录后再管理地址' })
    router.replace({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  await store.fetchAll(true)
  loaded.value = true
})

function tagLabel(a: AddressBook) {
  return a.label || (a.sex === '1' ? '先生' : a.sex === '2' ? '女士' : '家')
}

function editAddress(id?: number) {
  router.push({ name: 'address-form', query: id ? { id } : {} })
}

async function removeAddress(id: number) {
  try {
    await ElMessageBox({
      title: '删除地址',
      message: '确认删除这个地址吗？删除后无法恢复。',
      confirmText: '删除',
      cancelText: '再想想',
    })
  } catch {
    return
  }
  try {
    await store.remove(id)
    ElMessage({ type: 'success', text: '地址已删除' })
  } catch {
    ElMessage({ type: 'error', text: '删除失败，请稍后再试' })
  }
}

async function setDefault(id: number) {
  try {
    await store.setDefault(id)
    ElMessage({ type: 'success', text: '已设为默认收货地址' })
  } catch {
    ElMessage({ type: 'error', text: '设置失败，请稍后再试' })
  }
}

function pickAddress(a: AddressBook) {
  if (!selectMode.value) return
  if (a.isDefault !== 1) {
    store.setDefault(a.id).catch(() => {})
  }
  router.replace({
    name: 'checkout',
    query: { addressBookId: String(a.id) },
  })
}
</script>

<template>
  <div class="addr-page">
    <div class="addr-main">
      <div class="container addr-inner">
        <header class="addr-head">
          <p class="eyebrow">DELIVERY&nbsp;ADDRESSES</p>
          <h1 class="addr-title serif">
            {{ selectMode ? '选择收货地址' : '我的地址簿' }}
          </h1>
          <p class="addr-sub">
            {{ selectMode
              ? '挑一个常用的地址，也可以现场添加新的。'
              : '管理你的常用配送地址，让每次点单都快人一步。' }}
          </p>
        </header>

        <div v-if="loaded && !store.list.length" class="empty">
          <div class="empty-illus">
            <svg viewBox="0 0 140 140" fill="none">
              <path
                d="M70 20 C 45 20 30 40 30 60 C 30 80 70 115 70 115 C 70 115 110 80 110 60 C 110 40 95 20 70 20 Z"
                stroke="#A4C49A"
                stroke-width="1.5"
                stroke-dasharray="3 4"
              />
              <circle cx="70" cy="60" r="10" fill="none" stroke="#A4C49A" stroke-width="1.5" />
            </svg>
          </div>
          <p class="empty-title serif">还没有地址</p>
          <p class="empty-sub">添加一个常用地址，下次点单可以直接送达。</p>
          <button class="ghost-btn" @click="editAddress()">+ 新增地址</button>
        </div>

        <ul v-else class="addr-list">
          <li
            v-for="a in store.list"
            :key="a.id"
            class="addr-card"
            :class="{ 'is-default': a.isDefault === 1 }"
            @click="pickAddress(a)"
          >
            <div class="card-line-1">
              <span class="name">{{ a.consignee }}</span>
              <span class="phone">{{ a.phone }}</span>
              <span class="tag">{{ tagLabel(a) }}</span>
              <span v-if="a.isDefault === 1" class="default-pill">默认</span>
            </div>
            <p class="detail">
              {{ a.provinceName }} {{ a.cityName }} {{ a.districtName }} {{ a.detail }}
            </p>
            <div class="actions" @click.stop>
              <button class="text-btn" @click="editAddress(a.id)">编辑</button>
              <button v-if="a.isDefault !== 1" class="text-btn" @click="setDefault(a.id)">
                设为默认
              </button>
              <button class="text-btn danger" @click="removeAddress(a.id)">删除</button>
            </div>
          </li>
        </ul>

        <div class="addr-foot">
          <button
            v-if="!selectMode && store.list.length"
            class="ghost-btn"
            @click="router.back()"
          >
            返回
          </button>
          <button class="primary-btn" @click="editAddress()">+ 新增地址</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.addr-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.addr-main {
  flex: 1;
  padding: 56px 0 96px;
}
.addr-head {
  text-align: center;
  margin-bottom: 36px;
}
.addr-head .eyebrow {
  font-size: var(--fs-12);
  font-weight: 700;
  letter-spacing: 0.32em;
  color: var(--color-sage);
  margin-bottom: 12px;
}
.addr-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(36px, 4.2vw, 52px);
  letter-spacing: -0.02em;
}
.addr-sub {
  margin-top: 12px;
  font-size: var(--fs-14);
  color: var(--color-ink-mute);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 0;
}
.empty-illus {
  width: 120px;
  height: 120px;
}
.empty-title {
  font-size: var(--fs-24);
  color: var(--color-ink);
}
.empty-sub {
  font-size: var(--fs-14);
  color: var(--color-ink-mute);
}
.ghost-btn {
  margin-top: 12px;
  padding: 12px 24px;
  border-radius: var(--radius-pill);
  background: var(--color-paper);
  border: 1.5px solid var(--color-line);
  color: var(--color-ink);
  font-size: var(--fs-13);
  font-weight: 600;
  letter-spacing: 0.04em;
  transition: all var(--dur-base) var(--ease-out);
}
.ghost-btn:hover {
  border-color: var(--color-sage);
  color: var(--color-sage-deep);
}

.addr-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 760px;
  margin: 0 auto;
}
.addr-card {
  padding: 22px 26px;
  background: var(--color-paper);
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition:
    border-color var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-out);
}
.addr-card:hover {
  border-color: var(--color-sage-soft);
  box-shadow: var(--shadow-card);
  transform: translateY(-2px);
}
.addr-card.is-default {
  border-color: var(--color-sage);
  background: var(--color-sage-mist);
}
.card-line-1 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.name {
  font-size: var(--fs-18);
  font-weight: 600;
  color: var(--color-ink);
}
.phone {
  font-family: var(--font-display);
  color: var(--color-ink-mute);
  font-size: var(--fs-14);
  letter-spacing: 0.02em;
}
.tag {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  padding: 3px 10px;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  color: var(--color-ink-soft);
}
.default-pill {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  padding: 3px 10px;
  background: var(--color-sage);
  color: var(--color-paper);
  border-radius: var(--radius-pill);
}
.detail {
  font-size: var(--fs-14);
  color: var(--color-ink-soft);
  line-height: 1.55;
}
.actions {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed var(--color-line);
  display: flex;
  gap: 20px;
}
.text-btn {
  font-size: var(--fs-13);
  color: var(--color-sage-deep);
  font-weight: 500;
  background: transparent;
  transition: color var(--dur-base) var(--ease-out);
}
.text-btn:hover {
  color: var(--color-sage);
}
.text-btn.danger {
  color: var(--color-tomato);
  margin-left: auto;
}
.text-btn.danger:hover {
  color: var(--color-cherry);
}

.addr-foot {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 36px;
}
.primary-btn {
  padding: 14px 32px;
  border-radius: var(--radius-pill);
  background: var(--color-ink);
  color: var(--color-paper);
  font-size: var(--fs-14);
  font-weight: 600;
  letter-spacing: 0.04em;
  transition:
    background var(--dur-base) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}
.primary-btn:hover {
  background: var(--color-sage-deep);
  transform: translateY(-1px);
}

@media (max-width: 720px) {
  .addr-card {
    padding: 18px 20px;
  }
  .card-line-1 {
    flex-wrap: wrap;
    gap: 8px;
  }
  .actions {
    gap: 14px;
  }
  .text-btn.danger {
    margin-left: 0;
  }
}
</style>