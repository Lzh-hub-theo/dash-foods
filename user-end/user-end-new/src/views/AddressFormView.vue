<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAddressStore } from '@/stores/address'
import { ElMessage } from '@/api/notify'
import { REGIONS, findProvince, findCity } from '@/data/regions'
import type { AddressBook } from '@/types/api'

const router = useRouter()
const route = useRoute()
const store = useAddressStore()

const editingId = computed(() => {
  const id = Number(route.query.id || 0)
  return id || 0
})

const form = reactive<AddressBook>({
  id: 0,
  consignee: '',
  phone: '',
  sex: '1',
  provinceCode: '',
  provinceName: '',
  cityCode: '',
  cityName: '',
  districtCode: '',
  districtName: '',
  detail: '',
  label: '',
  isDefault: 0,
})

const submitting = ref(false)

const cities = computed(() =>
  findProvince(form.provinceCode)?.children ?? [],
)
const districts = computed(() =>
  findCity(form.provinceCode, form.cityCode)?.children ?? [],
)

const labels = ['家', '公司', '学校', '其他']

onMounted(async () => {
  if (editingId.value) {
    await store.fetchAll(true)
    const target = store.list.find((a) => a.id === editingId.value)
    if (target) Object.assign(form, target)
  } else if (store.list.length === 0) {
    await store.fetchAll(true)
  }
})

function onPickProvince(code: string) {
  form.provinceCode = code
  form.provinceName = findProvince(code)?.name ?? ''
  form.cityCode = ''
  form.cityName = ''
  form.districtCode = ''
  form.districtName = ''
}
function onPickCity(code: string) {
  form.cityCode = code
  form.cityName = findCity(form.provinceCode, code)?.name ?? ''
  form.districtCode = ''
  form.districtName = ''
}
function onPickDistrict(code: string) {
  form.districtCode = code
  form.districtName =
    findCity(form.provinceCode, form.cityCode)?.children?.find((d) => d.code === code)?.name ?? ''
}

function pickLabel(l: string) {
  form.label = form.label === l ? '' : l
}

function validate() {
  if (!form.consignee.trim()) return '请填写收货人姓名'
  if (!/^1[3-9]\d{9}$/.test(form.phone.trim())) return '请填写正确的 11 位手机号'
  if (!form.provinceCode) return '请选择省份'
  if (!form.cityCode) return '请选择城市'
  if (!form.districtCode) return '请选择区县'
  if (!form.detail.trim() || form.detail.trim().length < 4) return '请填写详细地址（≥ 4 字）'
  return ''
}

