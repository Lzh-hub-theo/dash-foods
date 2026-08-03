<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandMark from '@/components/layout/BrandMark.vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from '@/api/notify'

const user = useUserStore()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const confirm = ref('')
const name = ref('')
const loading = ref(false)

/** 简单校验：账号长度 4~32，仅字母数字下划线 */
const usernameValid = computed(
  () => /^[A-Za-z0-9_]{4,32}$/.test(username.value.trim()),
)
const passwordValid = computed(() => password.value.length >= 6)
const confirmValid = computed(() => confirm.value === password.value && confirm.value.length > 0)
const canSubmit = computed(
  () => usernameValid.value && passwordValid.value && confirmValid.value,
)

async function register() {
  if (!usernameValid.value) {
    ElMessage({ type: 'error', text: '账号需为 4~32 位字母/数字/下划线' })
    return
  }
  if (!passwordValid.value) {
    ElMessage({ type: 'error', text: '密码至少 6 位' })
    return
  }
  if (!confirmValid.value) {
    ElMessage({ type: 'error', text: '两次输入的密码不一致' })
    return
  }
  loading.value = true
  try {
    await user.registerByPassword(
      username.value.trim(),
      password.value,
      name.value.trim() || undefined,
    )
    ElMessage({ type: 'success', text: '账号已建立，请用新账号登录' })
    const redirect = (route.query.redirect as string) || '/'
    // 注册成功 → 留在当前页不再有意义，跳到登录页让用户走真实登录
    router.replace({ name: 'login', query: { username: username.value.trim(), redirect } })
  } catch (err) {
    // 注册失败：保留输入，停在当前页（不跳转）
    // 注意 err 可能是任意对象，统一做空值兜底，避免模板/链式访问上踩到 null
    const e = err as { message?: unknown; msg?: unknown; code?: unknown } | null | undefined
    const rawMsg =
      (e && typeof e.message === 'string' && e.message) ||
      (e && typeof e.msg === 'string' && e.msg) ||
      ''
    ElMessage({
      type: 'error',
      text: rawMsg || '注册失败，请稍后再试',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-view">
    <div class="register-shell">
      <!-- 左：编辑感引语 -->
      <div class="register-quote">
        <p class="eyebrow">JOIN&nbsp;THE&nbsp;TABLE</p>
        <h1 class="title serif">
          从一颗<br />
          <em>种子</em>开始
        </h1>
        <p class="sub">
          注册一个 dash·foods 账号，把第一份轻食加入购物车。
          我们会记住你的口味与地址，让下一份更顺手。
        </p>

        <div class="steps">
          <div class="step">
            <span class="step-num">01</span>
            <div>
              <p class="step-title">设立账号</p>
              <p class="step-desc">4~32 位字母数字下划线，作为你的登录名。</p>
            </div>
          </div>
          <div class="step">
            <span class="step-num">02</span>
            <div>
              <p class="step-title">设置密码</p>
              <p class="step-desc">至少 6 位，建议字母数字混排。</p>
            </div>
          </div>
          <div class="step">
            <span class="step-num">03</span>
            <div>
              <p class="step-title">填个昵称</p>
              <p class="step-desc">可选；用来显示在订单与会员卡片上。</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右：注册卡 -->
      <div class="register-card">
        <div class="card-head">
          <BrandMark />
          <div>
            <p class="brand">dash·foods</p>
            <p class="brand-sub">FIELD&nbsp;·&nbsp;TO&nbsp;·&nbsp;TABLE</p>
          </div>
        </div>

        <h2 class="card-title">创建账号</h2>
        <p class="card-desc">
          填写账号、密码与昵称，注册成功后会自动登录。
        </p>

        <form class="form" @submit.prevent="register">
          <label class="field">
            <span class="field-label">账号&nbsp;·&nbsp;USERNAME</span>
            <input
              v-model="username"
              type="text"
              class="field-input"
              placeholder="dash_xxxx"
              autocomplete="username"
              spellcheck="false"
            />
            <span v-if="username && !usernameValid" class="field-hint hint-warn">
              账号需为 4~32 位字母/数字/下划线
            </span>
          </label>

          <label class="field">
            <span class="field-label">密码&nbsp;·&nbsp;PASSWORD</span>
            <input
              v-model="password"
              type="password"
              class="field-input"
              placeholder="至少 6 位"
              autocomplete="new-password"
            />
            <span v-if="password && !passwordValid" class="field-hint hint-warn">
              密码至少 6 位
            </span>
          </label>

          <label class="field">
            <span class="field-label">确认密码&nbsp;·&nbsp;CONFIRM</span>
            <input
              v-model="confirm"
              type="password"
              class="field-input"
              placeholder="再次输入"
              autocomplete="new-password"
            />
            <span v-if="confirm && !confirmValid" class="field-hint hint-warn">
              两次密码不一致
            </span>
          </label>

          <label class="field">
            <span class="field-label">昵称&nbsp;·&nbsp;NICKNAME&nbsp;<em>(可选)</em></span>
            <input
              v-model="name"
              type="text"
              class="field-input"
              placeholder="例如：小林"
              maxlength="20"
              autocomplete="nickname"
            />
          </label>

          <button class="submit" :disabled="!canSubmit || loading">
            <span>{{ loading ? '正在创建…' : '注册' }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
          </button>
        </form>

        <p class="tip">
          已有账号？<RouterLink class="link" :to="{ name: 'login' }">前往登录</RouterLink>
          <span class="tip-sep">·</span>
          注册即视为同意 <a href="#">用户协议</a> 与 <a href="#">隐私政策</a>。
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-view {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
}
.register-shell {
  width: 100%;
  max-width: 1100px;
  display: grid;
  grid-template-columns: 1fr 480px;
  gap: 80px;
  align-items: center;
}

.register-quote {
  max-width: 460px;
}
.eyebrow {
  font-size: var(--fs-12);
  font-weight: 700;
  letter-spacing: 0.32em;
  color: var(--color-sage);
  margin-bottom: 24px;
}
.title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(48px, 5.5vw, 72px);
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: var(--color-ink);
  margin-bottom: 24px;
}
.title em {
  font-style: italic;
  color: var(--color-sage-deep);
  position: relative;
}
.title em::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.06em;
  height: 0.18em;
  background: var(--color-butter);
  border-radius: 4px;
  z-index: -1;
}
.sub {
  font-size: var(--fs-15);
  line-height: 1.7;
  color: var(--color-ink-soft);
  margin-bottom: 32px;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.step {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 14px 16px;
  background: var(--color-paper);
  border: 1px dashed var(--color-line);
  border-radius: var(--radius-md);
}
.step-num {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 500;
  color: var(--color-sage-deep);
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.step-title {
  font-size: var(--fs-14);
  font-weight: 600;
  color: var(--color-ink);
  margin-bottom: 2px;
}
.step-desc {
  font-size: var(--fs-12);
  color: var(--color-ink-mute);
  line-height: 1.6;
}

.register-card {
  padding: 40px;
  background: var(--color-paper);
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
}
.card-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 24px;
  border-bottom: 1px dashed var(--color-line);
  margin-bottom: 28px;
}
.brand {
  font-family: var(--font-display);
  font-size: var(--fs-20);
  font-weight: 500;
  color: var(--color-ink);
  letter-spacing: -0.01em;
}
.brand-sub {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.32em;
  color: var(--color-sage);
  margin-top: 4px;
}
.card-title {
  font-family: var(--font-display);
  font-size: var(--fs-28);
  font-weight: 500;
  margin-bottom: 8px;
}
.card-desc {
  font-size: var(--fs-13);
  color: var(--color-ink-mute);
  margin-bottom: 24px;
  line-height: 1.6;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.field-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.28em;
  color: var(--color-ink-mute);
}
.field-label em {
  font-style: normal;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: var(--color-ink-mute);
  opacity: 0.7;
}
.field-input {
  height: 52px;
  padding: 0 18px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-line);
  background: var(--color-cream);
  font-family: var(--font-display);
  font-size: var(--fs-16);
  color: var(--color-ink);
  letter-spacing: 0.02em;
  transition:
    border-color var(--dur-base) var(--ease-out),
    background var(--dur-base) var(--ease-out);
}
.field-input:focus {
  outline: none;
  border-color: var(--color-sage);
  background: var(--color-paper);
}
.field-hint {
  font-size: var(--fs-12);
  color: var(--color-ink-mute);
  letter-spacing: 0.02em;
}
.hint-warn {
  color: var(--color-tomato);
}

.submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 52px;
  border-radius: var(--radius-md);
  background: var(--color-ink);
  color: var(--color-paper);
  font-size: var(--fs-14);
  font-weight: 600;
  letter-spacing: 0.04em;
  margin-top: 8px;
  transition:
    background var(--dur-base) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}
.submit:hover:not(:disabled) {
  background: var(--color-sage-deep);
  transform: translateY(-1px);
}
.submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tip {
  margin-top: 20px;
  font-size: var(--fs-12);
  color: var(--color-ink-mute);
  text-align: center;
}
.tip a {
  color: var(--color-sage);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.tip .link {
  color: var(--color-ink);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1.5px;
}
.tip .link:hover {
  color: var(--color-sage-deep);
}
.tip-sep {
  margin: 0 8px;
  color: var(--color-ink-mute);
}

@media (max-width: 900px) {
  .register-shell {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .register-quote {
    text-align: center;
    max-width: none;
  }
  .steps {
    align-items: stretch;
  }
}
</style>