import { Building2, Plus } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { formatINR } from '@/utils/format'
import { haptic } from '@/utils/haptics'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'
import { sumBy } from '@/utils/calc'

export function SiteSwitcher() {
  const { sites, currentSiteId, setCurrentSiteId } = useApp()
  const { openSheet, closeSheet } = useUI()
  const expenses = useLiveQuery(() => db.expenses.toArray(), []) ?? []

  return (
    <div className="px-4 pb-6">
      <div className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-[var(--tertiary)]">
        Your Sites
      </div>
      <div className="space-y-2">
        {sites.map((site) => {
          const spent = sumBy(
            expenses.filter((e) => e.siteId === site.id),
            (e) => e.amount,
          )
          const active = site.id === currentSiteId
          return (
            <button
              key={site.id}
              type="button"
              onClick={() => {
                void setCurrentSiteId(site.id)
                haptic('light')
                closeSheet()
              }}
              className="flex w-full items-center gap-3 rounded-[16px] bg-[var(--fill)] px-4 py-3 text-left"
              style={active ? { outline: '2px solid var(--accent)' } : undefined}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <Building2 size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[16px] font-semibold">{site.name}</div>
                <div className="text-[13px] text-[var(--secondary)]">{formatINR(spent)} spent</div>
              </div>
            </button>
          )
        })}
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-[var(--fill)] text-[15px] font-semibold text-[var(--accent)]"
          onClick={() => openSheet({ name: 'site-form' })}
        >
          <Plus size={18} /> Add New Site
        </button>
      </div>
    </div>
  )
}
