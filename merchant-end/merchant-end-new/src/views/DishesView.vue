<script setup lang="ts">
// 菜品管理 / DISHES
import { onMounted, ref, computed, watch } from 'vue'
import { useDishStore } from '@/stores/dish'
import Modal from '@/components/Modal.vue'
import EmptyState from '@/components/EmptyState.vue'
import StatusPill from '@/components/StatusPill.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import { ElMessage, ElMessageBox } from '@/api/notify'
import type { Category, DishDTO, DishFlavor, DishVO } from '@/types/api'
import { listCategoryByType } from '@/api/category'

const dishStore = useDishStore()

const page = ref<number>(1)
const pageSize = ref<number>(10)
const nameFilter = ref<string>('')
const catFilter = ref<number | ''>('')
const statusFilter = ref<number | ''>('')

const catOptions = ref<Category[]>([])
const selectedIds = ref<number[]>([])

const editOpen = ref<boolean>(false)
const editMode = ref<'create' | 'edit'>('create')
const editForm = ref<DishDTO>({
  name: '',
  categoryId: 0,
  price: 0,
  image: '',
  description: '',
  status: 1,
  stock: 100,
  flavors: [],
})

const flavorInput = ref<{ name: string; value: string }[]>([])

const totalPages = computed(() => Math.max(1, Math.ceil(dishStore.total / pageSize.value)))

async function load() {
  await dishStore.fetchPage({
    page: page.value,
    pageSize: pageSize.value,
    name: nameFilter.value || undefined,
    categoryId: catFilter.value === '' ? undefined : Number(catFilter.value),
    status: statusFilter.value === '' ? undefined : Number(statusFilter.value),
  })
}

async function loadCats() {
  if (catOptions.value.length) return
  try { catOptions.value = await listCategoryByType(1) }
  catch { /* toast */ }
}

async function onSearch() { page.value = 1; await load() }
async function onReset() {
  nameFilter.value = ''; catFilter.value = ''; statusFilter.value = ''; page.value = 1
  await load()
}
async function onPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  page.value = p; await load()
}

function openCreate() {
  editMode.value = 'create'
  editForm.value = {
    name: '', categoryId: catOptions.value[0]?.id || 0,
    price: 0, image: '', description: '', status: 1, stock: 100, flavors: [],
  }
  flavorInput.value = []
  editOpen.value = true
}

async function openEdit(d: { id: number }) {
  try {
    const vo: DishVO = await dishStore.getDetail(d.id)
    editMode.value = 'edit'
    editForm.value = {
      id: vo.id,
      name: vo.name,
      categoryId: vo.categoryId,
      price: vo.price,
      image: vo.image,
      description: vo.description,
      status: vo.status,
      stock: vo.stock ?? 100,
      flavors: vo.flavors || [],
    }
    flavorInput.value = (vo.flavors || []).map((f) => ({ name: f.name, value: f.value }))
    editOpen.value = true
  } catch { /* toast */ }
}

function addFlavorRow() {
  flavorInput.value.push({ name: '', value: '' })
}
function removeFlavorRow(i: number) {
  flavorInput.value.splice(i, 1)
}

function flavorChips(value: string): string[] {
  if (!value) return []
  return value.split(/[,，]/).map((s) => s.trim()).filter(Boolean)
}
function addChip(i: number, raw: string) {
  const v = raw.trim()
  if (!v) return
  const arr = flavorChips(flavorInput.value[i].value)
  if (arr.includes(v)) return
  arr.push(v)
  flavorInput.value[i].value = arr.join(',')
}
function removeChip(i: number, chip: string) {
  const arr = flavorChips(flavorInput.value[i].value).filter((c) => c !== chip)
  flavorInput.value[i].value = arr.join(',')
}

