import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { db } from '@/db/db'
import { officeSendRepo } from '@/db/repositories'
import { PAYMENT_METHODS, type PaymentMethod } from '@/types'
import { todayISO } from '@/utils/dates'

const field = 'h-11 w-full rounded-lg border border-[var(--separator)] bg-[var(--bg-elevated)] px-3 text-[15px] outline-none'

export function OfficeForm({
  sendId,
  onSaved,
}: {
  sendId?: string
  onSaved?: () => void
}) {
  const { settings } = useApp()
  const existing = useLiveQuery(() => (sendId ? db.officeSends.get(sendId) : undefined), [sendId])
  const [amount, setAmount] = useState('')
  const [person, setPerson] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>(settings?.lastPaymentMethod ?? 'UPI')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())
  const [hydrated, setHydrated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (existing && !hydrated) {
    setAmount(String(existing.amount))
    setPerson(existing.person)
    setPayment(existing.paymentMethod ?? 'UPI')
    setNote(existing.note ?? '')
    setDate(existing.date)
    setHydrated(true)
  }

  async function save() {
    const parsed = Number(amount)
    if (!(parsed > 0)) {
      setError('Enter an amount')
      return
    }
    if (!person.trim()) {
      setError('Enter who received the money')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        amount: parsed,
        person: person.trim(),
        paymentMethod: payment,
        date,
        note: note.trim() || undefined,
      }
      if (sendId) {
        const row = await db.officeSends.get(sendId)
        if (row) {
          const next = { ...row, ...payload, updatedAt: new Date().toISOString() }
          if (!payload.note) delete next.note
          await db.officeSends.put(next)
        }
      } else {
        await officeSendRepo.add(payload)
      }
      onSaved?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save office send')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      className="space-y-3 px-4 pb-4"
      onSubmit={(e) => {
        e.preventDefault()
        void save()
      }}
    >
      <p className="text-[13px] text-[var(--secondary)]">
        Record money sent from the office to someone you are responsible for. This stays on the office list and does not change income or expenses.
      </p>
      <label className="block text-[13px] text-[var(--secondary)]">
        Amount
        <input
          className={`${field} mt-1 tabular text-[20px] font-semibold`}
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          autoFocus
          required
        />
      </label>
      <label className="block text-[13px] text-[var(--secondary)]">
        Sent to
        <input
          className={`${field} mt-1`}
          value={person}
          onChange={(e) => setPerson(e.target.value)}
          placeholder="Name"
          required
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[13px] text-[var(--secondary)]">
          Payment
          <select className={`${field} mt-1`} value={payment} onChange={(e) => setPayment(e.target.value as PaymentMethod)}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[13px] text-[var(--secondary)]">
          Date
          <input className={`${field} mt-1`} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>
      <label className="block text-[13px] text-[var(--secondary)]">
        Note
        <input className={`${field} mt-1`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
      </label>
      {error && <p className="text-[13px] text-[var(--expense)]">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="h-11 w-full rounded-lg bg-[var(--accent)] text-[15px] font-semibold text-[var(--on-accent)] disabled:opacity-50"
      >
        {saving ? 'Saving…' : sendId ? 'Save office send' : 'Add office send'}
      </button>
    </form>
  )
}
