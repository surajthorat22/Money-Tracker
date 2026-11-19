import { Briefcase, Filter, Settings, TrendingUp, Wallet } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'

const LINKS = [
  { to: '/', label: 'Expenses', icon: Wallet, end: true },
  { to: '/income', label: 'Income', icon: TrendingUp },
  { to: '/office', label: 'Office', icon: Briefcase },
  { to: '/filter', label: 'Filter', icon: Filter },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

export function BottomNav() {
  return (
    <nav className="fixed inset-x-[10px] bottom-[10px] z-20 overflow-hidden rounded-2xl border border-[var(--separator)] bg-[var(--bg-elevated)] shadow-[var(--shadow)]">
      <div className="mx-auto grid max-w-5xl grid-cols-5">
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
