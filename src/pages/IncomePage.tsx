import { useLiveQuery } from 'dexie-react-hooks'
import { Card, Stat } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useUI } from '@/context/UIContext'
import { db } from '@/db/db'
import { otherExpenses, sumBy } from '@/utils/calc'
import { formatDateShort } from '@/utils/dates'
import { formatINR } from '@/utils/format'

export function IncomePage() {
  const { openSheet, undoIncome } = useUI()
  const incomes = useLiveQuery(() => db.incomes.toArray(), []) ?? []
  const expenses = useLiveQuery(() => db.expenses.toArray(), []) ?? []

  const received = sumBy(incomes, (i) => i.amount)
  const siteSpent = sumBy(
    expenses.filter((e) => e.siteId),
    (e) => e.amount,
  )
  const other = sumBy(otherExpenses(expenses), (e) => e.amount)
  const spent = siteSpent + other
  const left = received - spent
  const sorted = [...incomes].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[13px] text-[var(--secondary)]">Income</div>
          <div className="tabular text-[32px] font-semibold tracking-tight text-[var(--income)]">{formatINR(received)}</div>
        </div>
        <button
          type="button"
          className="h-10 rounded-lg bg-[var(--accent)] px-4 text-[14px] font-semibold text-[var(--on-accent)]"
          onClick={() => openSheet({ name: 'income' })}
        >
          Add income
        </button>
      </div>
      <p className="mt-1 text-[13px] text-[var(--secondary)]">One income total. Site spending and other spending both come out of it.</p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Card>
          <Stat label="Site spending" value={formatINR(siteSpent)} tone="expense" />
        </Card>
        <Card>
          <Stat label="Other spending" value={formatINR(other)} tone="expense" />
        </Card>
        <Card>
          <Stat label="Total spent" value={formatINR(spent)} tone="expense" />
        </Card>
        <Card>
          <Stat label="Left" value={formatINR(left)} tone={left >= 0 ? 'income' : 'expense'} />
        </Card>
      </div>

      <h2 className="mt-6 text-[15px] font-semibold">Entries</h2>
      {sorted.length === 0 ? (
        <EmptyState
          title="No income yet"
          body="Add money from the office, then spend it across your sites."
          action="Add income"
          onAction={() => openSheet({ name: 'income' })}
        />
      ) : (
        <div className="mt-2 overflow-hidden rounded-xl border border-[var(--separator)] bg-[var(--card-solid)]">
          {sorted.map((i) => (
            <div key={i.id} className="flex items-center gap-2 border-b border-[var(--separator)] px-3 py-2.5 last:border-b-0">
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => openSheet({ name: 'income-detail', id: i.id })}>
                <div className="font-medium">{i.source}</div>
                <div className="text-[12px] text-[var(--secondary)]">
                  {formatDateShort(i.date)}
                  {i.paymentMethod ? ` · ${i.paymentMethod}` : ''}
                  {i.note ? ` · ${i.note}` : ''}
                </div>
              </button>
              <div className="tabular font-semibold text-[var(--income)]">{formatINR(i.amount)}</div>
              <button type="button" className="text-[12px] text-[var(--secondary)]" onClick={() => void undoIncome(i)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
