// 极简通知 — 不引第三方 UI 库，纯手写以匹配报纸风格

type ToastKind = 'success' | 'error' | 'info' | 'warning'

function ensureContainer(): HTMLDivElement {
  let el = document.getElementById('df-toast-host') as HTMLDivElement | null
  if (!el) {
    el = document.createElement('div')
    el.id = 'df-toast-host'
    Object.assign(el.style, {
      position: 'fixed',
      top: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '9999',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'none',
    } as CSSStyleDeclaration)
    document.body.appendChild(el)
  }
  return el
}

function toast(kind: ToastKind, message: string, duration = 2400) {
  const host = ensureContainer()
  const node = document.createElement('div')
  node.className = `df-toast df-toast--${kind}`
  Object.assign(node.style, {
    background: 'var(--ink)',
    color: 'var(--paper)',
    padding: '12px 22px',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    letterSpacing: '0.04em',
    border: '1px solid var(--ink)',
    borderLeftWidth: '4px',
    borderLeftColor:
      kind === 'success'
        ? 'var(--olive)'
        : kind === 'error'
          ? 'var(--signal)'
          : kind === 'warning'
            ? 'var(--amber)'
            : 'var(--press)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    pointerEvents: 'auto',
    opacity: '0',
    transform: 'translateY(-8px)',
    transition: 'opacity .2s var(--ease), transform .2s var(--ease)',
    maxWidth: '480px',
  } as CSSStyleDeclaration)
  node.textContent = message.toUpperCase()
  host.appendChild(node)
  requestAnimationFrame(() => {
    node.style.opacity = '1'
    node.style.transform = 'translateY(0)'
  })
  setTimeout(() => {
    node.style.opacity = '0'
    node.style.transform = 'translateY(-8px)'
    setTimeout(() => node.remove(), 220)
  }, duration)
}

export const ElMessage = {
  success: (m: string) => toast('success', m),
  error: (m: string) => toast('error', m),
  info: (m: string) => toast('info', m),
  warning: (m: string) => toast('warning', m),
}

// Promise 风格确认框
export function ElMessageBox(
  title: string,
  message: string,
  opts: { confirmText?: string; cancelText?: string; danger?: boolean } = {},
): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(20,17,15,0.55)',
      zIndex: '9998',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(2px)',
      animation: 'df-fade-in .15s var(--ease)',
    } as CSSStyleDeclaration)

    const dialog = document.createElement('div')
    Object.assign(dialog.style, {
      background: 'var(--paper)',
      color: 'var(--ink)',
      border: '2px solid var(--ink)',
      padding: '28px 32px',
      maxWidth: '440px',
      width: '90%',
      boxShadow: '8px 8px 0 var(--ink)',
      animation: 'df-pop-in .18s var(--ease)',
    } as CSSStyleDeclaration)

    const h = document.createElement('div')
    h.className = 'headline'
    h.style.fontSize = '24px'
    h.style.marginBottom = '8px'
    h.textContent = title

    const sub = document.createElement('div')
    sub.style.fontSize = '14px'
    sub.style.color = 'var(--ink-muted)'
    sub.style.marginBottom = '24px'
    sub.textContent = message

    const actions = document.createElement('div')
    actions.style.display = 'flex'
    actions.style.gap = '12px'
    actions.style.justifyContent = 'flex-end'

    const cancel = document.createElement('button')
    cancel.className = 'btn btn-sm'
    cancel.textContent = opts.cancelText || 'CANCEL'
    cancel.onclick = () => {
      cleanup()
      resolve(false)
    }

    const ok = document.createElement('button')
    ok.className = `btn btn-sm ${opts.danger ? 'btn-signal' : ''}`
    ok.textContent = opts.confirmText || 'CONFIRM'
    ok.onclick = () => {
      cleanup()
      resolve(true)
    }

    actions.append(cancel, ok)
    dialog.append(h, sub, actions)
    overlay.append(dialog)
    document.body.appendChild(overlay)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanup()
        resolve(false)
      }
    }
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cleanup()
        resolve(false)
      }
    })
    document.addEventListener('keydown', onKey)

    function cleanup() {
      overlay.remove()
      document.removeEventListener('keydown', onKey)
    }
  })
}

// 注入一次性动画 keyframes
if (typeof document !== 'undefined' && !document.getElementById('df-toast-keyframes')) {
  const s = document.createElement('style')
  s.id = 'df-toast-keyframes'
  s.textContent = `@keyframes df-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes df-pop-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`
  document.head.appendChild(s)
}