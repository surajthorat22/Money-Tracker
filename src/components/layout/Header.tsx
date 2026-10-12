import { NavLink } from 'react-router-dom'

export function Header() {
  return (
    <header className="border-b border-[var(--separator)] bg-[var(--bg-elevated)]">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <NavLink to="/" className="text-[16px] font-semibold tracking-tight">
          Money Tracker
        </NavLink>
      </div>
    </header>
  )
}
