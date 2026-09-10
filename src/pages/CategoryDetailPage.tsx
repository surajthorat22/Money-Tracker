import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { db } from '@/db/db'
import { materialStats, siteExpenses } from '@/utils/calc'
import { formatDateFull } from '@/utils/dates'
import { formatINR, formatQty, formatRate } from '@/utils/format'
import { Back } from '@/pages/SitesSettingsPage'

export function CategoryDetailPage() {
  const { id } = useParams()
  const { categories, currentSiteId, vendors } = useApp()
  const { openSheet } = useUI()
  const nav = useNavigate()
  const category = categories.find((c) => c.id === id)
  const expensesAll = useLiveQuery(() => db.expenses.toArray(), []) ?? []
  const expenses = (category?.type === 'other' ? expensesAll.filter((e) => e.categoryId === id) : siteExpenses(expensesAll, currentSiteId).filter((e) => e.categoryId === id)).sort((a, b) => b.date.localeCompare(a.date))
  if (!category) return <EmptyState title="Category not found" body="" />
  const stats = materialStats(expenses, category.id)

  return (
    <div className="px-4 pb-8">
      <Back onClick={() => nav(-1)} label="Back" />
      <h1 className="text-[28px] font-semibold">{category.name}</h1>
      <Card className="mt-3">
        {stats.qty > 0 && (
          <>
            <div className="text-[12px] text-[var(--secondary)]">Total purchased</div>
            <div className="text-[22px] font-semibold">{formatQty(stats.qty, stats.unit)}</div>
          </>
        )}
        <div className="mt-2 text-[12px] text-[var(--secondary)]">Spent</div>
        <div className="tabular text-[22px] font-semibold">{formatINR(stats.spent)}</div>
        {stats.qty > 0 && (
          <div className="mt-2 text-[13px] text-[var(--secondary)]">Average {formatRate(stats.avg, stats.unit)}</div>
        )}
        <div className="mt-3 grid grid-cols-3 gap-2 text-[12px] text-[var(--secondary)]">
          <div>Purchases<div className="text-[15px] font-semibold text-[var(--label)]">{stats.purchases}</div></div>
          <div>First<div className="text-[13px] font-semibold text-[var(--label)]">{stats.first ? formatDateFull(stats.first) : '—'}</div></div>
          <div>Last<div className="text-[13px] font-semibold text-[var(--label)]">{stats.last ? formatDateFull(stats.last) : '—'}</div></div>
        </div>
      </Card>
      <h2 className="mt-5 text-[15px] font-semibold">Purchases</h2>
      <div className="mt-2 overflow-hidden rounded-[16px] bg-[var(--card-solid)]">
        {expenses.map((e) => {
          const vendor = vendors.find((v) => v.id === e.vendorId)
          return (
            <button key={e.id} type="button" className="flex w-full justify-between px-4 py-3 text-left" onClick={() => openSheet({ name: 'expense-detail', id: e.id })}>
              <div>
                <div className="text-[15px]">{formatDateFull(e.date)}</div>
                <div className="text-[12px] text-[var(--secondary)]">
                  {vendor?.name ?? '—'}
                  {e.quantity != null ? ` · ${formatQty(e.quantity, e.unit)}` : ''}
                </div>
              </div>
              <div className="tabular font-semibold">{formatINR(e.amount)}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
