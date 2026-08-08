<script setup lang="ts">
// 员工管理 / EMPLOYEES
import { onMounted, ref, computed } from 'vue'
import { useEmployeeStore } from '@/stores/employee'
import Modal from '@/components/Modal.vue'
import EmptyState from '@/components/EmptyState.vue'
import StatusPill from '@/components/StatusPill.vue'
import { ElMessage, ElMessageBox } from '@/api/notify'
import type { Employee, EmployeeDTO } from '@/types/api'

const store = useEmployeeStore()

const page = ref<number>(1)
const pageSize = ref<number>(10)
const nameFilter = ref<string>('')

const editOpen = ref<boolean>(false)
const editMode = ref<'create' | 'edit'>('create')
const editForm = ref<EmployeeDTO & { password2?: string }>({
  username: '',
  name: '',
  phone: '',
  sex: '男',
  idNumber: '',
})

const totalPages = computed(() => Math.max(1, Math.ceil(store.total / pageSize.value)))

async function load() {
  await store.fetchPage({
    page: page.value,
    pageSize: pageSize.value,
    name: nameFilter.value || undefined,
  })
}
async function onSearch() { page.value = 1; await load() }
async function onReset() { nameFilter.value = ''; page.value = 1; await load() }
async function onPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  page.value = p; await load()
}

function openCreate() {
  editMode.value = 'create'
  editForm.value = {
    username: '', name: '', phone: '', sex: '男', idNumber: '',
    password: '', password2: '',
  }
  editOpen.value = true
}

async function openEdit(e: Employee) {
  editMode.value = 'edit'
  try {
    const detail = await store.getDetail(e.id)
    editForm.value = {
      id: detail.id,
      username: detail.username,
      name: detail.name,
      phone: detail.phone || '',
      sex: detail.sex || '男',
      idNumber: detail.idNumber || '',
    }
    editOpen.value = true
  } catch { /* toast */ }
}

async function submitEdit() {
  if (!editForm.value.username?.trim()) return ElMessage.warning('请填写登录用户名')
  if (!editForm.value.name?.trim()) return ElMessage.warning('请填写姓名')
  if (editMode.value === 'create') {
    if (!editForm.value.password) return ElMessage.warning('请填写初始密码')
    if (editForm.value.password !== editForm.value.password2) return ElMessage.warning('两次密码不一致')
    if (editForm.value.password.length < 4) return ElMessage.warning('密码至少 4 位')
  }
  try {
    if (editMode.value === 'create') {
      await store.create({
        username: editForm.value.username.trim(),
        name: editForm.value.name.trim(),
        phone: editForm.value.phone?.trim() || undefined,
        sex: editForm.value.sex,
        idNumber: editForm.value.idNumber?.trim() || undefined,
        password: editForm.value.password,
      })
    } else {
      await store.update({
        id: editForm.value.id,
        username: editForm.value.username.trim(),
        name: editForm.value.name.trim(),
        phone: editForm.value.phone?.trim() || undefined,
        sex: editForm.value.sex,
        idNumber: editForm.value.idNumber?.trim() || undefined,
      })
    }
    editOpen.value = false
  } catch { /* toast */ }
}

async function onTogglePill(e: Employee) {
  if (e.status === 1) {
    const ok = await ElMessageBox(
      'DISABLE',
      `确定禁用员工「${e.name}」?`,
      { danger: true, confirmText: 'DISABLE' },
    )
    if (ok) await store.toggleStatus(e.id, e.status)
  } else {
    await store.toggleStatus(e.id, e.status)
  }
}

function fmtTime(s?: string) {
  if (!s) return '——'
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleString('zh-CN', { hour12: false })
}

onMounted(load)
</script>

