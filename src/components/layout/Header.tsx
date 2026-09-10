import { ChevronDown, Search, Settings } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { haptic } from '@/utils/haptics'

const TITLES: Record<string, string> = {
  '/other': 'Other',
  '/settings': 'Settings',
  '/analytics': 'Analytics',
  '/search': 'Search',
  '/reports': 'Reports',
}

export function Header() {
  const { currentSite } = useApp()
  const { openSheet } = useUI()
  const nav = useNavigate()
  const loc = useLocation()
  const title = Object.keys(TITLES).find((k) => loc.pathname.startsWith(k) && k !== '/')
  const showSite = !title || loc.pathname.startsWith('/log') || loc.pathname.startsWith('/income') || loc.pathname === '/' || loc.pathname.startsWith('/analytics') || loc.pathname.startsWith('/category') || loc.pathname.startsWith('/vendor')

  return (
    <header
      className="z-20 flex shrink-0 items-center gap-2 px-4 pb-2"
      style={{ paddingTop: 'max(8px, env(safe-area-inset-top, 0px))' }}
    >
      <div className="min-w-0 flex-1">
        {showSite && !title ? (
          <button
            type="button"
            className="flex max-w-full items-center gap-1 text-left"
            onClick={() => {
              haptic('light')
              openSheet({ name: 'site-switcher' })
            }}
          >
            <span className="truncate text-[17px] font-semibold tracking-tight">
              {currentSite?.name ?? 'Select site'}
            </span>
            <ChevronDown size={18} className="shrink-0 text-[var(--secondary)]" />
          </button>
        ) : loc.pathname.startsWith('/log') || loc.pathname.startsWith('/income') ? (
          <button
            type="button"
            className="flex max-w-full items-center gap-1 text-left"
            onClick={() => {
              haptic('light')
              openSheet({ name: 'site-switcher' })
            }}
          >
            <span className="truncate text-[17px] font-semibold tracking-tight">
              {currentSite?.name ?? 'Select site'}
            </span>
            <ChevronDown size={18} className="shrink-0 text-[var(--secondary)]" />
          </button>
        ) : (
          <h1 className="truncate text-[17px] font-semibold">{TITLES[title ?? ''] ?? 'Plot Tracker'}</h1>
        )}
      </div>
      <button
        type="button"
        aria-label="Search"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--fill)]"
        onClick={() => nav('/search')}
      >
        <Search size={18} />
      </button>
      <button
        type="button"
        aria-label="Settings"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--fill)]"
        onClick={() => nav('/settings')}
      >
        <Settings size={18} />
      </button>
    </header>
  )
}
