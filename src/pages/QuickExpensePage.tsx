import { ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { SheetHost } from '@/components/layout/SheetHost'
import { ToastHost } from '@/components/ui/Toast'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { haptic } from '@/utils/haptics'

export function QuickExpensePage() {
  const { currentSite } = useApp()
  const { openSheet } = useUI()
  const nav = useNavigate()

  return (
    <div className="relative flex min-h-dvh flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <header className="flex items-center justify-between px-4 py-2">
        <button
          type="button"
          className="flex items-center gap-1 text-[15px] font-semibold"
          onClick={() => {
            haptic('light')
            openSheet({ name: 'site-switcher' })
          }}
        >
          {currentSite?.name ?? 'Select site'}
          <ChevronDown size={16} />
        </button>
        <button type="button" className="text-[15px] font-medium text-[var(--accent)]" onClick={() => nav('/')}>
          Done
        </button>
      </header>
      <div className="flex-1">
        <ExpenseForm
          variant="page"
          onSaved={() => {
            nav('/')
          }}
        />
      </div>
      <SheetHost />
      <ToastHost />
    </div>
  )
}
