import { useNavigate } from 'react-router-dom'
import { Group, Row } from '@/components/ui/Row'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { vendorRepo } from '@/db/repositories'
import { Back } from '@/pages/SitesSettingsPage'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'
import { formatINR } from '@/utils/format'

export function VendorsSettingsPage() {
  const { vendors } = useApp()
  const { openSheet } = useUI()
  const nav = useNavigate()
  const expenses = useLiveQuery(() => db.expenses.toArray(), []) ?? []

  return (
    <div className="px-4">
      <Back onClick={() => nav('/settings')} label="Settings" />
      <h1 className="mb-3 text-[28px] font-semibold">Vendors</h1>
      <Group>
        {vendors.length === 0 && <Row label="No vendors yet" subtitle="They appear when you type a name on an expense." />}
        {vendors.map((v) => {
          const list = expenses.filter((e) => e.vendorId === v.id)
          const total = list.reduce((a, e) => a + e.amount, 0)
          return (
            <Row
              key={v.id}
              label={v.name}
              subtitle={`${formatINR(total)} · ${list.length} payments`}
              onClick={() => nav(`/vendor/${v.id}`)}
              trailing={
                <button
                  type="button"
                  className="text-[12px] text-[var(--expense)]"
                  onClick={(e) => {
                    e.stopPropagation()
                    openSheet({
                      name: 'confirm',
                      title: `Delete ${v.name}?`,
                      message: 'Past expenses stay, but the vendor name is removed.',
                      destructive: true,
                      onConfirm: () => void vendorRepo.remove(v.id),
                    })
                  }}
                >
                  Delete
                </button>
              }
            />
          )
        })}
      </Group>
      <button
        type="button"
        className="mt-4 h-12 w-full rounded-[14px] bg-[var(--fill)] font-semibold text-[var(--accent)]"
        onClick={() => openSheet({ name: 'vendor-form' })}
      >
        + Add Vendor
      </button>
    </div>
  )
}
