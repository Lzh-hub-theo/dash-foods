/**
 * dash-foods · 轻量消息提示（不引入 UI 库）
 * 后续若引入 Element Plus / Naive UI，可在这里替换。
 */
type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastOpts {
  type: ToastType
  text: string
  duration?: number
}

let host: HTMLDivElement | null = null

function ensureHost() {
  if (host) return host
  host = document.createElement('div')
  host.className = 'dash-toast-host'
  Object.assign(host.style, {
    position: 'fixed',
    top: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    zIndex: '9999',
    pointerEvents: 'none',
  })
  document.body.appendChild(host)
  return host
}

export function ElMessage(opts: ToastOpts) {
  const root = ensureHost()
  const el = document.createElement('div')
  const palette: Record<ToastType, { bg: string; bd: string; fg: string }> = {
    success: { bg: '#F0F7EE', bd: '#3F6B3A', fg: '#2F5230' },
    error: { bg: '#FCEDEB', bd: '#D9534F', fg: '#B03A37' },
    info: { bg: '#FFFEFA', bd: '#E5DFD0', fg: '#1F2A1D' },
    warning: { bg: '#FFF6E2', bd: '#E0A93B', fg: '#8A6312' },
  }
  const c = palette[opts.type]
  Object.assign(el.style, {
    background: c.bg,
    color: c.fg,
    border: `1px solid ${c.bd}`,
    padding: '12px 18px',
    borderRadius: '999px',
    fontFamily: 'Manrope, system-ui, sans-serif',
    fontSize: '14px',
    fontWeight: '500',
    letterSpacing: '0.02em',
    boxShadow: '0 8px 24px -8px rgba(31,42,29,0.18)',
    pointerEvents: 'auto',
    opacity: '0',
    transform: 'translateY(-8px)',
    transition: 'opacity 240ms ease, transform 320ms cubic-bezier(0.34,1.56,0.64,1)',
  })
  el.textContent = opts.text
  root.appendChild(el)
  requestAnimationFrame(() => {
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
  })
  const dur = opts.duration ?? 2400
  setTimeout(() => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(-8px)'
    setTimeout(() => el.remove(), 280)
  }, dur)
}

interface BoxOpts {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
}

let overlay: HTMLDivElement | null = null

function ensureOverlay() {
  if (overlay) return overlay
  overlay = document.createElement('div')
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(31, 42, 29, 0.32)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '9998',
    opacity: '0',
    transition: 'opacity 200ms ease',
  })
  document.body.appendChild(overlay)
  return overlay
}

/**
 * dash·foods 极简确认弹窗（Promise 风格：resolve true / reject false）
 */
export function ElMessageBox(opts: BoxOpts): Promise<boolean> {
  return new Promise((resolve) => {
    const root = ensureOverlay()
    const card = document.createElement('div')
    Object.assign(card.style, {
      background: '#FFFEF A',
      borderRadius: '20px',
      padding: '28px 28px 20px',
      width: 'min(420px, 92vw)',
      boxShadow: '0 20px 60px -16px rgba(31, 42, 29, 0.28)',
      transform: 'translateY(8px) scale(0.98)',
      transition: 'transform 240ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      fontFamily: 'Manrope, system-ui, sans-serif',
    })
    card.style.background = '#FFFEFA'
    card.innerHTML = `
      <div style="font-family:Fraunces, Georgia, serif; font-size:20px; font-weight:500; color:#1F2A1D; margin-bottom:8px;">${opts.title ?? '提示'}</div>
      <div style="font-size:14px; line-height:1.65; color:#4A5C46; white-space:pre-wrap;">${opts.message}</div>
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button data-act="cancel" style="padding:9px 18px; border-radius:999px; border:1.5px solid #E5DFD0; background:#FFFEFA; color:#1F2A1D; font-size:13px; font-weight:500; cursor:pointer;">${opts.cancelText ?? '取消'}</button>
        <button data-act="ok" style="padding:9px 22px; border-radius:999px; border:none; background:#1F2A1D; color:#FFFEFA; font-size:13px; font-weight:600; cursor:pointer;">${opts.confirmText ?? '确认'}</button>
      </div>
    `
    root.appendChild(card)
    requestAnimationFrame(() => {
      root.style.opacity = '1'
      card.style.transform = 'translateY(0) scale(1)'
    })
    function close(result: boolean) {
      card.style.transform = 'translateY(8px) scale(0.98)'
      root.style.opacity = '0'
      setTimeout(() => {
        card.remove()
        if (!root.childElementCount) {
          root.remove()
          overlay = null
        }
      }, 240)
      resolve(result)
    }
    card.querySelector('[data-act="cancel"]')?.addEventListener('click', () => close(false))
    card.querySelector('[data-act="ok"]')?.addEventListener('click', () => close(true))
    root.addEventListener('click', (e) => {
      if (e.target === root) close(false)
    })
  })
}