async function submitEdit() {
  if (!editForm.value.name?.trim()) return ElMessage.warning('请填写菜品名称')
  if (!editForm.value.categoryId) return ElMessage.warning('请选择分类')
  if (!(editForm.value.price >= 0)) return ElMessage.warning('请填写价格')

  // 把 flavor 编辑器里的数据组装回 flavor list（每组至少要有 name，value 可空字符串）
  const flavors: DishFlavor[] = flavorInput.value
    .filter((f) => f.name?.trim())
    .map((f) => ({
      dishId: editMode.value === 'edit' ? editForm.value.id : undefined,
      name: f.name.trim(),
      value: f.value.trim(),
    }))

  try {
    if (editMode.value === 'create') {
      await dishStore.create({ ...editForm.value, flavors })
    } else {
      await dishStore.update({ ...editForm.value, flavors })
    }
    editOpen.value = false
    selectedIds.value = []
  } catch { /* toast */ }
}

async function onDeleteOne(d: { id: number; name: string }) {
  const ok = await ElMessageBox('DELETE', `确定删除菜品「${d.name}」?`, { danger: true, confirmText: 'DELETE' })
  if (ok) {
    await dishStore.remove([d.id])
    selectedIds.value = selectedIds.value.filter((x) => x !== d.id)
  }
}

async function onDeleteSelected() {
  if (selectedIds.value.length === 0) return
  const ok = await ElMessageBox(
    'DELETE',
    `确定删除选中的 ${selectedIds.value.length} 项菜品?`,
    { danger: true, confirmText: 'DELETE' },
  )
  if (ok) {
    await dishStore.remove([...selectedIds.value])
    selectedIds.value = []
  }
}

function toggleSelected(id: number) {
  if (selectedIds.value.includes(id)) selectedIds.value = selectedIds.value.filter((x) => x !== id)
  else selectedIds.value = [...selectedIds.value, id]
}
function toggleAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  selectedIds.value = checked ? dishStore.list.map((d) => d.id) : []
}
const allChecked = computed(() =>
  dishStore.list.length > 0 && dishStore.list.every((d) => selectedIds.value.includes(d.id)),
)
watch(() => dishStore.list, () => { selectedIds.value = [] })

async function onTogglePill(d: { id: number; status: number }) {
  await dishStore.toggleStatus(d.id, d.status)
}

function fmtPrice(p: number) {
  return `¥${Number(p).toFixed(2)}`
}

onMounted(async () => {
  await loadCats()
  await load()
})
</script>

