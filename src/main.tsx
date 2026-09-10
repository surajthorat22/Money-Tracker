import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.tsx'
import { AppProvider } from '@/context/AppContext.tsx'
import { UIProvider } from '@/context/UIContext.tsx'
import { initDb } from '@/db/db.ts'
import { registerSW } from 'virtual:pwa-register'
import './index.css'

registerSW({ immediate: true })

function Root() {
  const [err, setErr] = useState<string | null>(null)
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    void initDb()
      .then(() => setBooted(true))
      .catch((e: unknown) => {
        setErr(e instanceof Error ? e.message : 'Could not open local database')
        setBooted(true)
      })
  }, [])

  if (!booted) return null

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
      <AppProvider>
        <UIProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </UIProvider>
      </AppProvider>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
