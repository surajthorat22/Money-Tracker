import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { Card, Stat } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { db } from '@/db/db'
import { otherExpenses, sumBy, totalsThisMonth } from '@/utils/calc'
import { formatDateShort } from '@/utils/dates'
import { formatINR } from '@/utils/format'
import type { Expense } from '@/types'

export function ExpensesPage() {
  const { categories, vendors, sites } = useApp()
  const { openSheet, undoExpense } = useUI()
  const expenses = useLiveQuery(() => db.expenses.toArray(), []) ?? []
  const incomes = useLiveQuery(() => db.incomes.toArray(), []) ?? []

  const income = sumBy(incomes, (i) => i.amount)
  const spent = sumBy(expenses, (e) => e.amount)
  const other = sumBy(otherExpenses(expenses), (e) => e.amount)
  const onSites = spent - other
  const left = income - spent
  const month = totalsThisMonth(expenses)

  const bySite = useMemo(() => {
    return sites
      .map((site) => ({
        site,
        total: sumBy(
          expenses.filter((e) => e.siteId === site.id),
          (e) => e.amount,
        ),
      }))
      .filter((row) => row.total > 0)
      .sort((a, b) => b.total - a.total)
  }, [sites, expenses])

  const grouped = useMemo(() => {
    const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    const map = new Map<string, Expense[]>()
    for (const e of sorted) {
      const list = map.get(e.date) ?? []
      list.push(e)
      map.set(e.date, list)
    }
    return [...map.entries()]
  }, [expenses])

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[13px] text-[var(--secondary)]">Left from income</div>
          <div className={`tabular text-[32px] font-semibold tracking-tight ${left < 0 ? 'text-[var(--expense)]' : ''}`}>
            {formatINR(left)}
          </div>
        </div>
        <button
          type="button"
          className="h-10 rounded-lg bg-[var(--accent)] px-4 text-[14px] font-semibold text-[var(--on-accent)]"
          onClick={() => openSheet({ name: 'expense' })}
        >
          Add expense
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Card>
          <Stat label="Income" value={formatINR(income)} tone="income" />
        </Card>
        <Card>
          <Stat label="Site spending" value={formatINR(onSites)} tone="expense" />
        </Card>
        <Card>
          <Stat label="Other spending" value={formatINR(other)} tone="expense" />
        </Card>
        <Card>
          <Stat label="This month" value={formatINR(month)} />
        </Card>
      </div>

      {bySite.length > 0 && (
        <Card className="mt-3">
          <div className="mb-2 text-[13px] text-[var(--secondary)]">Spending by site</div>
          <div className="divide-y divide-[var(--separator)]">
            {bySite.map(({ site, total }) => (
              <div key={site.id} className="flex items-center justify-between py-2 text-[15px]">
                <span>{site.name}</span>
                <span className="tabular font-medium">{formatINR(total)}</span>
              </div>
            ))}
            {other > 0 && (
              <div className="flex items-center justify-between py-2 text-[15px]">
                <span>Other</span>
                <span className="tabular font-medium">{formatINR(other)}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      <h2 className="mt-6 text-[15px] font-semibold">All expenses</h2>
      {grouped.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          body="Add an expense and choose which site it belongs to. Use Other for spending that is not on a site."
          action="Add expense"
          onAction={() => openSheet({ name: 'expense' })}
        />
      ) : (
        <div className="mt-2 space-y-4">
          {grouped.map(([date, rows]) => (
            <section key={date}>
              <div className="mb-1 flex items-center justify-between text-[12px] text-[var(--secondary)]">
                <span>{formatDateShort(date)}</span>
                <span className="tabular">{formatINR(sumBy(rows, (e) => e.amount))}</span>
              </div>
              <div className="overflow-hidden rounded-xl border border-[var(--separator)] bg-[var(--card-solid)]">
                {rows.map((e) => {
                  const cat = categories.find((c) => c.id === e.categoryId)
                  const vendor = vendors.find((v) => v.id === e.vendorId)
                  const site = sites.find((s) => s.id === e.siteId)
                  return (
                    <div key={e.id} className="flex items-center gap-2 border-b border-[var(--separator)] px-3 py-2.5 last:border-b-0">
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => openSheet({ name: 'expense-detail', id: e.id })}
                      >
                        <div className="truncate text-[15px] font-medium">{cat?.name ?? 'Expense'}</div>
                        <div className="truncate text-[12px] text-[var(--secondary)]">
                          {site?.name ?? 'Other'}
                          {vendor ? ` · ${vendor.name}` : ''}
                        </div>
                      </button>
                      <div className="tabular text-[15px] font-semibold">{formatINR(e.amount)}</div>
                      <button type="button" className="text-[12px] text-[var(--secondary)]" onClick={() => void undoExpense(e)}>
                        Delete
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