<template>
  <section class="dishes">
    <header class="dishes__head">
      <div class="dishes__head-l">
        <span class="dateline">§ MENU · 菜品目录</span>
        <h2 class="dishes__title headline">DISHES</h2>
      </div>
      <div class="dishes__head-r">
        <button v-if="selectedIds.length > 0" class="btn btn-signal" @click="onDeleteSelected">
          DELETE SELECTED · {{ selectedIds.length }}
        </button>
        <button class="btn btn-signal" @click="openCreate">+ NEW DISH</button>
      </div>
    </header>

    <hr class="rule-thick" />

    <div class="dishes__filters">
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

    <div class="dishes__table-wrap">
      <div v-if="dishStore.loading && dishStore.list.length === 0" class="dishes__loading font-mono">LOADING…</div>
      <EmptyState v-else-if="dishStore.list.length === 0" message="暂无菜品" hint="ADD A NEW ONE TO START" />
      <table v-else class="tbl dishes__tbl">
        <thead>
          <tr>
            <th class="dishes__check"><input type="checkbox" :checked="allChecked" @change="toggleAll" /></th>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th class="t-right">Price</th>
            <th class="t-right">Stock</th>
            <th>Status</th>
            <th>Updated</th>
            <th class="t-right">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in dishStore.list" :key="d.id">
            <td><input type="checkbox" :checked="selectedIds.includes(d.id)" @change="toggleSelected(d.id)" /></td>
            <td>
              <div class="dishes__thumb">
                <img v-if="d.image" :src="d.image" alt="" />
                <span v-else class="font-mono dishes__noimg">N/A</span>
              </div>
            </td>
            <td class="dishes__name">{{ d.name }}</td>
            <td class="font-mono">{{ catOptions.find((c) => c.id === d.categoryId)?.name || '——' }}</td>
            <td class="t-right font-mono tnum">{{ fmtPrice(d.price) }}</td>
            <td class="t-right font-mono tnum">{{ d.stock ?? '——' }}</td>
            <td>
              <StatusPill :status="d.status" @toggle="onTogglePill(d)" />
            </td>
            <td class="font-mono dishes__time">{{ d.updateTime || '——' }}</td>
            <td class="t-right">
              <div class="actions">
                <button class="btn btn-sm btn-ghost" @click="openEdit(d)">EDIT</button>
                <button class="btn btn-sm btn-signal" @click="onDeleteOne(d)">DELETE</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="dishes__pager font-mono" v-if="dishStore.total > 0">
      <span>TOTAL {{ dishStore.total }} · PAGE {{ page }} / {{ totalPages }}</span>
      <div class="pager__btns">
        <button class="btn btn-sm btn-ghost" :disabled="page <= 1" @click="onPage(page - 1)">PREV</button>
        <button class="btn btn-sm btn-ghost" :disabled="page >= totalPages" @click="onPage(page + 1)">NEXT</button>
      </div>
    </div>

    <!-- 编辑 Modal -->
    <Modal
      :open="editOpen"
      :title="editMode === 'create' ? 'NEW DISH' : 'EDIT DISH'"
      width="760px"
      @close="editOpen = false"
    >
      <div class="dish-form">
        <div class="dish-form__main">
          <label class="field">
            <span class="field__label dateline">NAME · 名称</span>
            <input v-model="editForm.name" class="input" placeholder="例如：黑椒牛柳" />
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
              <span class="field__label dateline">STOCK · 库存</span>
              <input v-model.number="editForm.stock" type="number" min="0" class="input" />
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
        <div class="dish-form__side">
          <span class="field__label dateline">IMAGE · 图片</span>
          <ImageUploader v-model:url="editForm.image" />
        </div>
      </div>

      <hr class="rule" style="margin: 18px 0;" />

      <div class="flavors">
        <div class="flavors__head">
          <span class="dateline">FLAVORS · 口味（可加多组）</span>
          <button class="btn btn-sm" @click="addFlavorRow">+ ADD FLAVOR</button>
        </div>
        <p v-if="flavorInput.length === 0" class="flavors__empty font-mono">NO FLAVOR YET</p>
        <div v-else class="flavors__list">
          <div v-for="(f, i) in flavorInput" :key="i" class="flavor-row">
            <input v-model="f.name" class="input flavor-row__name" placeholder="如：辣度 / 温度" />
            <div class="flavor-row__values">
              <span v-for="chip in flavorChips(f.value)" :key="chip" class="chip font-mono">
                {{ chip }}
                <button class="chip__x" @click="removeChip(i, chip)">×</button>
              </span>
              <input
                class="flavor-row__add"
                placeholder="输入后回车添加（如：不辣/微辣/中辣）"
                @keyup.enter="(e) => { addChip(i, (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = '' }"
              />
            </div>
            <button class="flavor-row__rm" @click="removeFlavorRow(i)">×</button>
          </div>
        </div>
      </div>

      <template #footer>
        <button class="btn btn-sm btn-ghost" @click="editOpen = false">CANCEL</button>
        <button class="btn btn-sm btn-signal" @click="submitEdit">{{ editMode === 'create' ? 'CREATE' : 'SAVE' }}</button>
      </template>
    </Modal>
  </section>
</template>

<style scoped>
.dishes { display: flex; flex-direction: column; gap: 18px; }
.dishes__head {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 18px;
  padding-top: 4px;
}
.dishes__head-l { display: flex; flex-direction: column; gap: 8px; }
.dishes__head-l .dateline {
  font-family: var(--font-pix);
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}
.dishes__head-r { display: flex; gap: 10px; }
.dishes__title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 300;
  font-size: 48px;
  letter-spacing: -0.02em;
  line-height: 1;
}

