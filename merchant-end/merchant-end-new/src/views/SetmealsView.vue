<script setup lang="ts">
// 套餐管理 / SETMEALS
import { onMounted, ref, computed } from 'vue'
import { useSetmealStore } from '@/stores/setmeal'
import Modal from '@/components/Modal.vue'
import EmptyState from '@/components/EmptyState.vue'
import StatusPill from '@/components/StatusPill.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import { ElMessage, ElMessageBox } from '@/api/notify'
import type {
  Category,
  Dish,
  SetmealDTO,
  SetmealDish,
  SetmealVO,
} from '@/types/api'
import { listCategoryByType } from '@/api/category'
import { listDishByCategory } from '@/api/dish'

const store = useSetmealStore()

const page = ref<number>(1)
const pageSize = ref<number>(10)
const nameFilter = ref<string>('')
const catFilter = ref<number | ''>('')
const statusFilter = ref<number | ''>('')

const catOptions = ref<Category[]>([])
const totalPages = computed(() => Math.max(1, Math.ceil(store.total / pageSize.value)))

async function loadCats() {
  if (catOptions.value.length) return
  try { catOptions.value = await listCategoryByType(2) } catch { /* toast */ }
}

async function load() {
  await store.fetchPage({
    page: page.value,
    pageSize: pageSize.value,
    name: nameFilter.value || undefined,
    categoryId: catFilter.value === '' ? undefined : Number(catFilter.value),
    status: statusFilter.value === '' ? undefined : Number(statusFilter.value),
  })
}
async function onSearch() { page.value = 1; await load() }
async function onReset() { nameFilter.value = ''; catFilter.value = ''; statusFilter.value = ''; page.value = 1; await load() }
async function onPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  page.value = p; await load()
}

// ===== 编辑 Modal =====
const editOpen = ref<boolean>(false)
const editMode = ref<'create' | 'edit'>('create')
const editForm = ref<SetmealDTO>({
  categoryId: 0,
  name: '',
  price: 0,
  status: 1,
  description: '',
  image: '',
  setmealDishes: [],
})
const pickedDishes = ref<{ dishId: number; name: string; copies: number; price: number }[]>([])

// ===== 子 Modal：选菜品 =====
const pickerOpen = ref<boolean>(false)
const pickerCat = ref<number | ''>('')
const pickerDishes = ref<Dish[]>([])
const pickerLoading = ref<boolean>(false)
const pickerSelected = ref<Set<number>>(new Set())
const pickerStage = ref<{ dishId: number; copies: number }[]>([])

async function loadPickerDishes(catId: number | '') {
  if (catId === '') { pickerDishes.value = []; return }
  pickerLoading.value = true
  try {
    pickerDishes.value = await listDishByCategory(catId)
  } catch { /* toast */ }
  finally { pickerLoading.value = false }
}

function openPicker() {
  pickerOpen.value = true
  pickerCat.value = catOptions.value[0]?.id ?? ''
  pickerSelected.value = new Set(pickedDishes.value.map((d) => d.dishId))
  pickerStage.value = pickedDishes.value.map((d) => ({ dishId: d.dishId, copies: d.copies }))
  loadPickerDishes(pickerCat.value)
}
function togglePickerDish(id: number) {
  if (pickerSelected.value.has(id)) {
    pickerSelected.value.delete(id)
    pickerStage.value = pickerStage.value.filter((s) => s.dishId !== id)
  } else {
    pickerSelected.value.add(id)
    pickerStage.value.push({ dishId: id, copies: 1 })
  }
}
async function onPickerCatChange() {
  await loadPickerDishes(pickerCat.value)
}
function confirmPicker() {
  const merged: typeof pickedDishes.value = []
  for (const s of pickerStage.value) {
    const d = pickerDishes.value.find((x) => x.id === s.dishId)
    if (!d) continue
    merged.push({
      dishId: d.id,
      name: d.name,
      copies: Math.max(1, s.copies),
      price: d.price,
    })
  }
  pickedDishes.value = merged
  pickerOpen.value = false
}
function setPickerCopies(id: number, copies: number) {
  const s = pickerStage.value.find((x) => x.dishId === id)
  if (s) s.copies = Math.max(1, Math.floor(copies) || 1)
}

