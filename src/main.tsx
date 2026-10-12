import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.tsx'
import { AppProvider } from '@/context/AppContext.tsx'
import { UIProvider } from '@/context/UIContext.tsx'
import { initDb } from '@/db/db.ts'
import './index.css'

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

  if (!booted) {
    return <div className="flex min-h-screen items-center justify-center text-[var(--secondary)]">Money Tracker</div>
  }

  if (err) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="text-[22px] font-semibold">Storage problem</h1>
        <p className="mt-2 text-[14px] text-[var(--secondary)]">{err}</p>
        <button
          type="button"
          className="mt-6 h-11 rounded-lg bg-[var(--accent)] px-6 font-semibold text-[var(--on-accent)]"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    )
  }

  return (
    <AppProvider>
      <UIProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </UIProvider>
    </AppProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
