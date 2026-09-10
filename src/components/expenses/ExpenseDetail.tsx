import { Copy, Pencil, Trash2 } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { db } from '@/db/db'
import { expenseRepo } from '@/db/repositories'
import { formatDateFull } from '@/utils/dates'
import { formatINR, formatQty } from '@/utils/format'
import { haptic } from '@/utils/haptics'

export function ExpenseDetail({ id }: { id: string }) {
  const { categories, vendors, sites } = useApp()
  const { openSheet, closeSheet, undoExpense } = useUI()
  const expense = useLiveQuery(() => db.expenses.get(id), [id])
  if (!expense) return <div className="px-5 py-8 text-[var(--secondary)]">Not found.</div>

  const cat = categories.find((c) => c.id === expense.categoryId)
  const vendor = vendors.find((v) => v.id === expense.vendorId)
  const site = sites.find((s) => s.id === expense.siteId)

  return (
    <div className="px-5 pb-6">
      <div className="tabular text-[34px] font-semibold tracking-tight">{formatINR(expense.amount)}</div>
      <div className="mt-1 text-[17px] font-medium">{cat?.name ?? 'Expense'}</div>
      <div className="mt-1 text-[14px] text-[var(--secondary)]">{formatDateFull(expense.date)}</div>
      <div className="mt-5 space-y-2 text-[15px]">
        {vendor && (
          <div className="flex justify-between">
            <span className="text-[var(--secondary)]">Vendor</span>
            <span>{vendor.name}</span>
          </div>
        )}
        {expense.paymentMethod && (
          <div className="flex justify-between">
            <span className="text-[var(--secondary)]">Payment</span>
            <span>{expense.paymentMethod}</span>
          </div>
        )}
        {site && (
          <div className="flex justify-between">
            <span className="text-[var(--secondary)]">Site</span>
            <span>{site.name}</span>
          </div>
        )}
        {expense.quantity != null && (
          <div className="flex justify-between">
            <span className="text-[var(--secondary)]">Quantity</span>
            <span>{formatQty(expense.quantity, expense.unit)}</span>
          </div>
        )}
        {expense.note && (
          <div>
            <div className="text-[var(--secondary)]">Note</div>
            <div className="mt-0.5">{expense.note}</div>
          </div>
        )}
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2">
        <Button
          variant="secondary"
          onClick={() => openSheet({ name: 'expense', expenseId: expense.id, other: !expense.siteId })}
        >
          <Pencil size={16} className="mr-1" /> Edit
        </Button>
        <Button
          variant="secondary"
          onClick={async () => {
            const copy = { ...expense }
            delete (copy as { id?: string }).id
            await expenseRepo.add({
              ...copy,
              date: expense.date,
            })
            haptic('success')
            closeSheet()
          }}
        >
          <Copy size={16} className="mr-1" /> Duplicate
        </Button>
        <Button
          variant="danger"
          onClick={() =>
            openSheet({
              name: 'confirm',
              title: 'Delete expense?',
              message: 'You can undo this for a few seconds.',
              destructive: true,
              onConfirm: () => {
                void undoExpense(expense)
                closeSheet()
              },
            })
          }
        >
          <Trash2 size={16} className="mr-1" /> Delete
        </Button>
      </div>
    </div>
  )
}
