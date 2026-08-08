<script setup lang="ts">
// 主布局：左侧 Masthead/Sidebar + 右侧 Masthead bar + outlet
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useShopStore } from '@/stores/shop'
import { useEmployeeStore } from '@/stores/employee'
import { ElMessage, ElMessageBox } from '@/api/notify'
import Modal from '@/components/Modal.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const shop = useShopStore()
const empStore = useEmployeeStore()

const today = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
})

const nav = [
  { name: 'desk',       label: '工作台',  sub: 'THE DESK' },
  { name: 'orders',     label: '订单管理', sub: 'ORDER DESK' },
  { name: 'dishes',     label: '菜品管理', sub: 'DISHES' },
  { name: 'setmeals',   label: '套餐管理', sub: 'SETMEALS' },
  { name: 'categories', label: '分类管理', sub: 'CATEGORIES' },
  { name: 'employees',  label: '员工管理', sub: 'STAFF' },
  { name: 'reports',    label: '数据报表', sub: 'REPORTS' },
  { name: 'shop',       label: '营业状态', sub: 'SHOP STATUS' },
]

// ===== 用户菜单 =====
const userMenuOpen = ref<boolean>(false)

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}
function closeUserMenu() {
  userMenuOpen.value = false
}

async function onLogout() {
  closeUserMenu()
  const ok = await ElMessageBox('退出', '确定要退出登录吗？', { confirmText: '退出', cancelText: '取消' })
  if (ok) {
    await auth.logout()
    router.push('/login')
  }
}

async function onToggleShop() {
  await shop.toggle()
}

// ===== 改密 Modal =====
const pwOpen = ref<boolean>(false)
const pwOld = ref<string>('')
const pwNew = ref<string>('')
const pwNew2 = ref<string>('')

function openChangePw() {
  closeUserMenu()
  pwOld.value = ''; pwNew.value = ''; pwNew2.value = ''
  pwOpen.value = true
}

async function submitChangePw() {
  if (!auth.emp?.id) return ElMessage.error('当前账户异常')
  if (!pwOld.value) return ElMessage.warning('请填写旧密码')
  if (!pwNew.value) return ElMessage.warning('请填写新密码')
  if (pwNew.value !== pwNew2.value) return ElMessage.warning('两次新密码不一致')
  if (pwNew.value.length < 4) return ElMessage.warning('新密码至少 4 位')
  try {
    await empStore.changePassword({
      empId: auth.emp.id,
      oldPassword: pwOld.value,
      newPassword: pwNew.value,
    })
    pwOpen.value = false
  } catch { /* toast */ }
}
</script>