.dishes__filters {
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

.dishes__table-wrap { min-height: 320px; }
.dishes__loading {
  padding: 80px 0; text-align: center;
  font-family: var(--font-pix);
  font-size: 11px;
  letter-spacing: 0.22em; color: var(--ink-muted);
}
.dishes__check { width: 32px; }
.dishes__tbl { font-size: 13px; }
.t-right { text-align: right; }
.dishes__thumb {
  width: 48px; height: 48px;
  background: var(--paper-deep);
  border: 1px solid var(--rule);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.dishes__thumb img { width: 100%; height: 100%; object-fit: cover; }
.dishes__noimg {
  font-family: var(--font-pix);
  font-size: 8px;
  color: var(--ink-faint);
  letter-spacing: 0.18em;
}
.dishes__name {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 15px;
}
.dishes__time { font-size: 12px; color: var(--ink-muted); white-space: nowrap; }
.actions { display: inline-flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }

.dishes__pager {
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.18em; color: var(--ink-muted);
  text-transform: uppercase; padding-top: 8px;
  border-top: 1px solid var(--rule-soft);
}
.pager__btns { display: flex; gap: 6px; }

/* form */
.dish-form { display: grid; grid-template-columns: 1fr 220px; gap: 18px; }
.dish-form__main { display: flex; flex-direction: column; gap: 12px; }
.dish-form__side { display: flex; flex-direction: column; gap: 6px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.field__label {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}

/* flavors */
.flavors__head {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
}
.flavors__head :deep(.dateline) {
  font-family: var(--font-pix);
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}
.flavors__empty {
  padding: 14px 0;
  font-family: var(--font-pix);
  letter-spacing: 0.22em; color: var(--ink-faint); font-size: 10px;
}
.flavors__list { display: flex; flex-direction: column; gap: 10px; }
.flavor-row {
  display: grid;
  grid-template-columns: 180px 1fr 36px;
  gap: 10px;
  align-items: start;
  padding: 8px;
  background: var(--paper-deep);
  border: 1px solid var(--rule);
  transition: border-color 0.2s var(--ease);
}
.flavor-row:hover { border-color: var(--ink); }
.flavor-row__name { font-weight: 500; }
.flavor-row__values {
  display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
  padding: 6px 8px; min-height: 42px;
  background: var(--paper);
  border: 1px solid var(--rule-soft);
}
.flavor-row__add {
  flex: 1; min-width: 160px;
  border: none; background: transparent; outline: none;
  font-size: 13px; color: var(--ink);
  padding: 2px 4px;
}
.chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 8px;
  background: var(--ink); color: var(--paper);
  font-family: var(--font-pix);
  font-size: 9px; letter-spacing: 0.06em;
}
.chip__x {
  background: transparent; border: none; color: var(--paper);
  cursor: pointer; padding: 0 2px; font-size: 13px; line-height: 1;
}
.chip__x:hover { color: var(--signal); }
.flavor-row__rm {
  width: 32px; height: 32px;
  background: transparent; border: 1px solid var(--rule-soft);
  color: var(--ink-muted); cursor: pointer; font-size: 16px;
  transition: background 0.2s var(--ease), color 0.2s var(--ease), border-color 0.2s var(--ease);
}
.flavor-row__rm:hover { background: var(--signal); color: var(--paper); border-color: var(--signal); }

@media (max-width: 1100px) {
  .dishes__filters { grid-template-columns: 1fr 1fr; }
  .filter__actions { grid-column: 1 / -1; justify-content: flex-end; }
  .dish-form { grid-template-columns: 1fr; }
  .dish-form__side { max-width: 280px; }
}
@media (max-width: 900px) {
  .dishes__tbl { font-size: 12px; }
  .dishes__tbl th:nth-child(4), .dishes__tbl td:nth-child(4),
  .dishes__tbl th:nth-child(8), .dishes__tbl td:nth-child(8) { display: none; }
}
</style>