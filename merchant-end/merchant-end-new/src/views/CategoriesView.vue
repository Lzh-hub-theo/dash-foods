<script setup lang="ts">
// 分类管理 / CATEGORIES
import { onMounted, ref, computed } from 'vue'
import { useCategoryStore } from '@/stores/category'
import Modal from '@/components/Modal.vue'
import EmptyState from '@/components/EmptyState.vue'
import { ElMessage, ElMessageBox } from '@/api/notify'
import type { Category } from '@/types/api'

const store = useCategoryStore()

const typeFilter = ref<number>(1)        // 1=菜品分类 2=套餐分类
const nameFilter = ref<string>('')
const page = ref<number>(1)
const pageSize = ref<number>(10)

const editOpen = ref<boolean>(false)
const editMode = ref<'create' | 'edit'>('create')
const editForm = ref<Partial<Category>>({ name: '', sort: 0, type: 1, status: 1 })

async function load() {
  await store.fetchPage({
    page: page.value,
    pageSize: pageSize.value,
    name: nameFilter.value || undefined,
    type: typeFilter.value,
  })
}

async function onSearch() { page.value = 1; await load() }
async function onReset() { nameFilter.value = ''; typeFilter.value = 1; page.value = 1; await load() }
async function onPage(p: number) {
  if (p < 1) return
  page.value = p
  await load()
}

function openCreate() {
  editMode.value = 'create'
  editForm.value = { name: '', sort: 0, type: typeFilter.value, status: 1 }
  editOpen.value = true
}

function openEdit(c: Category) {
  editMode.value = 'edit'
  editForm.value = { ...c }
  editOpen.value = true
}

async function submitEdit() {
  if (!editForm.value.name?.trim()) {
    ElMessage.warning('请填写分类名称')
    return
  }
  try {
    if (editMode.value === 'create') {
      await store.create({
        name: editForm.value.name.trim(),
        sort: Number(editForm.value.sort) || 0,
        type: editForm.value.type || 1,
        status: 1,
      })
    } else {
      await store.update({
        id: editForm.value.id,
        name: editForm.value.name.trim(),
        sort: Number(editForm.value.sort) || 0,
        type: editForm.value.type,
        status: editForm.value.status,
      })
    }
    editOpen.value = false
  } catch { /* 已 toast */ }
}

async function onDelete(c: Category) {
  const ok = await ElMessageBox('DELETE', `确定要删除分类「${c.name}」?`, { danger: true, confirmText: 'DELETE' })
  if (ok) await store.remove(c.id)
}

async function onToggle(c: Category) {
  await store.toggleStatus(c.id, c.status)
}

const totalPages = computed(() => Math.max(1, Math.ceil(store.total / pageSize.value)))
const typeLabel = computed(() => (typeFilter.value === 1 ? '菜品分类' : '套餐分类'))

onMounted(load)
</script>