<template>
  <div class="layout" @click="closeUserMenu">
    <!-- =================== Sidebar =================== -->
    <aside class="side" @click.stop>
      <div class="side__brand">
        <div class="side__estab">EST. 2026 · DASH FOODS</div>
        <h1 class="side__title">商家台</h1>
        <div class="side__sub font-mono">MERCHANT DESK · DAILY EDITION</div>
        <hr class="rule-double" />
      </div>

      <nav class="side__nav">
        <div class="dateline side__nav-label">SECTIONS</div>
        <ul>
          <li v-for="n in nav" :key="n.name">
            <router-link
              :to="{ name: n.name }"
              class="side__link"
              :class="{ 'side__link--on': route.name === n.name }"
            >
              <span class="side__link-cn">{{ n.label }}</span>
              <span class="side__link-en font-mono">{{ n.sub }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="side__footer">
        <hr class="rule" />
        <div class="side__user-wrap">
          <button class="side__user" @click="toggleUserMenu" :class="{ 'side__user--on': userMenuOpen }">
            <div class="side__user-name">{{ auth.emp?.name || 'STAFF' }}</div>
            <div class="side__user-meta font-mono">
              @{{ auth.emp?.userName || '——' }} · MENU
              <span class="side__caret">▾</span>
            </div>
          </button>
          <div v-if="userMenuOpen" class="user-menu">
            <button class="user-menu__item" @click="openChangePw">
              <span class="font-mono user-menu__k">PASSWORD</span>
              <span class="user-menu__cn">修改密码</span>
            </button>
            <hr class="rule-faint" />
            <button class="user-menu__item user-menu__item--danger" @click="onLogout">
              <span class="font-mono user-menu__k">EXIT</span>
              <span class="user-menu__cn">退出登录</span>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- =================== Main =================== -->
    <div class="main">
      <!-- Topbar / Masthead -->
      <header class="topbar">
        <div class="topbar__left">
          <div class="dateline">VOL. I · NO. {{ String(new Date().getDate()).padStart(2, '0') }} · {{ today }}</div>
          <h2 class="topbar__title headline">
            <span class="topbar__crumb">DASH FOODS /</span>
            {{ (route.meta?.title as string) || '工作台' }}
          </h2>
        </div>
        <div class="topbar__right">
          <button class="shop-toggle" :class="{ 'shop-toggle--on': shop.isOpen }" @click="onToggleShop">
            <span class="shop-toggle__dot" />
            <span class="shop-toggle__text font-mono">{{ shop.statusLabel }}</span>
          </button>
        </div>
      </header>

      <hr class="rule-thick" />

      <main class="content">
        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>
    </div>

    <!-- 改密 Modal -->
    <Modal :open="pwOpen" title="修改密码" width="440px" @close="pwOpen = false">
      <div class="pw-form">
        <label class="field">
          <span class="field__label dateline">OLD · 原密码</span>
          <input v-model="pwOld" type="password" class="input" autocomplete="current-password" />
        </label>
        <label class="field">
          <span class="field__label dateline">NEW · 新密码</span>
          <input v-model="pwNew" type="password" class="input" autocomplete="new-password" placeholder="至少 4 位" />
        </label>
        <label class="field">
          <span class="field__label dateline">CONFIRM · 再次输入</span>
          <input v-model="pwNew2" type="password" class="input" autocomplete="new-password" />
        </label>
      </div>
      <template #footer>
        <button class="btn btn-sm btn-ghost" @click="pwOpen = false">取消</button>
        <button class="btn btn-sm btn-signal" @click="submitChangePw">保存</button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr;
  min-height: 100vh;
  position: relative;
  z-index: 2;
}
.side {
  background: var(--paper-deep);
  border-right: 1px solid var(--rule);
  display: flex;
  flex-direction: column;
  padding: 28px 24px 20px;
  gap: 20px;
  position: sticky;
  top: 0;
  height: 100vh;
}
.side__brand { display: flex; flex-direction: column; gap: 6px; }
.side__estab {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--ink-muted);
}
.side__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-style: italic;
  font-size: 44px;
  line-height: 0.95;
  letter-spacing: -0.02em;
  margin-top: 4px;
}
.side__sub {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.22em;
  color: var(--ink-muted);
  text-transform: uppercase;
  margin-top: 2px;
}

.side__nav { flex: 1 1 auto; overflow-y: auto; }
.side__nav-label { margin-bottom: 10px; }
.side__nav ul { display: flex; flex-direction: column; gap: 2px; }
.side__link {
  display: flex;
  flex-direction: column;
  padding: 11px 14px;
  border: 1px solid transparent;
  transition: background .15s var(--ease), border-color .15s var(--ease);
}
.side__link:hover {
  background: var(--paper-soft);
  border-color: var(--rule-soft);
}
.side__link--on {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}
.side__link--on:hover {
  /* 选中态悬浮保持黑底白字，不变藏青 */
  background: var(--ink);
  border-color: var(--ink);
  color: var(--paper);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -8px rgba(10, 10, 10, 0.45);
}
.side__link-cn { font-family: var(--font-display); font-size: 17px; font-weight: 500; line-height: 1.1; }
.side__link-en {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  opacity: 0.7;
  margin-top: 2px;
}
.side__link--on .side__link-en { opacity: 0.9; }

