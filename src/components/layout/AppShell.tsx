import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { SheetHost } from '@/components/layout/SheetHost'
import { FAB } from '@/components/ui/FAB'
import { ToastHost } from '@/components/ui/Toast'
import { useUI } from '@/context/UIContext'

export function AppShell() {
  const loc = useLocation()
  const { openSheet } = useUI()
  const hideFab =
    loc.pathname.startsWith('/settings') ||
    loc.pathname.startsWith('/search') ||
    loc.pathname.startsWith('/analytics') ||
    loc.pathname.startsWith('/reports')

  const onFab = () => {
    if (loc.pathname.startsWith('/log')) openSheet({ name: 'log' })
    else if (loc.pathname.startsWith('/other')) openSheet({ name: 'expense', other: true })
    else if (loc.pathname.startsWith('/income')) openSheet({ name: 'income' })
    else openSheet({ name: 'expense' })
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <Header />
      <main
        className="no-scrollbar flex-1 overflow-y-auto"
        style={{
          paddingBottom: hideFab
            ? 'calc(70px + env(safe-area-inset-bottom))'
            : 'calc(150px + env(safe-area-inset-bottom))',
        }}
      >
        <Outlet />
      </main>
      {!hideFab && <FAB onClick={onFab} />}
      <BottomNav />
      <SheetHost />
      <ToastHost />
    </div>
  )
}