<template>
  <section class="emps">
    <header class="emps__head">
      <div class="emps__head-l">
        <span class="dateline">§ STAFF · 员工名录</span>
        <h2 class="emps__title headline">EMPLOYEES</h2>
      </div>
      <div class="emps__head-r">
        <button class="btn btn-signal" @click="openCreate">+ NEW EMPLOYEE</button>
      </div>
    </header>

    <hr class="rule-thick" />

    <div class="emps__filters">
      <div class="filter filter--wide">
        <span class="dateline">NAME</span>
        <input v-model="nameFilter" class="input" placeholder="按姓名搜索" @keyup.enter="onSearch" />
      </div>
      <div class="filter__actions">
        <button class="btn btn-sm" @click="onSearch">SEARCH</button>
        <button class="btn btn-sm btn-ghost" @click="onReset">RESET</button>
      </div>
    </div>

    <div class="emps__table-wrap">
      <div v-if="store.loading && store.list.length === 0" class="emps__loading font-mono">LOADING…</div>
      <EmptyState v-else-if="store.list.length === 0" message="暂无员工" hint="ADD A NEW ONE TO START" />
      <table v-else class="tbl emps__tbl">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Sex</th>
            <th>Status</th>
            <th>Created</th>
            <th class="t-right">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in store.list" :key="e.id">
            <td class="font-mono tnum">#{{ String(e.id).padStart(3, '0') }}</td>
            <td class="font-mono emps__user">{{ e.username }}</td>
            <td class="emps__name">{{ e.name }}</td>
            <td class="font-mono">{{ e.phone || '——' }}</td>
            <td class="font-mono">{{ e.sex || '——' }}</td>
            <td>
              <StatusPill :status="e.status" @toggle="onTogglePill(e)" :on-label="'ACTIVE'" :off-label="'DISABLED'" />
            </td>
            <td class="font-mono emps__time">{{ fmtTime(e.createTime) }}</td>
            <td class="t-right">
              <div class="actions">
                <button class="btn btn-sm btn-ghost" @click="openEdit(e)">EDIT</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="emps__pager font-mono" v-if="store.total > 0">
      <span>TOTAL {{ store.total }} · PAGE {{ page }} / {{ totalPages }}</span>
      <div class="pager__btns">
        <button class="btn btn-sm btn-ghost" :disabled="page <= 1" @click="onPage(page - 1)">PREV</button>
        <button class="btn btn-sm btn-ghost" :disabled="page >= totalPages" @click="onPage(page + 1)">NEXT</button>
      </div>
    </div>

    <!-- 编辑 Modal -->
    <Modal
      :open="editOpen"
      :title="editMode === 'create' ? 'NEW EMPLOYEE' : 'EDIT EMPLOYEE'"
      width="520px"
      @close="editOpen = false"
    >
      <div class="form">
        <label class="field">
          <span class="field__label dateline">USERNAME · 登录用户名</span>
          <input v-model="editForm.username" class="input" placeholder="如：zhang.san" />
        </label>
        <label class="field">
          <span class="field__label dateline">NAME · 姓名</span>
          <input v-model="editForm.name" class="input" placeholder="真实姓名" />
        </label>
        <div class="field-row">
          <label class="field">
            <span class="field__label dateline">PHONE · 手机号</span>
            <input v-model="editForm.phone" class="input" placeholder="11 位手机号" />
          </label>
          <label class="field">
            <span class="field__label dateline">SEX · 性别</span>
            <select v-model="editForm.sex" class="select">
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </label>
        </div>
        <label class="field">
          <span class="field__label dateline">ID NUMBER · 身份证号</span>
          <input v-model="editForm.idNumber" class="input" placeholder="（选填）" />
        </label>
        <template v-if="editMode === 'create'">
          <div class="field-row">
            <label class="field">
              <span class="field__label dateline">PASSWORD · 初始密码</span>
              <input v-model="editForm.password" type="password" class="input" placeholder="至少 4 位" />
            </label>
            <label class="field">
              <span class="field__label dateline">CONFIRM · 再次输入</span>
              <input v-model="editForm.password2" type="password" class="input" placeholder="再次输入" />
            </label>
          </div>
        </template>
      </div>
      <template #footer>
        <button class="btn btn-sm btn-ghost" @click="editOpen = false">CANCEL</button>
        <button class="btn btn-sm btn-signal" @click="submitEdit">{{ editMode === 'create' ? 'CREATE' : 'SAVE' }}</button>
      </template>
    </Modal>
  </section>
</template>

<style scoped>
.emps { display: flex; flex-direction: column; gap: 18px; }
.emps__head {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 18px;
  padding-top: 4px;
}
.emps__head-l { display: flex; flex-direction: column; gap: 8px; }
.emps__head-l .dateline {
  font-family: var(--font-pix);
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}
.emps__head-r { display: flex; gap: 10px; }
.emps__title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 300;
  font-size: 48px;
  letter-spacing: -0.02em;
  line-height: 1;
}

.emps__filters {
  display: grid;
  grid-template-columns: 1fr auto;
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
.filter--wide { min-width: 240px; }
.filter__actions { display: flex; gap: 8px; }

.emps__table-wrap { min-height: 320px; }
.emps__loading {
  padding: 80px 0; text-align: center;
  font-family: var(--font-pix);
  font-size: 11px;
  letter-spacing: 0.22em; color: var(--ink-muted);
}
.t-right { text-align: right; }
.emps__user { font-size: 12px; color: var(--ink-muted); }
.emps__name {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 15px;
}
.emps__time { font-size: 12px; color: var(--ink-muted); white-space: nowrap; }
.actions { display: inline-flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }

.emps__pager {
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.18em; color: var(--ink-muted);
  text-transform: uppercase; padding-top: 8px;
  border-top: 1px solid var(--rule-soft);
}
.pager__btns { display: flex; gap: 6px; }

.form { display: flex; flex-direction: column; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.field__label {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .emps__tbl { font-size: 12px; }
  .emps__tbl th:nth-child(4), .emps__tbl td:nth-child(4),
  .emps__tbl th:nth-child(7), .emps__tbl td:nth-child(7) { display: none; }
}
</style>