import { Gauge, Package, TrendingUp, Wallet } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { haptic } from '@/utils/haptics'

const TABS = [
  { to: '/', label: 'Expenses', icon: Wallet, end: true },
  { to: '/log', label: 'Log', icon: Gauge },
  { to: '/other', label: 'Other', icon: Package },
  { to: '/income', label: 'Income', icon: TrendingUp },
] as const

export function BottomNav() {
  return (
    <nav
      className="glass absolute inset-x-0 bottom-0 z-20 border-t border-[var(--hairline)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-4">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={'end' in tab ? tab.end : false}
            onClick={() => haptic('light')}
            className={({ isActive }) =>
              cn(
                'flex min-h-[49px] flex-col items-center justify-center gap-0.5 text-[10px] font-medium',
                isActive ? 'text-[var(--accent)]' : 'text-[var(--tertiary)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon size={22} strokeWidth={isActive ? 2.2 : 1.7} />
                {tab.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
