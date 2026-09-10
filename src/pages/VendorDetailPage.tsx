import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { db } from '@/db/db'
import { formatDateFull } from '@/utils/dates'
import { formatINR } from '@/utils/format'
import { Back } from '@/pages/SitesSettingsPage'

export function VendorDetailPage() {
  const { id } = useParams()
  const { vendors, categories, sites } = useApp()
  const { openSheet } = useUI()
  const nav = useNavigate()
  const vendor = vendors.find((v) => v.id === id)
  const expenses = useLiveQuery(
    () => (id ? db.expenses.where('vendorId').equals(id).toArray() : []),
    [id],
  ) ?? []
  if (!vendor) return <EmptyState title="Vendor not found" body="" />
  const sorted = [...expenses].sort((a, b) => a.date.localeCompare(b.date))
  const total = expenses.reduce((a, e) => a + e.amount, 0)
  const cats = [...new Set(expenses.map((e) => categories.find((c) => c.id === e.categoryId)?.name).filter(Boolean))]

  return (
    <div className="px-4 pb-8">
      <Back onClick={() => nav(-1)} label="Back" />
      <div className="flex items-start justify-between">
        <h1 className="text-[28px] font-semibold">{vendor.name}</h1>
        <button type="button" className="text-[14px] text-[var(--accent)]" onClick={() => openSheet({ name: 'vendor-form', vendorId: vendor.id })}>
          Edit
        </button>
      </div>
      <Card className="mt-3">
        <div className="text-[12px] text-[var(--secondary)]">Total paid</div>
        <div className="tabular text-[26px] font-semibold">{formatINR(total)}</div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] text-[var(--secondary)]">
          <div>Transactions<div className="text-[16px] font-semibold text-[var(--label)]">{expenses.length}</div></div>
          <div>Categories<div className="text-[13px] font-semibold text-[var(--label)]">{cats.join(', ') || '—'}</div></div>
          <div>First<div className="font-semibold text-[var(--label)]">{sorted[0] ? formatDateFull(sorted[0].date) : '—'}</div></div>
          <div>Last<div className="font-semibold text-[var(--label)]">{sorted[sorted.length - 1] ? formatDateFull(sorted[sorted.length - 1].date) : '—'}</div></div>
        </div>
      </Card>
      <h2 className="mt-5 text-[15px] font-semibold">Payments</h2>
      <div className="mt-2 overflow-hidden rounded-[16px] bg-[var(--card-solid)]">
        {[...sorted].reverse().map((e) => (
          <button key={e.id} type="button" className="flex w-full justify-between px-4 py-3 text-left" onClick={() => openSheet({ name: 'expense-detail', id: e.id })}>
            <div>
              <div className="text-[15px]">{categories.find((c) => c.id === e.categoryId)?.name}</div>
              <div className="text-[12px] text-[var(--secondary)]">
                {formatDateFull(e.date)} · {sites.find((s) => s.id === e.siteId)?.name ?? 'Other'}
              </div>
            </div>
            <div className="tabular font-semibold">{formatINR(e.amount)}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