// 主 modal 内部操作
function removePicked(dishId: number) {
  pickedDishes.value = pickedDishes.value.filter((d) => d.dishId !== dishId)
}
function setPickedCopies(dishId: number, copies: number) {
  const p = pickedDishes.value.find((d) => d.dishId === dishId)
  if (p) p.copies = Math.max(1, Math.floor(copies) || 1)
}

function openCreate() {
  editMode.value = 'create'
  editForm.value = {
    categoryId: catOptions.value[0]?.id || 0,
    name: '', price: 0, status: 1, description: '', image: '',
    setmealDishes: [],
  }
  pickedDishes.value = []
  editOpen.value = true
}

async function openEdit(s: { id: number }) {
  try {
    const vo: SetmealVO = await store.getDetail(s.id)
    editMode.value = 'edit'
    editForm.value = {
      id: vo.id,
      categoryId: vo.categoryId,
      name: vo.name,
      price: vo.price,
      status: vo.status,
      description: vo.description,
      image: vo.image,
      setmealDishes: vo.setmealDishes || [],
    }
    pickedDishes.value = (vo.setmealDishes || []).map((d) => ({
      dishId: d.dishId, name: d.name || '——', copies: d.copies, price: d.price || 0,
    }))
    editOpen.value = true
  } catch { /* toast */ }
}

async function submitEdit() {
  if (!editForm.value.name?.trim()) return ElMessage.warning('请填写套餐名称')
  if (!editForm.value.categoryId) return ElMessage.warning('请选择分类')
  if (!(editForm.value.price >= 0)) return ElMessage.warning('请填写价格')
  if (pickedDishes.value.length === 0) return ElMessage.warning('请至少添加一道菜品')

  const setmealDishes: SetmealDish[] = pickedDishes.value.map((d) => ({
    dishId: d.dishId,
    name: d.name,
    price: d.price,
    copies: d.copies,
  }))

  try {
    if (editMode.value === 'create') {
      await store.create({ ...editForm.value, setmealDishes })
    } else {
      await store.update({ ...editForm.value, setmealDishes })
    }
    editOpen.value = false
  } catch { /* toast */ }
}

async function onDeleteOne(s: { id: number; name: string }) {
  const ok = await ElMessageBox('DELETE', `确定删除套餐「${s.name}」?`, { danger: true, confirmText: 'DELETE' })
  if (ok) await store.remove([s.id])
}
async function onTogglePill(s: { id: number; status: number }) {
  await store.toggleStatus(s.id, s.status)
}

function fmtPrice(p: number) { return `¥${Number(p).toFixed(2)}` }

onMounted(async () => {
  await loadCats()
  await load()
})
</script>

