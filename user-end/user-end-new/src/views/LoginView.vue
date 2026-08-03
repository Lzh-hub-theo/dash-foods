<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandMark from '@/components/layout/BrandMark.vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from '@/api/notify'

const user = useUserStore()
const router = useRouter()
const route = useRoute()

// 注册页跳转过来时会带 ?username=xxx，回填给用户
const username = ref(((route.query.username as string) || '').trim())
const password = ref('')
const loading = ref(false)

async function login() {
  if (!username.value.trim() || !password.value.trim()) {
    ElMessage({ type: 'error', text: '请输入账号和密码' })
    return
  }
  loading.value = true
  try {
    await user.loginByPassword(username.value.trim(), password.value)
    ElMessage({ type: 'success', text: '欢迎回到 dash·foods' })
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } catch (err) {
    ElMessage({
      type: 'error',
      text: (err as Error)?.message || '登录失败，请检查账号或密码',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-view">
    <div class="login-shell">
      <!-- 左：编辑感引语 -->
      <div class="login-quote">
        <p class="eyebrow">WELCOME&nbsp;BACK</p>
        <h1 class="title serif">
          回到<br />
          <em>田野</em>与餐桌之间
        </h1>
        <p class="sub">
          登录后即可下单、收藏偏好、查看历史订单与配送进度。
          第一次使用？联系店员开通账号。
        </p>
        <ul class="bullets">
          <li>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>
            一键登录，下单与会员体系打通
          </li>
          <li>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>
            支持自定义忌口与膳食偏好
          </li>
          <li>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>
            会员日双倍积分、生日特供
          </li>
        </ul>
      </div>

      <!-- 右：登录卡 -->
      <div class="login-card">
        <div class="card-head">
          <BrandMark />
          <div>
            <p class="brand">dash·foods</p>
            <p class="brand-sub">FIELD&nbsp;·&nbsp;TO&nbsp;·&nbsp;TABLE</p>
          </div>
        </div>

        <h2 class="card-title">账号登录</h2>
        <p class="card-desc">使用 dash·foods 账号登录，开始你的轻食之旅。</p>

        <form class="form" @submit.prevent="login">
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
          </label>

          <label class="field">
            <span class="field-label">密码&nbsp;·&nbsp;PASSWORD</span>
            <input
              v-model="password"
              type="password"
              class="field-input"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </label>

          <button class="submit" :disabled="loading">
            <span>{{ loading ? '正在登录…' : '登录并继续' }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
          </button>
        </form>

        <p class="tip">
          还没有账号？<RouterLink class="link" :to="{ name: 'register' }">立即注册</RouterLink>
          <span class="tip-sep">·</span>
          首次登录即视为同意 <a href="#">用户协议</a> 与 <a href="#">隐私政策</a>。
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
}
.login-shell {
  width: 100%;
  max-width: 1100px;
  display: grid;
  grid-template-columns: 1fr 460px;
  gap: 80px;
  align-items: center;
}

.login-quote {
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
  margin-bottom: 28px;
}
.bullets {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.bullets li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: var(--fs-14);
  color: var(--color-ink-soft);
}
.bullets svg {
  color: var(--color-sage);
  flex-shrink: 0;
}

.login-card {
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
  transition: border-color var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out);
}
.field-input:focus {
  outline: none;
  border-color: var(--color-sage);
  background: var(--color-paper);
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
  opacity: 0.6;
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
  .login-shell {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .login-quote {
    text-align: center;
    max-width: none;
  }
  .bullets {
    align-items: center;
  }
}
</style>