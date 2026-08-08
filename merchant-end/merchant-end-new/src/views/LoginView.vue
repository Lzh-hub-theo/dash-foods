<script setup lang="ts">
// 登录页：报纸头版封面感
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const username = ref<string>('')
const password = ref<string>('')
const remember = ref<boolean>(true)
const submitting = ref<boolean>(false)

const dateLine = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).toUpperCase()
})

async function onSubmit() {
  if (!username.value || !password.value) return
  submitting.value = true
  try {
    await auth.login(username.value.trim(), password.value)
    const redirect = (route.query.redirect as string) || '/desk'
    router.push(redirect)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login">
    <!-- Left: masthead cover -->
    <section class="login__cover">
      <div class="cover__top dateline">{{ dateLine }} · VOL. I · NO. 01</div>
      <hr class="rule-double" />
      <h1 class="cover__brand">DASH<br />FOODS.</h1>
      <div class="cover__sub font-mono">—— 现代厨房的商家指挥台 ——</div>
      <hr class="rule" />

      <div class="cover__body">
        <div class="cover__column">
          <div class="dateline">EDITORIAL</div>
          <p class="cover__p">
            今日起，后厨的指挥台、订单的派送单、菜单的排版间，
            都在同一张报纸里完成。
          </p>
          <p class="cover__p cover__p--muted">
            订单滚滚而来，菜品装盘上桌，账目一一结清。<br />
            一日复一日，一版又一版。
          </p>
        </div>
        <div class="cover__column">
          <div class="dateline">WEATHER</div>
          <p class="cover__p">
            <strong>{{ new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }) }}</strong>
            ，后厨火力全开。<br />
            今日营业状态：<span class="cover__hi">由您掌控</span>。
          </p>
          <p class="cover__p cover__p--muted">
            文档版本 V2 · 接口对齐中
          </p>
        </div>
      </div>

      <hr class="rule-double" />
      <div class="cover__foot dateline">
        DASH FOODS · MERCHANT DESK · &copy; 2026
      </div>
    </section>

    <!-- Right: login form -->
    <section class="login__form">
      <div class="form__panel">
        <div class="form__eyebrow dateline">SIGN IN · 02</div>
        <h2 class="form__title headline">商家台<br />身份核验</h2>
        <p class="form__hint font-mono">
          请在下方输入账号与密码。<br />
          验证通过即可进入商家台。
        </p>

        <form @submit.prevent="onSubmit" class="form__fields">
          <label class="field">
            <span class="field__label dateline">USERNAME · 用户名</span>
            <input
              v-model="username"
              class="input"
              type="text"
              autocomplete="username"
              placeholder="请输入用户名"
              required
              autofocus
            />
          </label>
          <label class="field">
            <span class="field__label dateline">PASSWORD · 密码</span>
            <input
              v-model="password"
              class="input"
              type="password"
              autocomplete="current-password"
              placeholder="请输入密码"
              required
            />
          </label>

          <label class="check">
            <input v-model="remember" type="checkbox" />
            <span class="font-mono">记住本机</span>
          </label>

          <button class="btn form__submit" :disabled="submitting" type="submit">
            {{ submitting ? '登录中…' : '进入商家台' }}
          </button>
        </form>

        <div class="form__foot dateline">
          默认账号 · admin / 123456
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.login {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  background: var(--paper);
}
.login__cover {
  padding: 64px 72px;
  border-right: 1px solid var(--rule);
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: var(--paper-deep);
  min-height: 100vh;
  position: relative;
}
.cover__top {
  font-family: var(--font-pix);
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--ink-muted);
}
.cover__brand {
  font-family: var(--font-display);
  font-weight: 300;
  font-style: italic;
  font-size: clamp(88px, 12vw, 168px);
  line-height: 0.9;
  letter-spacing: -0.025em;
  margin: 18px 0 8px;
}
.cover__sub {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink-muted);
  padding-bottom: 14px;
}
.cover__body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
  padding: 24px 0;
  flex: 1 1 auto;
}
.cover__column { display: flex; flex-direction: column; gap: 10px; }
.cover__column .dateline {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.18em;
  color: var(--ink-muted);
  text-transform: uppercase;
}
.cover__p {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.65;
  color: var(--ink-soft);
}
.cover__p--muted {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 13px;
  color: var(--ink-muted);
  letter-spacing: 0.02em;
  line-height: 1.7;
}
.cover__hi { color: var(--signal); font-style: italic; font-weight: 500; }
.cover__foot {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--ink-muted);
  padding-top: 14px;
}

/* Form */
.login__form {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56px 64px;
}
.form__panel { width: 100%; max-width: 420px; position: relative; }
.form__eyebrow {
  font-family: var(--font-pix);
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--ink-muted);
}
.form__title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 300;
  font-size: 60px;
  letter-spacing: -0.02em;
  line-height: 1;
  margin: 14px 0 16px;
}
.form__hint {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--ink-muted);
  text-transform: uppercase;
  margin-bottom: 28px;
  line-height: 1.8;
}
.form__fields { display: flex; flex-direction: column; gap: 18px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field__label {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}
.check {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.16em;
  color: var(--ink-muted);
  text-transform: uppercase;
}
.form__submit {
  padding: 14px 22px;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.04em;
  margin-top: 8px;
}
.form__foot {
  font-family: var(--font-pix);
  font-size: 10px;
  letter-spacing: 0.18em;
  color: var(--ink-faint);
  text-transform: uppercase;
  margin-top: 22px;
  padding-top: 14px;
  border-top: 1px solid var(--rule-soft);
}

@media (max-width: 980px) {
  .login { grid-template-columns: 1fr; }
  .login__cover { padding: 36px 28px; min-height: auto; }
  .login__form { padding: 36px 28px 56px; }
  .cover__body { grid-template-columns: 1fr; gap: 16px; }
}
</style>