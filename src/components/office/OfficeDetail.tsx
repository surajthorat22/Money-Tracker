import { Copy, Pencil, Trash2 } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Button } from '@/components/ui/Button'
import { useUI } from '@/context/UIContext'
import { db } from '@/db/db'
import { officeSendRepo } from '@/db/repositories'
import { formatDateFull } from '@/utils/dates'
import { formatINR } from '@/utils/format'
import { haptic } from '@/utils/haptics'

export function OfficeDetail({ id }: { id: string }) {
  const { openSheet, closeSheet, undoOfficeSend } = useUI()
  const row = useLiveQuery(() => db.officeSends.get(id), [id])
  if (!row) return <div className="px-5 py-8 text-[var(--secondary)]">Not found.</div>

  return (
    <div className="px-5 pb-6">
      <div className="tabular text-[34px] font-semibold tracking-tight">{formatINR(row.amount)}</div>
      <div className="mt-1 text-[17px] font-medium">{row.person}</div>
      <div className="mt-1 text-[14px] text-[var(--secondary)]">{formatDateFull(row.date)}</div>
      <div className="mt-5 space-y-2 text-[15px]">
        {row.paymentMethod && (
          <div className="flex justify-between">
            <span className="text-[var(--secondary)]">Payment</span>
            <span>{row.paymentMethod}</span>
          </div>
        )}
        {row.note && <div>{row.note}</div>}
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2">
        <Button variant="secondary" onClick={() => openSheet({ name: 'office', sendId: row.id })}>
          <Pencil size={16} className="mr-1" /> Edit
        </Button>
        <Button
          variant="secondary"
          onClick={async () => {
            await officeSendRepo.add({
              amount: row.amount,
              person: row.person,
              paymentMethod: row.paymentMethod,
              date: row.date,
              note: row.note,
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
              title: 'Delete office send?',
              message: 'You can undo this for a few seconds.',
              destructive: true,
              onConfirm: () => {
                void undoOfficeSend(row)
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
