import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { Card, Stat } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { db } from '@/db/db'
import { cashFlow, siteExpenses, sumBy } from '@/utils/calc'
import { formatDateShort } from '@/utils/dates'
import { formatINR } from '@/utils/format'
import { TrendingUp } from 'lucide-react'

export function IncomePage() {
  const { currentSiteId, currentSite } = useApp()
  const { openSheet, undoIncome } = useUI()
  const incomesAll = useLiveQuery(() => db.incomes.toArray(), []) ?? []
  const expensesAll = useLiveQuery(() => db.expenses.toArray(), []) ?? []

  const siteIncome = incomesAll.filter((i) => i.siteId === currentSiteId)
  const general = incomesAll.filter((i) => !i.siteId)
  const expenses = siteExpenses(expensesAll, currentSiteId)
  const flow = cashFlow(siteIncome, expenses)
  const generalTotal = sumBy(general, (i) => i.amount)

  const byMonth = useMemo(() => {
    const map = new Map<string, number>()
    for (const i of siteIncome) {
      const k = i.date.slice(5, 7)
      map.set(k, (map.get(k) ?? 0) + i.amount)
    }
    return [...map.entries()].map(([month, total]) => ({ month, total }))
  }, [siteIncome])

  const sorted = [...siteIncome].sort((a, b) => b.date.localeCompare(a.date))

  if (!currentSite) {
    return (
      <EmptyState
        title="Select a site"
        body="Income can be linked to a plot or kept general."
        action="Your Sites"
        onAction={() => openSheet({ name: 'site-switcher' })}
      />
    )
  }

  return (
    <div className="px-4 pb-4">
      <div className="flex items-end justify-between px-1">
        <div>
          <div className="text-[13px] text-[var(--secondary)]">Money Received</div>
          <div className="tabular text-[32px] font-semibold tracking-tight text-[var(--income)]">
            {formatINR(flow.received)}
          </div>
        </div>
        <button
          type="button"
          className="mb-1 h-10 shrink-0 rounded-full bg-[var(--accent)] px-4 text-[14px] font-semibold text-[var(--on-accent)]"
          onClick={() => openSheet({ name: 'income' })}
        >
          + Add Income
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Card>
          <Stat label="Spent" value={formatINR(flow.spent)} tone="expense" />
        </Card>
        <Card>
          <Stat label="Balance" value={formatINR(flow.balance)} tone={flow.balance >= 0 ? 'income' : 'expense'} />
        </Card>
      </div>

      {byMonth.length > 0 && (
        <Card className="mt-3">
          <div className="mb-2 text-[13px] text-[var(--secondary)]">Cash flow</div>
          <div className="flex h-24 items-end gap-2">
            {byMonth.map((m) => {
              const max = Math.max(...byMonth.map((x) => x.total), 1)
              return (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-[var(--accent)]"
                    style={{ height: `${Math.max(8, (m.total / max) * 100)}%` }}
                  />
                  <div className="text-[10px] text-[var(--tertiary)]">{m.month}</div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {generalTotal > 0 && (
        <Card className="mt-3">
          <div className="text-[13px] text-[var(--secondary)]">General income (no site)</div>
          <div className="tabular text-[18px] font-semibold">{formatINR(generalTotal)}</div>
        </Card>
      )}

      <h2 className="mt-5 text-[15px] font-semibold">Entries</h2>
      {sorted.length === 0 && general.length === 0 ? (
        <EmptyState
          title="No income yet"
          body="Log money received from office, partners, or friends."
          action="+ Add Income"
          onAction={() => openSheet({ name: 'income' })}
          icon={<TrendingUp size={22} />}
        />
      ) : (
        <div className="mt-2 overflow-hidden rounded-[16px] bg-[var(--card-solid)]">
          {[...sorted, ...general].map((i) => (
            <button
              key={i.id}
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left"
              onClick={() => openSheet({ name: 'income-detail', id: i.id })}
              onContextMenu={(e) => {
                e.preventDefault()
                void undoIncome(i)
              }}
            >
              <div>
                <div className="font-medium">{i.source}</div>
                <div className="text-[12px] text-[var(--secondary)]">
                  {formatDateShort(i.date)} · {i.siteId ? currentSite.name : 'General'} · {i.paymentMethod ?? '—'}
                </div>
              </div>
              <div className="tabular font-semibold text-[var(--income)]">{formatINR(i.amount)}</div>
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        className="pressable mt-4 flex h-12 w-full items-center justify-center rounded-[14px] bg-[var(--accent)] text-[16px] font-semibold text-[var(--on-accent)]"
        onClick={() => openSheet({ name: 'income' })}
      >
        + Add Income
      </button>
    </div>
  )
}
