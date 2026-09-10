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
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <Header />
      <main
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto"
        style={{ paddingBottom: hideFab ? 16 : 88 }}
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