async function save() {
  const err = validate()
  if (err) {
    ElMessage({ type: 'error', text: err })
    return
  }
  // 如果是第一条地址，自动设为默认
  if (!editingId.value && store.list.length === 0) {
    form.isDefault = 1
  }
  submitting.value = true
  try {
    await store.save({ ...form })
    ElMessage({ type: 'success', text: editingId.value ? '地址已更新' : '地址已添加' })
    router.replace({ name: 'address-book' })
  } catch (e) {
    ElMessage({ type: 'error', text: (e as Error)?.message || '保存失败' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="form-page">
    <div class="form-main">
      <div class="container form-inner">
        <header class="form-head">
          <button class="back" @click="router.back()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            返回
          </button>
          <p class="eyebrow">{{ editingId ? 'EDIT&nbsp;ADDRESS' : 'NEW&nbsp;ADDRESS' }}</p>
          <h1 class="form-title serif">
            {{ editingId ? '修改地址' : '新增地址' }}
          </h1>
        </header>

        <form class="form-card" @submit.prevent="save">
          <div class="row">
            <label class="field">
              <span class="lbl">收货人</span>
              <input
                v-model="form.consignee"
                type="text"
                class="input"
                placeholder="请填写真实姓名"
                maxlength="20"
              />
            </label>
            <label class="field">
              <span class="lbl">手机号</span>
              <input
                v-model="form.phone"
                type="tel"
                class="input"
                placeholder="请填写 11 位手机号"
                maxlength="11"
              />
            </label>
          </div>

          <div class="field">
            <span class="lbl">称呼</span>
            <div class="seg">
              <button
                type="button"
                class="seg-btn"
                :class="{ 'is-on': form.sex === '1' }"
                @click="form.sex = '1'"
              >
                先生
              </button>
              <button
                type="button"
                class="seg-btn"
                :class="{ 'is-on': form.sex === '2' }"
                @click="form.sex = '2'"
              >
                女士
              </button>
            </div>
          </div>

          <div class="row region-row">
            <label class="field">
              <span class="lbl">省份</span>
              <select v-model="form.provinceCode" class="input select" @change="onPickProvince(($event.target as HTMLSelectElement).value)">
                <option value="" disabled>请选择省份</option>
                <option v-for="p in REGIONS" :key="p.code" :value="p.code">{{ p.name }}</option>
              </select>
            </label>
            <label class="field">
              <span class="lbl">城市</span>
              <select v-model="form.cityCode" class="input select" :disabled="!form.provinceCode" @change="onPickCity(($event.target as HTMLSelectElement).value)">
                <option value="" disabled>请选择城市</option>
                <option v-for="c in cities" :key="c.code" :value="c.code">{{ c.name }}</option>
              </select>
            </label>
            <label class="field">
              <span class="lbl">区县</span>
              <select v-model="form.districtCode" class="input select" :disabled="!form.cityCode" @change="onPickDistrict(($event.target as HTMLSelectElement).value)">
                <option value="" disabled>请选择区县</option>
                <option v-for="d in districts" :key="d.code" :value="d.code">{{ d.name }}</option>
              </select>
            </label>
          </div>

          <label class="field">
            <span class="lbl">详细地址</span>
            <textarea
              v-model="form.detail"
              class="input textarea"
              rows="3"
              placeholder="街道、楼栋门牌号等（≥ 4 字）"
              maxlength="80"
            />
          </label>

          <div class="field">
            <span class="lbl">标签（选填）</span>
            <div class="chips">
              <button
                v-for="l in labels"
                :key="l"
                type="button"
                class="chip"
                :class="{ 'is-on': form.label === l }"
                @click="pickLabel(l)"
              >
                {{ l }}
              </button>
            </div>
          </div>

          <label class="switch-row">
            <input v-model="form.isDefault" type="checkbox" :true-value="1" :false-value="0" />
            <span class="switch" />
            <span class="switch-text">设为默认收货地址</span>
          </label>

          <div class="submit-row">
            <button type="button" class="ghost-btn" @click="router.back()">取消</button>
            <button type="submit" class="primary-btn" :disabled="submitting">
              {{ submitting ? '保存中…' : (editingId ? '保存修改' : '添加地址') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.form-main {
  flex: 1;
  padding: 40px 0 96px;
}
.form-head {
  text-align: center;
  margin-bottom: 28px;
  position: relative;
}
.back {
  position: absolute;
  left: 0;
  top: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--fs-13);
  color: var(--color-ink-mute);
  background: transparent;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: color var(--dur-base) var(--ease-out);
}
.back:hover {
  color: var(--color-ink);
}
.form-head .eyebrow {
  font-size: var(--fs-12);
  font-weight: 700;
  letter-spacing: 0.32em;
  color: var(--color-sage);
  margin-bottom: 12px;
}
.form-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(32px, 3.8vw, 44px);
  letter-spacing: -0.02em;
}

.form-card {
  max-width: 720px;
  margin: 0 auto;
  padding: 36px 40px;
  background: var(--color-paper);
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.region-row {
  grid-template-columns: 1fr 1fr 1fr;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.lbl {
  font-size: var(--fs-12);
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--color-ink-mute);
  text-transform: uppercase;
}
.input {
  width: 100%;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-line);
  background: var(--color-cream);
  font-family: var(--font-body);
  font-size: var(--fs-14);
  color: var(--color-ink);
  transition:
    border-color var(--dur-base) var(--ease-out),
    background var(--dur-base) var(--ease-out);
}
.input:focus {
  outline: none;
  border-color: var(--color-sage);
  background: var(--color-paper);
}
.input.textarea {
  resize: vertical;
  line-height: 1.55;
}
.input.select {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230A0A0A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 36px;
}
.input.select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.seg {
  display: inline-flex;
  background: var(--color-cream);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  padding: 3px;
  width: fit-content;
}
.seg-btn {
  padding: 7px 20px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-13);
  font-weight: 500;
  color: var(--color-ink-soft);
  transition: all var(--dur-base) var(--ease-out);
}
.seg-btn.is-on {
  background: var(--color-ink);
  color: var(--color-paper);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.chip {
  padding: 6px 16px;
  border-radius: var(--radius-pill);
  background: var(--color-paper);
  border: 1.5px solid var(--color-line);
  font-size: var(--fs-13);
  color: var(--color-ink-soft);
  font-weight: 500;
  transition: all var(--dur-base) var(--ease-out);
}
.chip:hover {
  border-color: var(--color-sage);
  color: var(--color-sage-deep);
}
.chip.is-on {
  background: var(--color-sage);
  border-color: var(--color-sage);
  color: var(--color-paper);
}

.switch-row {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.switch-row input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.switch {
  width: 38px;
  height: 22px;
  background: var(--color-line);
  border-radius: var(--radius-pill);
  position: relative;
  transition: background var(--dur-base) var(--ease-out);
}
.switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: var(--color-paper);
  border-radius: 50%;
  transition: transform var(--dur-base) var(--ease-out);
  box-shadow: 0 1px 3px rgba(10, 10, 10, 0.2);
}
.switch-row input:checked + .switch {
  background: var(--color-sage);
}
.switch-row input:checked + .switch::after {
  transform: translateX(16px);
}
.switch-text {
  font-size: var(--fs-13);
  color: var(--color-ink-soft);
}

.submit-row {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  padding-top: 12px;
  border-top: 1px dashed var(--color-line);
  margin-top: 8px;
}
.ghost-btn {
  padding: 12px 26px;
  border-radius: var(--radius-pill);
  background: var(--color-paper);
  border: 1.5px solid var(--color-line);
  color: var(--color-ink);
  font-size: var(--fs-13);
  font-weight: 500;
  transition: all var(--dur-base) var(--ease-out);
}
.ghost-btn:hover {
  border-color: var(--color-sage);
  color: var(--color-sage-deep);
}
.primary-btn {
  padding: 12px 28px;
  border-radius: var(--radius-pill);
  background: var(--color-ink);
  color: var(--color-paper);
  font-size: var(--fs-13);
  font-weight: 600;
  letter-spacing: 0.04em;
  transition:
    background var(--dur-base) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}
.primary-btn:hover:not(:disabled) {
  background: var(--color-sage-deep);
  transform: translateY(-1px);
}
.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 720px) {
  .form-card {
    padding: 28px 22px;
  }
  .row,
  .region-row {
    grid-template-columns: 1fr;
  }
}
</style>