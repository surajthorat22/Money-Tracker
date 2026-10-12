import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { db } from '@/db/db'
import { sumBy } from '@/utils/calc'
import { formatDateShort } from '@/utils/dates'
import { formatINR } from '@/utils/format'

const field = 'h-10 w-full rounded-lg border border-[var(--separator)] bg-[var(--bg-elevated)] px-3 text-[14px] outline-none'

export function FilterPage() {
  const { categories, vendors, sites } = useApp()
  const { openSheet } = useUI()
  const expenses = useLiveQuery(() => db.expenses.toArray(), []) ?? []
  const [categoryId, setCategoryId] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [siteId, setSiteId] = useState('all')

  const rows = useMemo(() => {
    return expenses
      .filter((e) => {
        if (categoryId && e.categoryId !== categoryId) return false
        if (vendorId && e.vendorId !== vendorId) return false
        if (siteId === 'other' && e.siteId) return false
        if (siteId !== 'all' && siteId !== 'other' && e.siteId !== siteId) return false
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  }, [expenses, categoryId, vendorId, siteId])

  return (
    <div>
      <h1 className="text-[22px] font-semibold">Filter expenses</h1>
      <p className="mt-1 text-[13px] text-[var(--secondary)]">Narrow the list by category, vendor, and site.</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <label className="text-[13px] text-[var(--secondary)]">
          Category
          <select className={`${field} mt-1`} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[13px] text-[var(--secondary)]">
          Vendor
          <select className={`${field} mt-1`} value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
            <option value="">All vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[13px] text-[var(--secondary)]">
          Site
          <select className={`${field} mt-1`} value={siteId} onChange={(e) => setSiteId(e.target.value)}>
            <option value="all">All sites</option>
            <option value="other">Other</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-[13px] text-[var(--secondary)]">{rows.length} expenses</div>
        <div className="tabular text-[20px] font-semibold">{formatINR(sumBy(rows, (e) => e.amount))}</div>
      </div>

      <div className="mt-2 overflow-hidden rounded-xl border border-[var(--separator)] bg-[var(--card-solid)]">
        {rows.length === 0 && <p className="px-4 py-8 text-center text-[14px] text-[var(--secondary)]">Nothing matches these filters.</p>}
        {rows.map((e) => {
          const cat = categories.find((c) => c.id === e.categoryId)
          const vendor = vendors.find((v) => v.id === e.vendorId)
          const site = sites.find((s) => s.id === e.siteId)
          return (
            <button
              key={e.id}
              type="button"
              className="flex w-full items-center justify-between gap-3 border-b border-[var(--separator)] px-3 py-2.5 text-left last:border-b-0"
              onClick={() => openSheet({ name: 'expense-detail', id: e.id })}
            >
              <div className="min-w-0">
                <div className="truncate font-medium">{cat?.name ?? 'Expense'}</div>
                <div className="truncate text-[12px] text-[var(--secondary)]">
                  {formatDateShort(e.date)} · {site?.name ?? 'Other'}
                  {vendor ? ` · ${vendor.name}` : ''}
                </div>
              </div>
              <div className="tabular shrink-0 font-semibold">{formatINR(e.amount)}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
