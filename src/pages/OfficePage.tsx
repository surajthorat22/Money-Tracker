import { useLiveQuery } from 'dexie-react-hooks'
import { Card, Stat } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useUI } from '@/context/UIContext'
import { db } from '@/db/db'
import { sumBy } from '@/utils/calc'
import { formatDateShort } from '@/utils/dates'
import { formatINR } from '@/utils/format'

export function OfficePage() {
  const { openSheet } = useUI()
  const sends = useLiveQuery(() => db.officeSends.toArray(), []) ?? []
  const total = sumBy(sends, (s) => s.amount)
  const people = new Set(sends.map((s) => s.person.trim()).filter(Boolean)).size
  const sorted = [...sends].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[13px] text-[var(--secondary)]">Office sends</div>
          <div className="tabular text-[32px] font-semibold tracking-tight">{formatINR(total)}</div>
        </div>
        <button
          type="button"
          className="h-10 rounded-lg bg-[var(--accent)] px-4 text-[14px] font-semibold text-[var(--on-accent)]"
          onClick={() => openSheet({ name: 'office' })}
        >
          Add office
        </button>
      </div>
      <p className="mt-1 text-[13px] text-[var(--secondary)]">
        Money sent from the office to someone you are responsible for. Keep a record here; it does not come out of your income.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Card>
          <Stat label="People" value={String(people)} />
        </Card>
        <Card>
          <Stat label="Sends" value={String(sends.length)} />
        </Card>
      </div>

      <h2 className="mt-6 text-[15px] font-semibold">Track record</h2>
      {sorted.length === 0 ? (
        <EmptyState
          title="No office sends yet"
          body="Add money sent from the office to someone you are responsible for."
          action="Add office"
          onAction={() => openSheet({ name: 'office' })}
        />
      ) : (
        <div className="mt-2 overflow-hidden rounded-xl border border-[var(--separator)] bg-[var(--card-solid)]">
          {sorted.map((row) => (
            <button
              key={row.id}
              type="button"
              className="flex w-full items-center gap-2 border-b border-[var(--separator)] px-3 py-2.5 text-left last:border-b-0"
              onClick={() => openSheet({ name: 'office-detail', id: row.id })}
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium">{row.person}</div>
                <div className="text-[12px] text-[var(--secondary)]">
                  {formatDateShort(row.date)}
                  {row.paymentMethod ? ` · ${row.paymentMethod}` : ''}
                  {row.note ? ` · ${row.note}` : ''}
                </div>
              </div>
              <div className="tabular font-semibold">{formatINR(row.amount)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