<template>
  <section class="setmeals">
    <header class="setmeals__head">
      <div class="setmeals__head-l">
        <span class="dateline">§ COMBOS · 套餐目录</span>
        <h2 class="setmeals__title headline">SETMEALS</h2>
      </div>
      <div class="setmeals__head-r">
        <button class="btn btn-signal" @click="openCreate">+ NEW SETMEAL</button>
      </div>
    </header>

    <hr class="rule-thick" />

    <div class="setmeals__filters">
      <div class="filter">
        <span class="dateline">CATEGORY</span>
        <select v-model.number="catFilter" class="select">
          <option value="">全部</option>
          <option v-for="c in catOptions" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <div class="filter">
        <span class="dateline">STATUS</span>
        <select v-model.number="statusFilter" class="select">
          <option value="">全部</option>
          <option :value="1">起售</option>
          <option :value="0">停售</option>
        </select>
      </div>
      <div class="filter filter--wide">
        <span class="dateline">NAME</span>
        <input v-model="nameFilter" class="input" placeholder="按名称搜索" @keyup.enter="onSearch" />
      </div>
      <div class="filter__actions">
        <button class="btn btn-sm" @click="onSearch">SEARCH</button>
        <button class="btn btn-sm btn-ghost" @click="onReset">RESET</button>
      </div>
    </div>

    <div class="setmeals__table-wrap">
      <div v-if="store.loading && store.list.length === 0" class="setmeals__loading font-mono">LOADING…</div>
      <EmptyState v-else-if="store.list.length === 0" message="暂无套餐" hint="ADD A NEW ONE TO START" />
      <table v-else class="tbl setmeals__tbl">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th class="t-right">Price</th>
            <th>Status</th>
            <th>Updated</th>
            <th class="t-right">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in store.list" :key="s.id">
            <td>
              <div class="setmeals__thumb">
                <img v-if="s.image" :src="s.image" alt="" />
                <span v-else class="font-mono setmeals__noimg">N/A</span>
              </div>
            </td>
            <td class="setmeals__name">{{ s.name }}</td>
            <td class="font-mono">{{ catOptions.find((c) => c.id === s.categoryId)?.name || '——' }}</td>
            <td class="t-right font-mono tnum">{{ fmtPrice(s.price) }}</td>
            <td>
              <StatusPill :status="s.status" @toggle="onTogglePill(s)" />
            </td>
            <td class="font-mono setmeals__time">{{ s.updateTime || '——' }}</td>
            <td class="t-right">
              <div class="actions">
                <button class="btn btn-sm btn-ghost" @click="openEdit(s)">EDIT</button>
                <button class="btn btn-sm btn-signal" @click="onDeleteOne(s)">DELETE</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="setmeals__pager font-mono" v-if="store.total > 0">
      <span>TOTAL {{ store.total }} · PAGE {{ page }} / {{ totalPages }}</span>
      <div class="pager__btns">
        <button class="btn btn-sm btn-ghost" :disabled="page <= 1" @click="onPage(page - 1)">PREV</button>
        <button class="btn btn-sm btn-ghost" :disabled="page >= totalPages" @click="onPage(page + 1)">NEXT</button>
      </div>
    </div>

    <!-- 主编辑 Modal -->
    <Modal
      :open="editOpen"
      :title="editMode === 'create' ? 'NEW SETMEAL' : 'EDIT SETMEAL'"
      width="820px"
      @close="editOpen = false"
    >
      <div class="set-form">
        <div class="set-form__main">
          <label class="field">
            <span class="field__label dateline">NAME · 名称</span>
            <input v-model="editForm.name" class="input" placeholder="例如：双人下午茶套餐" />
          </label>
          <label class="field">
            <span class="field__label dateline">CATEGORY · 分类</span>
            <select v-model.number="editForm.categoryId" class="select">
              <option v-for="c in catOptions" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </label>
          <div class="field-row">
            <label class="field">
              <span class="field__label dateline">PRICE · 价格</span>
              <input v-model.number="editForm.price" type="number" min="0" step="0.5" class="input" />
            </label>
            <label class="field">
              <span class="field__label dateline">STATUS · 状态</span>
              <select v-model.number="editForm.status" class="select">
                <option :value="1">起售</option>
                <option :value="0">停售</option>
              </select>
            </label>
          </div>
          <label class="field">
            <span class="field__label dateline">DESCRIPTION · 描述</span>
            <textarea v-model="editForm.description" class="input" rows="2" placeholder="一句话简介（选填）" />
          </label>
        </div>
        <div class="set-form__side">
          <span class="field__label dateline">IMAGE · 图片</span>
          <ImageUploader v-model:url="editForm.image" />
        </div>
      </div>

      <hr class="rule" style="margin: 18px 0;" />

      <div class="dishes">
        <div class="dishes__head">
          <span class="dateline">DISHES IN SETMEAL · 套餐内菜品（{{ pickedDishes.length }}）</span>
          <button class="btn btn-sm" @click="openPicker">+ PICK DISHES</button>
        </div>
        <p v-if="pickedDishes.length === 0" class="dishes__empty font-mono">NONE PICKED</p>
        <div v-else class="dishes__list">
          <div v-for="d in pickedDishes" :key="d.dishId" class="dish-row">
            <span class="dish-row__name">{{ d.name }}</span>
            <span class="dish-row__price font-mono">{{ fmtPrice(d.price) }}</span>
            <div class="dish-row__copies">
              <span class="font-mono dish-row__x">×</span>
              <input
                type="number" min="1"
                :value="d.copies"
                class="dish-row__input font-mono"
                @input="(e) => setPickedCopies(d.dishId, +(e.target as HTMLInputElement).value)"
              />
            </div>
            <button class="dish-row__rm" @click="removePicked(d.dishId)">×</button>
          </div>
        </div>
      </div>

      <template #footer>
        <button class="btn btn-sm btn-ghost" @click="editOpen = false">CANCEL</button>
        <button class="btn btn-sm btn-signal" @click="submitEdit">{{ editMode === 'create' ? 'CREATE' : 'SAVE' }}</button>
      </template>
    </Modal>

    <!-- 选菜品 Modal -->
    <Modal :open="pickerOpen" title="PICK DISHES" width="640px" @close="pickerOpen = false">
      <label class="field">
        <span class="field__label dateline">CATEGORY · 按分类筛选</span>
        <select v-model.number="pickerCat" class="select" @change="onPickerCatChange">
          <option v-for="c in catOptions" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </label>
      <div class="picker">
        <div v-if="pickerLoading" class="picker__loading font-mono">LOADING…</div>
        <div v-else-if="pickerDishes.length === 0" class="picker__loading font-mono">NO DISHES</div>
        <label
          v-for="d in pickerDishes" :key="d.id"
          class="picker__item"
          :class="{ 'picker__item--on': pickerSelected.has(d.id) }"
        >
          <input
            type="checkbox"
            :checked="pickerSelected.has(d.id)"
            @change="togglePickerDish(d.id)"
          />
          <span class="picker__name">{{ d.name }}</span>
          <span class="picker__price font-mono tnum">{{ fmtPrice(d.price) }}</span>
          <span class="picker__status font-mono" :class="d.status === 1 ? 'on' : 'off'">
            {{ d.status === 1 ? 'ON' : 'OFF' }}
          </span>
          <div class="picker__copies" v-if="pickerSelected.has(d.id)">
            <span class="font-mono">×</span>
            <input
              type="number" min="1"
              :value="pickerStage.find((s) => s.dishId === d.id)?.copies ?? 1"
              class="picker__copies-input font-mono"
              @input="(e) => setPickerCopies(d.id, +(e.target as HTMLInputElement).value)"
              @click.stop
            />
          </div>
        </label>
      </div>
      <template #footer>
        <button class="btn btn-sm btn-ghost" @click="pickerOpen = false">CANCEL</button>
        <button class="btn btn-sm btn-signal" @click="confirmPicker">CONFIRM · {{ pickerSelected.size }}</button>
      </template>
    </Modal>
  </section>
