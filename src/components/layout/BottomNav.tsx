import { Filter, Settings, TrendingUp, Wallet } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'

const LINKS = [
  { to: '/', label: 'Expenses', icon: Wallet, end: true },
  { to: '/income', label: 'Income', icon: TrendingUp },
  { to: '/filter', label: 'Filter', icon: Filter },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--separator)] bg-[var(--bg-elevated)]">
      <div className="mx-auto grid max-w-5xl grid-cols-4">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={'end' in link ? link.end : false}
            className={({ isActive }) =>
              cn(
                'flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px]',
                isActive ? 'font-medium text-[var(--accent)]' : 'text-[var(--secondary)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <link.icon size={20} strokeWidth={isActive ? 2.2 : 1.7} />
                {link.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
