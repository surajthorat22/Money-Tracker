import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { SheetHost } from '@/components/layout/SheetHost'
import { ToastHost } from '@/components/ui/Toast'

export function AppShell() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--label)]">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-24">
        <Outlet />
      </main>
      <BottomNav />
      <SheetHost />
      <ToastHost />
    </div>
  )
}