</template>

<style scoped>
.setmeals { display: flex; flex-direction: column; gap: 18px; }
.setmeals__head {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 18px;
  padding-top: 4px;
}
.setmeals__head-l { display: flex; flex-direction: column; gap: 8px; }
.setmeals__head-l .dateline {
  font-family: var(--font-pix);
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}
.setmeals__head-r { display: flex; gap: 10px; }
.setmeals__title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 300;
  font-size: 48px;
  letter-spacing: -0.02em;
  line-height: 1;
}

.setmeals__filters {
  display: grid;
  grid-template-columns: 200px 160px 1fr auto;
  gap: 12px; align-items: end;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--rule);
}
.filter { display: flex; flex-direction: column; gap: 4px; }
.filter :deep(.dateline) {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}
.filter--wide { min-width: 200px; }
.filter__actions { display: flex; gap: 8px; }

.setmeals__table-wrap { min-height: 320px; }
.setmeals__loading {
  padding: 80px 0; text-align: center;
  font-family: var(--font-pix);
  font-size: 11px;
  letter-spacing: 0.22em; color: var(--ink-muted);
}
.t-right { text-align: right; }
.setmeals__thumb {
  width: 48px; height: 48px;
  background: var(--paper-deep);
  border: 1px solid var(--rule);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.setmeals__thumb img { width: 100%; height: 100%; object-fit: cover; }
.setmeals__noimg {
  font-family: var(--font-pix);
  font-size: 8px;
  color: var(--ink-faint);
  letter-spacing: 0.18em;
}
.setmeals__name {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 15px;
}
.setmeals__time { font-size: 12px; color: var(--ink-muted); white-space: nowrap; }
.actions { display: inline-flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }

.setmeals__pager {
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.18em; color: var(--ink-muted);
  text-transform: uppercase; padding-top: 8px;
  border-top: 1px solid var(--rule-soft);
}
.pager__btns { display: flex; gap: 6px; }

/* form */
.set-form { display: grid; grid-template-columns: 1fr 220px; gap: 18px; }
.set-form__main { display: flex; flex-direction: column; gap: 12px; }
.set-form__side { display: flex; flex-direction: column; gap: 6px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.field__label {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}

/* picked dishes */
.dishes__head {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
}
.dishes__head :deep(.dateline) {
  font-family: var(--font-pix);
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}
.dishes__empty {
  padding: 14px 0;
  font-family: var(--font-pix);
  letter-spacing: 0.22em; color: var(--ink-faint); font-size: 10px;
}
.dishes__list { display: flex; flex-direction: column; gap: 6px; max-height: 240px; overflow-y: auto; }
.dish-row {
  display: grid;
  grid-template-columns: 1fr auto auto 32px;
  gap: 12px; align-items: center;
  padding: 10px 12px;
  background: var(--paper-deep);
  border: 1px solid var(--rule);
  transition: border-color 0.2s var(--ease);
}
.dish-row:hover { border-color: var(--ink); }
.dish-row__name {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 14px;
}
.dish-row__price { font-size: 12px; color: var(--ink-muted); }
.dish-row__copies {
  display: flex; align-items: center; gap: 4px;
}
.dish-row__x { color: var(--ink-muted); }
.dish-row__input {
  width: 50px; padding: 4px 6px;
  background: var(--paper); border: 1px solid var(--rule-soft);
  font-size: 13px; text-align: center;
}
.dish-row__rm {
  width: 32px; height: 32px;
  background: transparent; border: 1px solid var(--rule-soft);
  color: var(--ink-muted); cursor: pointer; font-size: 16px;
  transition: background 0.2s var(--ease), color 0.2s var(--ease), border-color 0.2s var(--ease);
}
.dish-row__rm:hover { background: var(--signal); color: var(--paper); border-color: var(--signal); }

/* picker */
.picker { display: flex; flex-direction: column; gap: 6px; max-height: 380px; overflow-y: auto; margin-top: 12px; }
.picker__loading {
  padding: 40px 0; text-align: center;
  font-family: var(--font-pix);
  letter-spacing: 0.22em; color: var(--ink-muted); font-size: 10px;
}
.picker__item {
  display: grid;
  grid-template-columns: 18px 1fr auto auto auto;
  gap: 10px; align-items: center;
  padding: 10px 12px;
  border: 1px solid var(--rule-soft);
  cursor: pointer;
  transition: background 0.15s var(--ease), border-color 0.15s var(--ease);
}
.picker__item:hover { background: var(--paper-soft); border-color: var(--rule); }
.picker__item--on { background: var(--ink); color: var(--paper); border-color: var(--ink); }
.picker__item--on .picker__status { border-color: var(--paper); color: var(--paper); }
.picker__name {
  font-family: var(--font-display);
  font-weight: 400;
}
.picker__price { font-size: 12px; color: var(--ink-muted); }
.picker__item--on .picker__price { color: var(--paper-soft); }
.picker__status {
  font-family: var(--font-pix);
  font-size: 9px; letter-spacing: 0.16em;
  padding: 1px 6px; border: 1px solid var(--rule-soft);
}
.picker__status.on { color: var(--olive); border-color: var(--olive); }
.picker__status.off { color: var(--ink-faint); }
.picker__copies {
  display: flex; align-items: center; gap: 4px;
  background: var(--paper); color: var(--ink);
  padding: 2px 6px;
}
.picker__copies-input {
  width: 40px; padding: 2px 4px;
  background: var(--paper); border: 1px solid var(--rule-soft);
  text-align: center; font-size: 12px;
}

@media (max-width: 1100px) {
  .setmeals__filters { grid-template-columns: 1fr 1fr; }
  .filter__actions { grid-column: 1 / -1; justify-content: flex-end; }
  .set-form { grid-template-columns: 1fr; }
  .set-form__side { max-width: 280px; }
}
@media (max-width: 900px) {
  .setmeals__tbl { font-size: 12px; }
  .setmeals__tbl th:nth-child(3), .setmeals__tbl td:nth-child(3) { display: none; }
}
</style>