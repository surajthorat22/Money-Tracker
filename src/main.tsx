import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.tsx'
import { AppProvider } from '@/context/AppContext.tsx'
import { UIProvider } from '@/context/UIContext.tsx'
import { initDb } from '@/db/db.ts'
import { registerSW } from 'virtual:pwa-register'
import './index.css'

registerSW({ immediate: false })

function Splash() {
  return (
    <div
      className="app-frame flex h-full min-h-full flex-col items-center justify-center"
      style={{ background: 'var(--bg, #000)', height: '100%', minHeight: '100%' }}
    >
      <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--accent,#0a84ff)]">
        Plot Tracker
      </div>
    </div>
  )
}

function Root() {
  const [err, setErr] = useState<string | null>(null)
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    const setH = () => {
      const vv = window.visualViewport
      const h = Math.max(
        window.innerHeight,
        vv ? Math.round(vv.height + (vv.offsetTop || 0)) : 0,
      )
      const html = document.documentElement
      html.style.setProperty('--app-height', `${h}px`)
      html.style.height = `${h}px`
      document.body.style.height = `${h}px`
      const root = document.getElementById('root')
      if (root) {
        root.style.height = `${h}px`
        root.style.minHeight = `${h}px`
      }
    }
    setH()
    window.visualViewport?.addEventListener('resize', setH)
    window.addEventListener('resize', setH)
    void initDb()
      .then(() => setBooted(true))
      .catch((e: unknown) => {
        setErr(e instanceof Error ? e.message : 'Could not open local database')
        setBooted(true)
      })
    return () => {
      window.visualViewport?.removeEventListener('resize', setH)
      window.removeEventListener('resize', setH)
    }
  }, [])

  if (!booted) return <Splash />

  if (err) {
    return (
      <div className="app-frame flex h-full flex-col items-center justify-center px-8 text-center">
        <h1 className="text-[22px] font-semibold">Storage problem</h1>
        <p className="mt-2 text-[14px] text-[var(--secondary)]">{err}</p>
        <p className="mt-3 text-[13px] text-[var(--tertiary)]">
          Plot Tracker stores data on this device. If Safari data was cleared or IndexedDB is blocked, try reloading.
        </p>
        <button
          type="button"
          className="mt-6 h-12 rounded-[14px] bg-[var(--accent)] px-6 font-semibold text-[var(--on-accent)]"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    )
  }

  return (
    <div className="app-frame">
      <div className="flex h-full min-h-0 w-full flex-1 flex-col">
        <AppProvider>
          <UIProvider>
            <HashRouter>
              <App />
            </HashRouter>
          </UIProvider>
        </AppProvider>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