.side__footer { margin-top: auto; padding-top: 8px; position: relative; }
.side__user-wrap { position: relative; }
.side__user {
  width: 100%;
  text-align: left;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border: 1px solid transparent;
  transition: border-color .15s var(--ease), background .15s var(--ease);
  background: transparent;
  cursor: pointer;
}
.side__user:hover, .side__user--on {
  border-color: var(--ink);
  background: var(--paper-soft);
}
.side__user-name { font-family: var(--font-display); font-weight: 500; font-size: 16px; }
.side__user-meta {
  font-family: var(--font-pix);
  font-size: 10px; letter-spacing: 0.18em;
  color: var(--ink-muted); text-transform: uppercase;
  display: flex; align-items: center; gap: 6px;
}
.side__caret { font-size: 12px; }

.user-menu {
  position: absolute;
  left: 0; right: 0; bottom: calc(100% + 6px);
  background: var(--paper);
  border: 1px solid var(--rule);
  box-shadow: 0 10px 24px -10px rgba(10, 10, 10, 0.18);
  z-index: 50;
  display: flex; flex-direction: column;
}
.user-menu__item {
  display: flex; flex-direction: column;
  align-items: flex-start;
  padding: 10px 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s var(--ease), color 0.15s var(--ease);
}
.user-menu__item:hover { background: var(--ink); color: var(--paper); }
.user-menu__item--danger:hover { background: var(--signal); }
.user-menu__k { font-family: var(--font-pix); font-size: 10px; letter-spacing: 0.22em; opacity: 0.6; }
.user-menu__cn { font-family: var(--font-display); font-weight: 500; font-size: 15px; margin-top: 2px; }

/* Main */
.main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.topbar {
  padding: 22px 36px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
}
.topbar__left { display: flex; flex-direction: column; gap: 6px; }
.topbar__title {
  font-size: 34px;
  font-weight: 400;
  font-style: italic;
  letter-spacing: -0.02em;
  line-height: 1;
}
.topbar__crumb {
  font-family: var(--font-pix);
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--ink-muted);
  text-transform: uppercase;
  margin-right: 14px;
  font-weight: 400;
}

.shop-toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: 1px solid var(--ink);
  background: var(--paper);
  font-weight: 500;
  transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease);
}
.shop-toggle:hover { background: var(--paper-soft); transform: translateY(-2px); box-shadow: 0 8px 18px -6px rgba(10, 10, 10, 0.18); }
.shop-toggle__dot {
  width: 8px;
  height: 8px;
  background: var(--ink-faint);
  border: 1px solid var(--ink);
}
.shop-toggle--on .shop-toggle__dot { background: var(--ink); border-color: var(--ink); box-shadow: 0 0 0 3px var(--olive-soft); }
.shop-toggle__text { font-family: var(--font-pix); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; }

.content {
  padding: 28px 36px 64px;
  flex: 1 1 auto;
  max-width: var(--max-content);
  width: 100%;
}

/* Page transition */
.page-enter-active, .page-leave-active { transition: opacity .2s var(--ease), transform .2s var(--ease); }
.page-enter-from { opacity: 0; transform: translateY(6px); }
.page-leave-to   { opacity: 0; transform: translateY(-4px); }

/* 改密表单 */
.pw-form { display: flex; flex-direction: column; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field__label { color: var(--ink-muted); }

/* Responsive: collapse sidebar under 900 */
@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .side { position: static; height: auto; border-right: none; border-bottom: 1px solid var(--rule); }
  .side__title { font-size: 34px; }
  .side__nav ul { flex-direction: row; flex-wrap: wrap; }
  .side__link { flex: 1 1 140px; }
  .topbar { padding: 16px 18px; }
  .topbar__title { font-size: 26px; }
  .content { padding: 20px 18px 48px; }
}
</style>