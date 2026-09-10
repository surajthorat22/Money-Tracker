import { useNavigate } from 'react-router-dom'
import { Group, Row } from '@/components/ui/Row'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { siteRepo } from '@/db/repositories'
import { formatINR } from '@/utils/format'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'
import { sumBy } from '@/utils/calc'
import { ChevronLeft } from 'lucide-react'

export function SitesSettingsPage() {
  const { sites } = useApp()
  const { openSheet } = useUI()
  const expenses = useLiveQuery(() => db.expenses.toArray(), []) ?? []
  const nav = useNavigate()

  return (
    <div className="px-4">
      <Back onClick={() => nav('/settings')} label="Settings" />
      <h1 className="mb-3 text-[28px] font-semibold">Sites</h1>
      <Group>
        {sites.map((s) => {
          const spent = sumBy(expenses.filter((e) => e.siteId === s.id), (e) => e.amount)
          return (
            <Row
              key={s.id}
              label={s.name}
              subtitle={`${formatINR(spent)} spent${s.location ? ` · ${s.location}` : ''}`}
              onClick={() => openSheet({ name: 'site-form', siteId: s.id })}
            />
          )
        })}
      </Group>
      <button
        type="button"
        className="mt-4 h-12 w-full rounded-[14px] bg-[var(--fill)] font-semibold text-[var(--accent)]"
        onClick={() => openSheet({ name: 'site-form' })}
      >
        + Add Site
      </button>
      {sites.length > 0 && (
        <p className="mt-3 text-center text-[12px] text-[var(--tertiary)]">
          Delete a site from its edit sheet only after exporting a backup.
        </p>
      )}
      {sites.map((s) => (
        <button
          key={`del-${s.id}`}
          type="button"
          className="mt-2 w-full text-[13px] text-[var(--expense)]"
          onClick={() =>
            openSheet({
              name: 'confirm',
              title: `Delete ${s.name}?`,
              message: 'This removes the site and all of its expenses, income, and machine logs.',
              destructive: true,
              onConfirm: () => void siteRepo.remove(s.id),
            })
          }
        >
          Delete {s.name}
        </button>
      ))}
    </div>
  )
}

export function Back({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" className="mb-1 flex items-center gap-0.5 text-[15px] text-[var(--accent)]" onClick={onClick}>
      <ChevronLeft size={18} /> {label}
    </button>
  )
}
