import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { NamedIcon } from '@/components/ui/NamedIcon'
import { SwipeRow } from '@/components/ui/SwipeRow'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { db } from '@/db/db'
import { expenseRepo } from '@/db/repositories'
import { byCategory, otherExpenses, sumBy } from '@/utils/calc'
import { formatDateShort } from '@/utils/dates'
import { formatINR } from '@/utils/format'
import { haptic } from '@/utils/haptics'
import { Package } from 'lucide-react'

export function OtherPage() {
  const { categories, vendors } = useApp()
  const { openSheet, undoExpense } = useUI()
  const expensesAll = useLiveQuery(() => db.expenses.toArray(), []) ?? []
  const rows = useMemo(() => otherExpenses(expensesAll), [expensesAll])
  const total = sumBy(rows, (e) => e.amount)
  const breakdown = byCategory(rows, categories.filter((c) => c.type === 'other'))
  const sorted = [...rows].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="px-4">
      <div className="px-1">
        <div className="text-[13px] text-[var(--secondary)]">Non-site spending</div>
        <div className="tabular text-[36px] font-semibold tracking-tight">{formatINR(total)}</div>
        <p className="mt-1 text-[12px] text-[var(--tertiary)]">Not included in plot investment.</p>
      </div>

      {breakdown.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {breakdown.map((b) => (
            <Card key={b.category.id}>
              <div className="text-[13px] text-[var(--secondary)]">{b.category.name}</div>
              <div className="tabular mt-1 text-[18px] font-semibold">{formatINR(b.total)}</div>
            </Card>
          ))}
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState
          title="No other expenses"
          body="Track personal, office, and travel spend separately from the plot."
          action="+ Add"
          onAction={() => openSheet({ name: 'expense', other: true })}
          icon={<Package size={22} />}
        />
      ) : (
        <div className="mt-4 overflow-hidden rounded-[16px] bg-[var(--card-solid)]">
          {sorted.map((e) => {
            const cat = categories.find((c) => c.id === e.categoryId)
            const vendor = vendors.find((v) => v.id === e.vendorId)
            return (
              <SwipeRow
                key={e.id}
                onDuplicate={() => {
                  haptic('light')
                  void expenseRepo.add({
                    categoryId: e.categoryId,
                    amount: e.amount,
                    paymentMethod: e.paymentMethod,
                    date: e.date,
                    note: e.note,
                  })
                }}
                onDelete={() =>
                  openSheet({
                    name: 'confirm',
                    title: 'Delete expense?',
                    message: 'You can undo this for a few seconds.',
                    destructive: true,
                    onConfirm: () => void undoExpense(e),
                  })
                }
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  onClick={() => openSheet({ name: 'expense-detail', id: e.id })}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--fill)]">
                    <NamedIcon name={cat?.icon} size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{cat?.name ?? 'Other'}</span>
                      <span className="tabular font-semibold">{formatINR(e.amount)}</span>
                    </div>
                    <div className="text-[12px] text-[var(--secondary)]">
                      {formatDateShort(e.date)}
                      {vendor ? ` · ${vendor.name}` : ''}
                    </div>
                  </div>
                </button>
              </SwipeRow>
            )
          })}
        </div>
      )}
    </div>
  )
}