<template>
  <section class="cats">
    <header class="cats__head">
      <div class="cats__head-l">
        <span class="dateline">§ CATEGORIES · 分类目录</span>
        <h2 class="cats__title headline">{{ typeLabel }}</h2>
      </div>
      <div class="cats__head-r">
        <button class="btn btn-signal" @click="openCreate">+ NEW {{ typeFilter === 1 ? 'DISH' : 'SETMEAL' }} CATEGORY</button>
      </div>
    </header>

    <hr class="rule-thick" />

    <div class="cats__filters">
      <div class="filter">
        <span class="dateline">TYPE</span>
        <select v-model.number="typeFilter" class="select" @change="onSearch">
          <option :value="1">菜品分类</option>
          <option :value="2">套餐分类</option>
        </select>
      </div>
      <div class="filter">
        <span class="dateline">NAME</span>
        <input v-model="nameFilter" class="input" placeholder="按名称搜索" @keyup.enter="onSearch" />
      </div>
      <div class="filter__actions">
        <button class="btn btn-sm" @click="onSearch">SEARCH</button>
        <button class="btn btn-sm btn-ghost" @click="onReset">RESET</button>
      </div>
    </div>

    <div class="cats__table-wrap">
      <div v-if="store.loading && store.list.length === 0" class="cats__loading font-mono">LOADING…</div>
      <EmptyState v-else-if="store.list.length === 0" message="暂无分类" hint="ADD A NEW ONE TO START" />
      <table v-else class="tbl cats__tbl">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th class="t-right">Sort</th>
            <th>Status</th>
            <th>Updated</th>
            <th class="t-right">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in store.list" :key="c.id">
            <td class="font-mono tnum">#{{ String(c.id).padStart(3, '0') }}</td>
            <td class="cats__name">{{ c.name }}</td>
            <td class="font-mono">{{ c.type === 1 ? '菜品' : '套餐' }}</td>
            <td class="t-right font-mono tnum">{{ c.sort }}</td>
            <td>
              <span
                class="pill font-mono"
                :class="c.status === 1 ? 'pill--on' : 'pill--off'"
                @click="onToggle(c)"
                :title="c.status === 1 ? '点击停用' : '点击启用'"
              >
                {{ c.status === 1 ? 'ACTIVE' : 'DISABLED' }}
              </span>
            </td>
            <td class="font-mono cats__time">{{ c.updateTime || '——' }}</td>
            <td class="t-right">
              <div class="actions">
                <button class="btn btn-sm btn-ghost" @click="openEdit(c)">EDIT</button>
                <button class="btn btn-sm btn-signal" @click="onDelete(c)">DELETE</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="cats__pager font-mono" v-if="store.total > 0">
      <span>TOTAL {{ store.total }} · PAGE {{ page }} / {{ totalPages }}</span>
      <div class="pager__btns">
        <button class="btn btn-sm btn-ghost" :disabled="page <= 1" @click="onPage(page - 1)">PREV</button>
        <button class="btn btn-sm btn-ghost" :disabled="page >= totalPages" @click="onPage(page + 1)">NEXT</button>
      </div>
    </div>

    <!-- 新增/编辑 Modal -->
    <Modal
      :open="editOpen"
      :title="editMode === 'create' ? 'NEW CATEGORY' : 'EDIT CATEGORY'"
      width="460px"
      @close="editOpen = false"
    >
      <div class="form">
        <label class="field">
          <span class="field__label dateline">NAME · 分类名称</span>
          <input v-model="editForm.name" class="input" placeholder="例如：招牌主菜" autofocus />
        </label>
        <label class="field">
          <span class="field__label dateline">TYPE · 类型</span>
          <select v-model.number="editForm.type" class="select">
            <option :value="1">菜品分类</option>
            <option :value="2">套餐分类</option>
          </select>
        </label>
        <label class="field">
          <span class="field__label dateline">SORT · 排序</span>
          <input v-model.number="editForm.sort" type="number" class="input" />
        </label>
      </div>
      <template #footer>
        <button class="btn btn-sm btn-ghost" @click="editOpen = false">CANCEL</button>
        <button class="btn btn-sm btn-signal" @click="submitEdit">{{ editMode === 'create' ? 'CREATE' : 'SAVE' }}</button>
      </template>
    </Modal>
  </section>
</template>

<style scoped>
.cats { display: flex; flex-direction: column; gap: 18px; }
.cats__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  padding-top: 4px;
}
.cats__head-l { display: flex; flex-direction: column; gap: 8px; }
.cats__head-l .dateline {
  font-family: var(--font-pix);
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}
.cats__title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 300;
  font-size: 48px;
  letter-spacing: -0.02em;
  line-height: 1;
}

.cats__filters {
  display: grid;
  grid-template-columns: 200px 1fr auto;
  gap: 12px;
  align-items: end;
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
.filter__actions { display: flex; gap: 8px; }

.cats__table-wrap { min-height: 320px; }
.cats__loading {
  padding: 80px 0;
  text-align: center;
  font-family: var(--font-pix);
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--ink-muted);
}
.cats__name {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 15px;
}
.cats__time { font-size: 12px; color: var(--ink-muted); }
.t-right { text-align: right; }
.actions { display: inline-flex; gap: 6px; justify-content: flex-end; }

.pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  font-family: var(--font-pix);
  font-size: 9px;
  letter-spacing: 0.16em;
  font-weight: 400;
  border: 1px solid var(--ink);
  cursor: pointer;
  user-select: none;
  transition: transform .18s var(--ease), box-shadow .18s var(--ease), opacity .15s var(--ease);
}
.pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px -6px rgba(10, 10, 10, 0.18);
}
.pill--on  { background: var(--ink); color: var(--paper); }
.pill--off { background: var(--paper); color: var(--ink-muted); border-style: dashed; }

.cats__pager {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.18em;
  color: var(--ink-muted);
  text-transform: uppercase;
  padding-top: 8px;
  border-top: 1px solid var(--rule-soft);
}
.pager__btns { display: flex; gap: 6px; }

.form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field__label {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .cats__filters { grid-template-columns: 1fr 1fr; }
  .filter__actions { grid-column: 1 / -1; justify-content: flex-end; }
  .cats__tbl { font-size: 12px; }
  .cats__tbl th:nth-child(6), .cats__tbl td:nth-child(6) { display: none; }
}
</style>