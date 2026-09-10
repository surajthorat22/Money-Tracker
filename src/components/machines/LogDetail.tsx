import { Pencil, Trash2 } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { db } from '@/db/db'
import { formatDateFull } from '@/utils/dates'
import { formatINR } from '@/utils/format'

export function LogDetail({ id }: { id: string }) {
  const { machines } = useApp()
  const { openSheet, closeSheet, undoLog } = useUI()
  const row = useLiveQuery(() => db.machineLogs.get(id), [id])
  const expense = useLiveQuery(
    () => (row?.expenseId ? db.expenses.get(row.expenseId) : undefined),
    [row?.expenseId],
  )
  if (!row) return <div className="px-5 py-8 text-[var(--secondary)]">Not found.</div>
  const machine = machines.find((m) => m.id === row.machineId)
  const cost = row.hours * row.rate

  return (
    <div className="px-5 pb-6">
      <div className="text-[17px] font-semibold">{machine?.name ?? 'Machine'}</div>
      <div className="mt-1 text-[14px] text-[var(--secondary)]">{formatDateFull(row.date)}</div>
      <div className="tabular mt-4 text-[32px] font-semibold">{row.hours} hrs</div>
      <div className="mt-1 text-[15px] text-[var(--secondary)]">
        {formatINR(row.rate)}/hour · {formatINR(cost)}
      </div>
      <div className="mt-4 space-y-2 text-[15px]">
        {row.startTime && (
          <div className="flex justify-between">
            <span className="text-[var(--secondary)]">Time</span>
            <span>
              {row.startTime} – {row.endTime}
              {row.breakHours ? ` · break ${row.breakHours}h` : ''}
            </span>
          </div>
        )}
        {row.operator && (
          <div className="flex justify-between">
            <span className="text-[var(--secondary)]">Operator</span>
            <span>{row.operator}</span>
          </div>
        )}
        {row.expenseId && (
          <div className="text-[13px] text-[var(--income)]">Linked as an expense</div>
        )}
        {row.note && <div>{row.note}</div>}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => openSheet({ name: 'log', logId: row.id })}>
          <Pencil size={16} className="mr-1" /> Edit
        </Button>
        <Button
          variant="danger"
          onClick={() =>
            openSheet({
              name: 'confirm',
              title: 'Delete log?',
              message: row.expenseId
                ? 'The linked expense will also be removed. You can undo for a few seconds.'
                : 'You can undo this for a few seconds.',
              destructive: true,
              onConfirm: () => {
                void undoLog(row, expense)
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
